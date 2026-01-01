import { NextResponse } from 'next/server';
import { kv } from '@/lib/redis';

export async function GET() {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      redis: {
        configured: !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN,
        connected: false,
        error: null as string | null,
      },
    };

    // Test Redis connection
    if (health.redis.configured) {
      try {
        const testKey = `health:check:${Date.now()}`;
        await kv.setex(testKey, 10, 'test'); // Set with 10 second TTL
        const value = await kv.get(testKey);
        await kv.del(testKey);
        
        if (value === 'test') {
          health.redis.connected = true;
        } else {
          health.redis.error = 'Redis test failed - value mismatch';
        }
      } catch (error) {
        health.redis.error = error instanceof Error ? error.message : String(error);
        health.status = 'degraded';
      }
    } else {
      health.redis.error = 'Redis not configured (using in-memory store)';
      health.status = 'degraded';
    }

    const statusCode = health.status === 'ok' ? 200 : 503;
    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
