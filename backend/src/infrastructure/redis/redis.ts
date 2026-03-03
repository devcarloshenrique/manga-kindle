import { Redis } from 'ioredis';

/**
 * Redis configuration from environment variables
 */
export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null, // Required for BullMQ
};

/**
 * Singleton Redis connection for BullMQ
 */
let redisConnection: Redis | null = null;

export function getRedisConnection(): Redis {
  if (!redisConnection) {
    redisConnection = new Redis(redisConfig);
    
    redisConnection.on('error', (err: Error) => {
      console.error('[Redis] Connection error:', err.message);
    });

    redisConnection.on('connect', () => {
      console.log('[Redis] Connected to', `${redisConfig.host}:${redisConfig.port}`);
    });
  }
  return redisConnection;
}

/**
 * Close Redis connection (for graceful shutdown)
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisConnection) {
    await redisConnection.quit();
    redisConnection = null;
  }
}
