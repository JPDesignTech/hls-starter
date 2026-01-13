import { type NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/redis';

// Helper to get file URL from fileId
async function getFileUrl(fileId: string, filename: string): Promise<string> {
  const bucketName = process.env.GCS_BUCKET_NAME;
  if (!bucketName) {
    throw new Error('GCS_BUCKET_NAME not configured');
  }
  return `https://storage.googleapis.com/${bucketName}/${filename}`;
}

export async function POST(request: NextRequest) {
  try {
    const { fileId, frameNumber, time, streamIndex = 0 } = await request.json();

    if (!fileId) {
      return NextResponse.json(
        { error: 'fileId is required' },
        { status: 400 }
      );
    }

    // Get file metadata from Redis
    const fileMetadata = await kv.get(`wtf:file:${fileId}`) as { filename: string } | null;
    if (!fileMetadata) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    const fileUrl = await getFileUrl(fileId, fileMetadata.filename);
    const ffprobeServiceUrl = process.env.FFPROBE_SERVICE_URL ?? process.env.NEXT_PUBLIC_FFPROBE_SERVICE_URL;
    
    if (!ffprobeServiceUrl) {
      return NextResponse.json(
        { error: 'FFprobe service URL not configured' },
        { status: 500 }
      );
    }

    // Call Cloud Run service to extract frame
    const response = await fetch(`${ffprobeServiceUrl}/extract-frame`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: fileUrl,
        frameNumber,
        time,
        streamIndex,
      }),
      signal: AbortSignal.timeout(60000), // 60 second timeout (frame extraction can take longer)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[WTF Frame Extract] Service error:', response.status, errorText);
      return NextResponse.json({
        success: false,
        frameUrl: null,
        placeholder: true,
        error: `Frame extraction failed: ${response.status} ${response.statusText}`,
        message: 'Frame extraction service error. Using placeholder.',
      });
    }

    const result = await response.json();
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        frameUrl: null,
        placeholder: true,
        error: result.error ?? 'Frame extraction failed',
        message: 'Frame extraction failed. Using placeholder.',
      });
    }

    // Return the frame URL (data URL from Cloud Run service)
    return NextResponse.json({
      success: true,
      frameUrl: result.frameUrl ?? result.dataUrl,
      cached: result.cached ?? false,
      timestamp: result.timestamp,
      frameNumber: result.frameNumber,
      size: result.size,
    });
  } catch (error) {
    console.error('[WTF Frame Extract] Error:', error);
    // Return placeholder on error
    return NextResponse.json({
      success: true,
      frameUrl: null,
      placeholder: true,
      message: 'Frame extraction temporarily unavailable',
    });
  }
}

