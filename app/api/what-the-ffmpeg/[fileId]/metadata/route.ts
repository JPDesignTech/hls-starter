import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/redis';

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = params;

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    // Get WTF metadata from Redis
    const metadata = await kv.get(`wtf:file:${fileId}`);

    if (!metadata) {
      // Fallback: try to get from video record
      const videoData = await kv.get(`video:${fileId}`);
      if (videoData) {
        // Convert video record to WTF format
        const video = videoData as any;
        return NextResponse.json({
          fileId: video.id,
          videoId: video.id,
          filename: video.filename,
          size: video.size,
          type: video.type,
          status: video.status || 'uploaded',
          uploadedAt: video.uploadedAt || new Date().toISOString(),
          analysisStatus: 'pending',
        });
      }

      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(metadata);
  } catch (error) {
    console.error('[WTF Metadata] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get file metadata' },
      { status: 500 }
    );
  }
}

