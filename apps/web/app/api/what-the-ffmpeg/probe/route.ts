import { type NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/redis';
import { createStorage } from '@/lib/gcs-config';
import crypto from 'crypto';
import type { FfprobeData, FfprobeFrame } from '@/lib/types/ffmpeg';

interface ProbeOptions {
  showFrames?: boolean;
  showPackets?: boolean;
  page?: number;
  pageSize?: number;
  [key: string]: any;
}

interface FileMetadata {
  filename: string;
  [key: string]: any;
}

interface ProbeResponse {
  frames?: FfprobeFrame[];
  packets?: any[];
  pagination?: {
    frames?: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
    packets?: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
  [key: string]: any;
}

// Helper to hash options for cache key
function hashOptions(options: unknown): string {
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

    const ffprobeServiceUrl = process.env.FFPROBE_SERVICE_URL ?? process.env.NEXT_PUBLIC_FFPROBE_SERVICE_URL;
    
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
      const fileMetadata = await kv.get(`wtf:file:${fileId}`) as FileMetadata | null;
      if (!fileMetadata) {
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        );
      }
      targetUrl = await getFileUrl(fileId, fileMetadata.filename);
    }

    // Extract pagination parameters
    const page = options.page ?? 0;
    const pageSize = options.pageSize ?? 100;
    const needsPagination =
      (options.showFrames ?? options.showPackets) &&
      (options.page !== undefined || options.pageSize !== undefined);

    // Create cache key (without pagination params for full data cache)
    const cacheOptions = { ...options };
    delete cacheOptions.page;
    delete cacheOptions.pageSize;
    const optionsHash = hashOptions(cacheOptions);
    const cacheKey = `wtf:probe:${fileId ?? hashOptions(targetUrl)}:${optionsHash}`;

    // Check cache first
    const cached = await kv.get(cacheKey) as ProbeResponse | null;
    if (cached) {
      let responseData: ProbeResponse = cached;
      
      // Apply pagination if needed
      if (needsPagination && cached) {
        responseData = { ...cached };
        
        if (options.showFrames && Array.isArray(cached.frames)) {
          const totalFrames = cached.frames.length;
          const start = page * pageSize;
          const end = start + pageSize;
          responseData.frames = cached.frames.slice(start, end);
          responseData.pagination = {
            frames: {
              page,
              pageSize,
              total: totalFrames,
              totalPages: Math.ceil(totalFrames / pageSize),
            },
          };
        }
        
        if (options.showPackets && Array.isArray(cached.packets)) {
          const totalPackets = cached.packets.length;
          const start = page * pageSize;
          const end = start + pageSize;
          responseData.packets = cached.packets.slice(start, end);
          responseData.pagination = {
            ...responseData.pagination,
            packets: {
              page,
              pageSize,
              total: totalPackets,
              totalPages: Math.ceil(totalPackets / pageSize),
            },
          };
        }
      }

      return NextResponse.json({
        success: true,
        data: responseData,
        cached: true,
        metadata: {
          fileId,
          timestamp: new Date().toISOString(),
          paginated: needsPagination,
        },
      });
    }

    // Map options to FFProbe service format
    const detailed = options.showFrames ?? options.showPackets ?? false;

    // Call Cloud Run FFProbe service (reusing existing pattern)
    const response = await fetch(`${ffprobeServiceUrl}/probe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: targetUrl,
        detailed,
        showFrames: options.showFrames ?? false,
        showPackets: options.showPackets ?? false,
      }),
      signal: AbortSignal.timeout(60000), // 60 second timeout
    });

    if (!response.ok) {
      throw new Error(`FFprobe service error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error ?? 'FFprobe service failed');
    }

    const probeData = result.data;

    // Cache full result (TTL: 1 hour for basic, 24 hours for detailed)
    const ttl = detailed ? 86400 : 3600; // 24 hours or 1 hour
    await kv.setex(cacheKey, ttl, probeData);

    // Apply pagination to response if needed
    let responseData = probeData;
    if (needsPagination) {
      responseData = { ...probeData };
      
      if (options.showFrames && Array.isArray(probeData.frames)) {
        const totalFrames = probeData.frames.length;
        const start = page * pageSize;
        const end = start + pageSize;
        responseData.frames = probeData.frames.slice(start, end);
        responseData.pagination = {
          frames: {
            page,
            pageSize,
            total: totalFrames,
            totalPages: Math.ceil(totalFrames / pageSize),
          },
        };
      }
      
      if (options.showPackets && Array.isArray(probeData.packets)) {
        const totalPackets = probeData.packets.length;
        const start = page * pageSize;
        const end = start + pageSize;
        responseData.packets = probeData.packets.slice(start, end);
        responseData.pagination = {
          ...responseData.pagination,
          packets: {
            page,
            pageSize,
            total: totalPackets,
            totalPages: Math.ceil(totalPackets / pageSize),
          },
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      cached: false,
      metadata: {
        fileId,
        timestamp: new Date().toISOString(),
        options: cacheOptions,
        paginated: needsPagination,
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

