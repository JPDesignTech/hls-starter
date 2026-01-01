import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/redis';
import { createStorage } from '@/lib/gcs-config';
import crypto from 'crypto';

// Helper to hash options for cache key
function hashOptions(options: any): string {
  return crypto.createHash('md5').update(JSON.stringify(options)).digest('hex').substring(0, 8);
}

// Helper to get file URL from fileId
async function getFileUrl(fileId: string, filename: string): Promise<string> {
  const bucketName = process.env.GCS_BUCKET_NAME;
  if (!bucketName) {
    throw new Error('GCS_BUCKET_NAME not configured');
  }
  
  // Construct GCS URL
  // filename format: {videoId}/original.{ext}
  return `https://storage.googleapis.com/${bucketName}/${filename}`;
}

export async function POST(request: NextRequest) {
  try {
    const { fileId, fileUrl, options = {} } = await request.json();

    if (!fileId && !fileUrl) {
      return NextResponse.json(
        { error: 'Either fileId or fileUrl is required' },
        { status: 400 }
      );
    }

    const ffprobeServiceUrl = process.env.FFPROBE_SERVICE_URL || process.env.NEXT_PUBLIC_FFPROBE_SERVICE_URL;
    
    if (!ffprobeServiceUrl) {
      return NextResponse.json(
        { error: 'FFprobe service URL not configured. Please set FFPROBE_SERVICE_URL environment variable.' },
        { status: 500 }
      );
    }

    // Get file URL if fileId provided
    let targetUrl = fileUrl;
    if (!targetUrl && fileId) {
      // Get file metadata from Redis
      const fileMetadata = await kv.get(`wtf:file:${fileId}`);
      if (!fileMetadata) {
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        );
      }
      targetUrl = await getFileUrl(fileId, (fileMetadata as any).filename);
    }

    // Create cache key
    const optionsHash = hashOptions(options);
    const cacheKey = `wtf:probe:${fileId || hashOptions(targetUrl)}:${optionsHash}`;

    // Check cache first
    const cached = await kv.get(cacheKey);
    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
        cached: true,
        metadata: {
          fileId,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Map options to FFProbe service format
    const detailed = options.showFrames || options.showPackets || false;

    // Call Cloud Run FFProbe service (reusing existing pattern)
    const response = await fetch(`${ffprobeServiceUrl}/probe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: targetUrl,
        detailed,
        showFrames: options.showFrames || false,
        showPackets: options.showPackets || false,
      }),
      signal: AbortSignal.timeout(60000), // 60 second timeout
    });

    if (!response.ok) {
      throw new Error(`FFprobe service error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'FFprobe service failed');
    }

    const probeData = result.data;

    // Cache result (TTL: 1 hour for basic, 24 hours for detailed)
    const ttl = detailed ? 86400 : 3600; // 24 hours or 1 hour
    await kv.setex(cacheKey, ttl, probeData);

    return NextResponse.json({
      success: true,
      data: probeData,
      cached: false,
      metadata: {
        fileId,
        timestamp: new Date().toISOString(),
        options,
      },
    });
  } catch (error) {
    console.error('[WTF Probe] Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to probe file' 
      },
      { status: 500 }
    );
  }
}

