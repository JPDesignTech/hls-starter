import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const { videoId, filename, size, type } = await request.json();

    if (!videoId || !filename) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Store WTF-specific metadata in Redis
    const fileId = videoId; // Use same ID as video for consistency
    const wtfMetadata = {
      fileId,
      videoId, // Link to existing video record
      filename,
      size,
      fileType: type, // File MIME type
      status: 'uploaded',
      uploadedAt: new Date().toISOString(),
      analysisStatus: 'pending',
      type: 'what-the-ffmpeg', // Tool type identifier
    };

    // Store with wtf prefix
    await kv.set(`wtf:file:${fileId}`, wtfMetadata);

    // Also store in a list for quick access (optional)
    await kv.set(`wtf:files:${fileId}`, fileId);

    return NextResponse.json({
      success: true,
      fileId,
      metadata: wtfMetadata,
    });
  } catch (error) {
    console.error('WTF upload complete error:', error);
    return NextResponse.json(
      { error: 'Failed to complete WTF upload' },
      { status: 500 }
    );
  }
}

