import { Redis } from '@upstash/redis';

// Initialize Redis only if credentials are provided
const redis = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
  ? new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN
    })
  : null;

// For now, let's export a simple in-memory store if Redis is not configured
const inMemoryStore = new Map<string, any>();

export const kv = redis || {
  get: async (key: string) => inMemoryStore.get(key),
  set: async (key: string, value: any) => {
    inMemoryStore.set(key, value);
    return 'OK';
  },
  del: async (key: string) => {
    inMemoryStore.delete(key);
    return 1;
  },
  exists: async (key: string) => inMemoryStore.has(key) ? 1 : 0,
};
