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

    // Store video metadata in Redis
    const videoInfo = {
      id: videoId,
      filename,
      size,
      type,
      status: 'uploaded',
      uploadedAt: new Date().toISOString(),
      processStatus: 'pending',
    };

    await kv.set(`video:${videoId}`, videoInfo);

    // You can trigger processing here or let another service handle it
    // For automatic processing, uncomment the following:
    /*
    fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId }),
    }).catch(console.error);
    */

    return NextResponse.json({
      success: true,
      video: videoInfo,
    });
  } catch (error) {
    console.error('Complete upload error:', error);
    return NextResponse.json(
      { error: 'Failed to complete upload' },
      { status: 500 }
    );
  }
} 