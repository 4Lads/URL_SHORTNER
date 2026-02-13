import { createClient, RedisClientType } from 'redis';
import config from './env';

// Create Redis client
export const redisClient: RedisClientType = createClient({
  url: config.redisUrl,
  socket: {
    reconnectStrategy: (retries: number) => {
      if (retries > 10) {
        console.error('❌ Redis reconnection failed after 10 attempts');
        return new Error('Redis reconnection failed');
      }
      // Exponential backoff: 50ms, 100ms, 200ms, ...
      return Math.min(retries * 50, 3000);
    },
  },
});

// Error handling
redisClient.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Redis connected');
});

redisClient.on('reconnecting', () => {
  console.log('🔄 Redis reconnecting...');
});

redisClient.on('ready', () => {
  console.log('✅ Redis client ready');
});

// Connect to Redis
export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error);
    throw error;
  }
};

// Cache helper functions
export const cacheHelpers = {
  /**
   * Get a value from cache
   */
  get: async (key: string): Promise<string | null> => {
    try {
      return await redisClient.get(key);
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  /**
   * Set a value in cache with optional TTL
   */
  set: async (key: string, value: string, ttl?: number): Promise<void> => {
    try {
      if (ttl) {
        await redisClient.setEx(key, ttl, value);
      } else {
        await redisClient.set(key, value);
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  },

  /**
   * Delete a key from cache
   */
  del: async (key: string): Promise<void> => {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  },

  /**
   * Check if key exists
   */
  exists: async (key: string): Promise<boolean> => {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  },

  /**
   * Increment a counter (for rate limiting)
   */
  incr: async (key: string, ttl?: number): Promise<number> => {
    try {
      const value = await redisClient.incr(key);
      if (ttl && value === 1) {
        await redisClient.expire(key, ttl);
      }
      return value;
    } catch (error) {
      console.error('Cache incr error:', error);
      return 0;
    }
  },
};

// Graceful shutdown
export const closeRedis = async (): Promise<void> => {
  await redisClient.quit();
  console.log('Redis connection closed');
};

export default redisClient;
