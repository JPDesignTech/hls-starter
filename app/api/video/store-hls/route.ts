import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const { videoId, url, originalUrl, title } = await request.json();

    if (!videoId || !url) {
      return NextResponse.json(
        { error: 'Video ID and URL are required' },
        { status: 400 }
      );
    }

    // Store the HLS URL in Redis
    const videoData = {
      id: videoId,
      url,
      originalUrl: originalUrl || url,
      title: title || 'HLS Stream',
      isOriginal: false,
      isHLS: true,
      createdAt: new Date().toISOString(),
      status: 'ready',
    };

    await kv.set(`video:${videoId}`, videoData);
    console.log(`[Store HLS] Stored HLS URL in Redis for video ID: ${videoId}`);

    return NextResponse.json({ success: true, videoId });
  } catch (error) {
    console.error('[Store HLS] Error storing HLS URL:', error);
    return NextResponse.json(
      { error: 'Failed to store HLS URL' },
      { status: 500 }
    );
  }
} 