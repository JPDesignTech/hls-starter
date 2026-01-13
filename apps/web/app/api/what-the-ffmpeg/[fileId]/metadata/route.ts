import { type NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/redis';

interface WTFMetadata {
  fileId: string;
  videoId?: string;
  filename: string;
  size: number;
  type: string;
  status: string;
  uploadedAt: string;
  analysisStatus?: string;
  [key: string]: any;
}

interface VideoMetadata {
  id: string;
  filename: string;
  size: number;
  type: string;
  status?: string;
  uploadedAt?: string;
  [key: string]: any;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    // Get WTF metadata from Redis
    const metadata = (await kv.get(`wtf:file:${fileId}`)) as WTFMetadata | null;

    if (!metadata) {
      // Fallback: try to get from video record
      const videoData = (await kv.get(
        `video:${fileId}`
      )) as VideoMetadata | null;
      if (videoData) {
        // Convert video record to WTF format
        const video = videoData;
        return NextResponse.json({
          fileId: video.id,
          videoId: video.id,
          filename: video.filename,
          size: video.size,
          type: video.type,
          status: video.status ?? 'uploaded',
          uploadedAt: video.uploadedAt ?? new Date().toISOString(),
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

