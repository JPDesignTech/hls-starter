import { Redis } from '@upstash/redis';

// Initialize Redis only if credentials are provided
const redis = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
  ? new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN
    })
  : null;

// Track if Redis is available (for logging)
let redisAvailable = redis !== null;
let redisErrorCount = 0;
const MAX_REDIS_ERRORS_BEFORE_FALLBACK = 3;

// For now, let's export a simple in-memory store if Redis is not configured
const inMemoryStore = new Map<string, unknown>();

// Log Redis status
if (redis) {
  console.log('[Redis] Connected to Upstash Redis');
} else {
  console.warn('[Redis] No Redis credentials found. Using in-memory store (data will not persist).');
}

// Helper function to handle Redis errors
function handleRedisError(operation: string, error: unknown): void {
  redisErrorCount++;
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`[Redis] Error during ${operation}:`, errorMessage);
  
  if (redisErrorCount >= MAX_REDIS_ERRORS_BEFORE_FALLBACK && redisAvailable) {
    console.warn(`[Redis] Multiple errors detected (${redisErrorCount}). Falling back to in-memory store.`);
    redisAvailable = false;
  }
}

// Create wrapper that handles errors gracefully
const createRedisWrapper = () => {
  if (!redis) {
    return null;
  }

  return {
    get: async (key: string) => {
      if (!redisAvailable) {
        return inMemoryStore.get(key);
      }
      try {
        const result = await redis.get(key);
        redisErrorCount = 0; // Reset error count on success
        return result;
      } catch (error) {
        handleRedisError(`get(${key})`, error);
        return inMemoryStore.get(key);
      }
    },
    set: async (key: string, value: unknown) => {
      if (!redisAvailable) {
        inMemoryStore.set(key, value);
        return 'OK';
      }
      try {
        const result = await redis.set(key, value);
        redisErrorCount = 0; // Reset error count on success
        return result;
      } catch (error) {
        handleRedisError(`set(${key})`, error);
        inMemoryStore.set(key, value);
        return 'OK';
      }
    },
    setex: async (key: string, seconds: number, value: unknown) => {
      if (!redisAvailable) {
        inMemoryStore.set(key, value);
        return 'OK';
      }
      try {
        const result = await redis.setex(key, seconds, value);
        redisErrorCount = 0; // Reset error count on success
        return result;
      } catch (error) {
        handleRedisError(`setex(${key}, ${seconds}s)`, error);
        inMemoryStore.set(key, value);
        // In-memory store doesn't support TTL, but we'll store it anyway
        return 'OK';
      }
    },
    del: async (key: string) => {
      if (!redisAvailable) {
        const existed = inMemoryStore.has(key);
        inMemoryStore.delete(key);
        return existed ? 1 : 0;
      }
      try {
        const result = await redis.del(key);
        redisErrorCount = 0; // Reset error count on success
        return result;
      } catch (error) {
        handleRedisError(`del(${key})`, error);
        const existed = inMemoryStore.has(key);
        inMemoryStore.delete(key);
        return existed ? 1 : 0;
      }
    },
    exists: async (key: string) => {
      if (!redisAvailable) {
        return inMemoryStore.has(key) ? 1 : 0;
      }
      try {
        const result = await redis.exists(key);
        redisErrorCount = 0; // Reset error count on success
        return result;
      } catch (error) {
        handleRedisError(`exists(${key})`, error);
        return inMemoryStore.has(key) ? 1 : 0;
      }
    },
  };
};

export const kv = createRedisWrapper() ?? {
  get: async (key: string) => inMemoryStore.get(key),
  set: async (key: string, value: unknown) => {
    inMemoryStore.set(key, value);
    return 'OK';
  },
  setex: async (key: string, seconds: number, value: unknown) => {
    inMemoryStore.set(key, value);
    // In-memory store doesn't support TTL, but we'll store it anyway
    return 'OK';
  },
  del: async (key: string) => {
    inMemoryStore.delete(key);
    return 1;
  },
  exists: async (key: string) => inMemoryStore.has(key) ? 1 : 0,
};
