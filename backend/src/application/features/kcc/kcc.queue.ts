import { Queue, Worker, Job } from 'bullmq';
import { redisConfig } from '../../../infrastructure/redis/redis.js';
import {
  executeKcc,
  validateInputPaths,
  ensureConvertedDir,
  cancelKccProcess,
  sanitizePath,
} from './kcc.service.js';
import type {
  KccJob,
  KccJobStatus,
  KccConversionRequest,
} from '../../../domain/entities/kcc.js';

const QUEUE_NAME = 'kcc-conversions';

// In-memory job state store (for stdout/stderr which can be large)
const jobStateStore = new Map<string, Partial<KccJob>>();

// Track if Redis is available
let redisAvailable = false;

/**
 * Initialize the KCC queue
 */
let queue: Queue | null = null;

export function getKccQueue(): Queue | null {
  if (!redisAvailable) {
    return null;
  }
  if (!queue) {
    queue = new Queue(QUEUE_NAME, {
      connection: redisConfig,
      defaultJobOptions: {
        removeOnComplete: false,
        removeOnFail: false,
        attempts: 1, // No retries for conversions
      },
    });
  }
  return queue;
}

/**
 * Check if Redis/BullMQ is available
 */
export function isQueueAvailable(): boolean {
  return redisAvailable;
}

/**
 * Initialize the KCC worker
 */
let worker: Worker | null = null;
let workerStarting = false;

export async function startKccWorker(): Promise<Worker | null> {
  if (worker) {
    return worker;
  }
  
  if (workerStarting) {
    return null;
  }
  
  workerStarting = true;
  
  try {
    const newWorker = new Worker(
      QUEUE_NAME,
      async (job: Job<KccConversionRequest & { jobId: string }>) => {
        const { jobId, chapters, mergeIntoSingleVolume, outputFormat, profile, options } = job.data;
        
        console.log(`[KCC Worker] Processing job ${jobId}`);
        
        // Update job state
        updateJobState(jobId, {
          status: 'processing',
          startedAt: new Date(),
          progress: 0,
        });
        
        try {
          // Validate inputs
          await validateInputPaths(chapters);
          await ensureConvertedDir();
          
          // Sanitize all paths
          const sanitizedPaths = chapters.map(p => sanitizePath(p));
          
          // Execute KCC
          const outputPath = await executeKcc(
            jobId,
            sanitizedPaths,
            profile,
            outputFormat,
            options || {},
            mergeIntoSingleVolume || false,
            {
              onProgress: (progress) => {
                updateJobState(jobId, { progress });
                job.updateProgress(progress);
              },
              onStdout: (data) => {
                const current = jobStateStore.get(jobId);
                const stdout = (current?.stdout || '') + data;
                updateJobState(jobId, { stdout });
              },
              onStderr: (data) => {
                const current = jobStateStore.get(jobId);
                const stderr = (current?.stderr || '') + data;
                updateJobState(jobId, { stderr });
              },
            },
          );
          
          // Update completed state
          updateJobState(jobId, {
            status: 'completed',
            progress: 100,
            finishedAt: new Date(),
            outputPath,
          });
          
          console.log(`[KCC Worker] Job ${jobId} completed: ${outputPath}`);
          
          return { outputPath };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          
          updateJobState(jobId, {
            status: 'failed',
            finishedAt: new Date(),
            error: errorMessage,
          });
          
          console.error(`[KCC Worker] Job ${jobId} failed:`, errorMessage);
          throw error;
        }
      },
      {
        connection: redisConfig,
        concurrency: 1, // Process one conversion at a time
      },
    );
    
    // Wait for worker to be ready
    await newWorker.waitUntilReady();
    
    newWorker.on('error', (err) => {
      // Don't log connection errors repeatedly
      if ((err as NodeJS.ErrnoException).code !== 'ECONNREFUSED') {
        console.error('[KCC Worker] Error:', err);
      }
    });
    
    worker = newWorker;
    redisAvailable = true;
    console.log('[KCC Worker] Started and connected to Redis');
    
    return worker;
  } catch (err) {
    workerStarting = false;
    redisAvailable = false;
    // Silently fail - Redis not available
    console.warn('[KCC] Redis not available, KCC queue disabled. Start Redis with: docker-compose up -d');
    return null;
  }
}

/**
 * Updates the in-memory job state
 */
function updateJobState(jobId: string, update: Partial<KccJob>): void {
  const current = jobStateStore.get(jobId) || {};
  jobStateStore.set(jobId, { ...current, ...update });
}

/**
 * Creates a new conversion job
 */
export async function createConversionJob(request: KccConversionRequest): Promise<string> {
  const queue = getKccQueue();
  if (!queue) {
    throw new Error('KCC queue not available. Please start Redis with: docker-compose up -d');
  }
  
  const jobId = `kcc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  
  // Validate paths before queueing
  await validateInputPaths(request.chapters);
  
  // Initialize job state
  const initialState: Partial<KccJob> = {
    id: jobId,
    status: 'queued',
    progress: 0,
    stdout: '',
    stderr: '',
    createdAt: new Date(),
    inputPaths: request.chapters,
    profile: request.profile,
    outputFormat: request.outputFormat,
    options: request.options || {},
    mergeIntoSingleVolume: request.mergeIntoSingleVolume || false,
  };
  
  jobStateStore.set(jobId, initialState);
  
  // Add to queue
  await queue.add('convert', {
    ...request,
    jobId,
  }, {
    jobId,
  });
  
  console.log(`[KCC Queue] Job ${jobId} queued`);
  
  return jobId;
}

/**
 * Gets a job by ID
 */
export async function getJob(jobId: string): Promise<KccJob | null> {
  const queue = getKccQueue();
  if (!queue) {
    // Return from in-memory state only
    const state = jobStateStore.get(jobId);
    if (!state) return null;
    return state as KccJob;
  }
  
  const bullJob = await queue.getJob(jobId);
  
  if (!bullJob) {
    return null;
  }
  
  const state = jobStateStore.get(jobId) || {};
  const bullState = await bullJob.getState();
  
  // Map BullMQ state to our status
  let status: KccJobStatus = 'queued';
  if (bullState === 'active') status = 'processing';
  else if (bullState === 'completed') status = 'completed';
  else if (bullState === 'failed') status = 'failed';
  else if (bullState === 'waiting') status = 'queued';
  
  // Override with our state if we have more specific info
  if (state.status) {
    status = state.status;
  }
  
  return {
    id: jobId,
    status,
    progress: state.progress ?? 0,
    stdout: state.stdout ?? '',
    stderr: state.stderr ?? '',
    createdAt: state.createdAt ?? new Date(bullJob.timestamp),
    startedAt: state.startedAt,
    finishedAt: state.finishedAt,
    inputPaths: bullJob.data.chapters,
    outputPath: state.outputPath,
    profile: bullJob.data.profile,
    outputFormat: bullJob.data.outputFormat,
    options: bullJob.data.options || {},
    mergeIntoSingleVolume: bullJob.data.mergeIntoSingleVolume || false,
    error: state.error,
  };
}

/**
 * Lists all jobs
 */
export async function listJobs(): Promise<KccJob[]> {
  const queue = getKccQueue();
  
  if (!queue) {
    // Return only in-memory jobs if Redis is not available
    const results: KccJob[] = [];
    for (const [jobId, state] of jobStateStore.entries()) {
      results.push({
        id: jobId,
        status: state.status || 'queued',
        progress: state.progress || 0,
        createdAt: state.createdAt || new Date(),
        startedAt: state.startedAt,
        finishedAt: state.finishedAt,
        inputPaths: state.inputPaths || [],
        outputPath: state.outputPath,
        profile: state.profile || 'KPW5',
        outputFormat: state.outputFormat || 'EPUB',
        options: state.options || {},
        mergeIntoSingleVolume: state.mergeIntoSingleVolume || false,
        error: state.error,
        stdout: state.stdout || '',
        stderr: state.stderr || '',
      });
    }
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  const [waiting, active, completed, failed] = await Promise.all([
    queue.getJobs(['waiting']),
    queue.getJobs(['active']),
    queue.getJobs(['completed']),
    queue.getJobs(['failed']),
  ]);
  
  const allJobs = [...waiting, ...active, ...completed, ...failed];
  const results: KccJob[] = [];
  
  for (const bullJob of allJobs) {
    const job = await getJob(bullJob.id as string);
    if (job) {
      results.push(job);
    }
  }
  
  // Sort by creation date (newest first)
  results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return results;
}

/**
 * Gets job progress
 */
export async function getJobProgress(jobId: string): Promise<{ progress: number; status: KccJobStatus } | null> {
  const job = await getJob(jobId);
  if (!job) return null;
  
  return {
    progress: job.progress,
    status: job.status,
  };
}

/**
 * Cancels a job
 */
export async function cancelJob(jobId: string): Promise<boolean> {
  const queue = getKccQueue();
  
  // If Redis is not available, just update the in-memory state
  if (!queue) {
    const state = jobStateStore.get(jobId);
    if (!state) {
      return false;
    }
    
    if (state.status === 'processing') {
      cancelKccProcess(jobId);
    }
    
    updateJobState(jobId, {
      status: 'cancelled',
      finishedAt: new Date(),
    });
    
    console.log(`[KCC Queue] Job ${jobId} cancelled (in-memory only)`);
    return true;
  }
  
  const bullJob = await queue.getJob(jobId);
  
  if (!bullJob) {
    return false;
  }
  
  const state = await bullJob.getState();
  
  if (state === 'active') {
    // Kill the running process
    cancelKccProcess(jobId);
  }
  
  // Remove from queue
  await bullJob.remove();
  
  // Update state
  updateJobState(jobId, {
    status: 'cancelled',
    finishedAt: new Date(),
  });
  
  console.log(`[KCC Queue] Job ${jobId} cancelled`);
  
  return true;
}

/**
 * Removes a job from history
 */
export async function removeJob(jobId: string): Promise<boolean> {
  const queue = getKccQueue();
  
  // If Redis is available, also remove from the queue
  if (queue) {
    const bullJob = await queue.getJob(jobId);
    if (bullJob) {
      await bullJob.remove();
    }
  }
  
  jobStateStore.delete(jobId);
  
  return true;
}

/**
 * Closes the queue and worker
 */
export async function closeKccQueue(): Promise<void> {
  if (worker) {
    await worker.close();
    worker = null;
  }
  if (queue) {
    await queue.close();
    queue = null;
  }
}
