import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/redis';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: videoId } = await params;
    console.log(`[Status API] Fetching video data for: video:${videoId}`);
    const videoData = await kv.get(`video:${videoId}`);
    
    if (!videoData) {
      console.log(`[Status API] Video not found in Redis for ID: ${videoId}`);
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }
    
    console.log(`[Status API] Found video data:`, {
      id: videoData.id,
      url: videoData.url,
      filesCount: videoData.files?.length || 0,
      isOriginal: videoData.isOriginal
    });
    
    return NextResponse.json({
      status: 'ready',
      url: videoData.url,
      ...videoData
    });
  } catch (error) {
    console.error('Error fetching video status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video status' },
      { status: 500 }
    );
  }
} 