/**
 * BullMQ Dashboard - Standalone script to monitor KCC conversion jobs
 * 
 * Usage: npm run bullmq:dashboard
 * 
 * This script starts a web-based dashboard for monitoring BullMQ queues.
 * It connects to the same Redis instance as the main application.
 * 
 * Prerequisites:
 * npm install @bull-board/api @bull-board/express
 */

import express from 'express';
import { Queue } from 'bullmq';
import { redisConfig } from '../infrastructure/redis/redis.js';

const PORT = process.env.BULLBOARD_PORT || 3001;

async function startDashboard() {
  console.log('🚀 Starting BullMQ Dashboard...');
  
  // Dynamically import bull-board packages
  let createBullBoard: any;
  let BullMQAdapter: any;
  let ExpressAdapter: any;
  
  try {
    const bullBoardApi = await import('@bull-board/api');
    const bullBoardAdapter = await import('@bull-board/api/bullMQAdapter.js');
    const bullBoardExpress = await import('@bull-board/express');
    
    createBullBoard = bullBoardApi.createBullBoard;
    BullMQAdapter = bullBoardAdapter.BullMQAdapter;
    ExpressAdapter = bullBoardExpress.ExpressAdapter;
  } catch (error) {
    console.error('❌ @bull-board packages not installed.');
    console.log('');
    console.log('Install them with:');
    console.log('  npm install @bull-board/api @bull-board/express');
    console.log('');
    process.exit(1);
  }

  // Create queue instance for the dashboard
  const kccQueue = new Queue('kcc-conversion', {
    connection: {
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password,
      maxRetriesPerRequest: null,
    },
  });

  // Test connection
  try {
    await kccQueue.getJobCounts();
    console.log('✅ Connected to Redis');
  } catch (error) {
    console.error('❌ Could not connect to Redis. Make sure Redis is running.');
    console.log('   Run: docker-compose up -d');
    process.exit(1);
  }

  // Create Express adapter for bull-board
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/');

  // Create Bull Board
  createBullBoard({
    queues: [new BullMQAdapter(kccQueue)],
    serverAdapter,
  });

  const app = express();

  // Mount the dashboard
  app.use('/', serverAdapter.getRouter());

  // Health check endpoint
  app.get('/health', async (_req: express.Request, res: express.Response) => {
    const counts = await kccQueue.getJobCounts();
    res.json({
      status: 'ok',
      redis: {
        host: redisConfig.host,
        port: redisConfig.port,
      },
      queue: 'kcc-conversion',
      jobs: counts,
    });
  });

  app.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                   BullMQ Dashboard                         ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║  🌐 Dashboard: http://localhost:${PORT}                       ║`);
    console.log(`║  📊 Queue: kcc-conversion                                  ║`);
    console.log(`║  🔗 Redis: ${redisConfig.host}:${redisConfig.port}                           ║`);
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log('║  Features:                                                 ║');
    console.log('║  • View waiting, active, completed, and failed jobs        ║');
    console.log('║  • Retry failed jobs                                       ║');
    console.log('║  • Clean old jobs                                          ║');
    console.log('║  • View job details and progress                           ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('Press Ctrl+C to stop the dashboard');
  });
}

startDashboard().catch((error) => {
  console.error('Failed to start dashboard:', error);
  process.exit(1);
});
