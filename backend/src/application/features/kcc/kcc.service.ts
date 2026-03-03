import { spawn, type ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import type {
  KccConversionOptions,
  KccProfile,
  KccOutputFormat,
} from '../../../domain/entities/kcc.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to KCC binary (relative to project root)
const KCC_BINARY_PATH = path.resolve(__dirname, '../../../../bin/kcc/kcc_c2e_9.4.3.exe');

// Directories
const DOWNLOADS_DIR = path.resolve(__dirname, '../../../../downloads');
const CONVERTED_DIR = path.resolve(__dirname, '../../../../converted');

export interface KccExecutionCallbacks {
  onStdout?: (data: string) => void;
  onStderr?: (data: string) => void;
  onProgress?: (progress: number) => void;
  onComplete?: (outputPath: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Validates and sanitizes input paths to prevent path traversal
 */
export function sanitizePath(inputPath: string): string {
  // Resolve the path
  const resolved = path.resolve(DOWNLOADS_DIR, inputPath);
  
  // Ensure it's within downloads directory
  if (!resolved.startsWith(DOWNLOADS_DIR)) {
    throw new Error(`Path traversal detected: ${inputPath}`);
  }
  
  return resolved;
}

/**
 * Validates that all input paths exist
 */
export async function validateInputPaths(paths: string[]): Promise<void> {
  for (const p of paths) {
    const sanitized = sanitizePath(p);
    try {
      const stat = await fs.stat(sanitized);
      if (!stat.isDirectory()) {
        throw new Error(`Path is not a directory: ${p}`);
      }
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error(`Path does not exist: ${p}`);
      }
      throw err;
    }
  }
}

/**
 * Ensures converted directory exists
 */
export async function ensureConvertedDir(): Promise<void> {
  await fs.mkdir(CONVERTED_DIR, { recursive: true });
}

/**
 * Builds command line arguments for KCC
 */
export function buildKccArgs(
  inputPaths: string[],
  profile: KccProfile,
  outputFormat: KccOutputFormat,
  options: KccConversionOptions = {},
  mergeIntoSingleVolume: boolean = false,
): string[] {
  const args: string[] = [];
  
  // Profile
  args.push('-p', profile);
  
  // Output format
  args.push('-f', outputFormat);
  
  // Output directory
  args.push('-o', CONVERTED_DIR);
  
  // Manga style (right-to-left)
  if (options.mangaStyle) {
    args.push('-m');
  }
  
  // High quality
  if (options.hq) {
    args.push('--hq');
  }
  
  // Two panel mode
  if (options.twoPanel) {
    args.push('-2');
  }
  
  // Webtoon mode
  if (options.webtoon) {
    args.push('-w');
  }
  
  // Upscale
  if (options.upscale) {
    args.push('-u');
  }
  
  // Stretch
  if (options.stretch) {
    args.push('-s');
  }
  
  // Splitter (split double pages)
  if (options.splitter) {
    args.push('-r');
  }
  
  // Gamma correction
  if (options.gamma !== undefined) {
    args.push('-g', options.gamma.toString());
  }
  
  // Cropping
  if (options.cropping) {
    args.push('-c');
    if (options.croppingPower !== undefined) {
      args.push('--croppingpower', options.croppingPower.toString());
    }
  }
  
  // Inter-panel crop
  if (options.interPanelCrop) {
    args.push('--interpanelcrop');
  }
  
  // Force color
  if (options.forceColor) {
    args.push('--forcecolor');
  }
  
  // Force PNG
  if (options.forcePng) {
    args.push('--forcepng');
  }
  
  // MozJPEG
  if (options.mozJpeg) {
    args.push('--mozjpeg');
  }
  
  // JPEG quality
  if (options.jpegQuality !== undefined) {
    args.push('-q', options.jpegQuality.toString());
  }
  
  // Delete source
  if (options.deleteSource) {
    args.push('-d');
  }
  
  // Title
  if (options.title) {
    args.push('-t', options.title);
  }
  
  // Author
  if (options.author) {
    args.push('-a', options.author);
  }
  
  // Batch split
  if (options.batchSplit) {
    args.push('--batchsplit');
  }
  
  // File fusion (merge volumes)
  if (mergeIntoSingleVolume || options.fileFusion) {
    args.push('--filefusion');
    // Target size defaults to 400MB when merging
    const targetSize = options.targetSize || 400;
    args.push('--targetsize', targetSize.toString());
  }
  
  // Custom dimensions
  if (options.customWidth !== undefined) {
    args.push('--customwidth', options.customWidth.toString());
  }
  if (options.customHeight !== undefined) {
    args.push('--customheight', options.customHeight.toString());
  }
  
  // Add input paths (sanitized)
  for (const inputPath of inputPaths) {
    args.push(sanitizePath(inputPath));
  }
  
  return args;
}

/**
 * Parses progress from KCC stdout
 * KCC outputs progress like: "Converting file X of Y..."
 */
export function parseProgress(stdout: string): number | null {
  // Try to match "Converting X of Y" pattern
  const match = stdout.match(/Converting.*?(\d+)\s+of\s+(\d+)/i);
  if (match) {
    const current = parseInt(match[1], 10);
    const total = parseInt(match[2], 10);
    if (total > 0) {
      return Math.round((current / total) * 100);
    }
  }
  
  // Try percentage pattern
  const percentMatch = stdout.match(/(\d+)%/);
  if (percentMatch) {
    return parseInt(percentMatch[1], 10);
  }
  
  return null;
}

/**
 * Active processes map for cancellation support
 */
const activeProcesses = new Map<string, ChildProcess>();

/**
 * Executes KCC binary with the given arguments
 */
export function executeKcc(
  jobId: string,
  inputPaths: string[],
  profile: KccProfile,
  outputFormat: KccOutputFormat,
  options: KccConversionOptions = {},
  mergeIntoSingleVolume: boolean = false,
  callbacks: KccExecutionCallbacks = {},
): Promise<string> {
  return new Promise((resolve, reject) => {
    const args = buildKccArgs(inputPaths, profile, outputFormat, options, mergeIntoSingleVolume);
    
    console.log(`[KCC] Executing: ${KCC_BINARY_PATH} ${args.join(' ')}`);
    
    const process = spawn(KCC_BINARY_PATH, args, {
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    
    activeProcesses.set(jobId, process);
    
    let stdout = '';
    let stderr = '';
    let outputPath = '';
    
    process.stdout?.on('data', (data: Buffer) => {
      const chunk = data.toString();
      stdout += chunk;
      callbacks.onStdout?.(chunk);
      
      // Parse progress
      const progress = parseProgress(chunk);
      if (progress !== null) {
        callbacks.onProgress?.(progress);
      }
      
      // Try to detect output file path
      const outputMatch = chunk.match(/Saving:\s*(.+\.(epub|mobi|cbz|kfx))/i);
      if (outputMatch) {
        outputPath = outputMatch[1].trim();
      }
    });
    
    process.stderr?.on('data', (data: Buffer) => {
      const chunk = data.toString();
      stderr += chunk;
      callbacks.onStderr?.(chunk);
    });
    
    process.on('error', (err) => {
      activeProcesses.delete(jobId);
      callbacks.onError?.(err);
      reject(err);
    });
    
    process.on('close', (code) => {
      activeProcesses.delete(jobId);
      
      if (code === 0) {
        // Try to find output file if not detected from stdout
        if (!outputPath) {
          outputPath = path.join(CONVERTED_DIR, `output.${outputFormat.toLowerCase()}`);
        }
        callbacks.onComplete?.(outputPath);
        resolve(outputPath);
      } else {
        const error = new Error(`KCC exited with code ${code}: ${stderr || stdout}`);
        callbacks.onError?.(error);
        reject(error);
      }
    });
  });
}

/**
 * Cancels a running KCC process
 */
export function cancelKccProcess(jobId: string): boolean {
  const process = activeProcesses.get(jobId);
  if (process) {
    process.kill('SIGTERM');
    activeProcesses.delete(jobId);
    return true;
  }
  return false;
}

/**
 * Gets the converted directory path
 */
export function getConvertedDir(): string {
  return CONVERTED_DIR;
}

/**
 * Gets the downloads directory path
 */
export function getDownloadsDir(): string {
  return DOWNLOADS_DIR;
}
