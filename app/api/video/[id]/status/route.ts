import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/redis';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: videoId } = await params;
    console.log(`[Status API] Fetching video data for: video:${videoId}`);
    const videoData = await kv.get(`video:${videoId}`) as any;
    
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
      isOriginal: videoData.isOriginal,
      transcoderJobName: videoData.transcoderJobName
    });
    
    // Check if we have a transcoder job that might still be processing
    if (videoData.transcoderJobName && !videoData.url) {
      try {
        const { getTranscodeJobStatus } = await import('@/lib/transcoder');
        const jobStatus = await getTranscodeJobStatus(videoData.transcoderJobName);
        
        console.log(`[Status API] Transcoder job status:`, jobStatus);
        
        // Map job states to progress values
        let progress = videoData.progress || 50;
        let status = 'processing';
        
        switch (jobStatus.state) {
          case 'PENDING':
            progress = 55;
            break;
          case 'RUNNING':
            // For RUNNING state, return progress that the frontend will increment
            progress = videoData.progress || 60;
            console.log(`[Status API] RUNNING state, current progress: ${progress}%`);
            break;
          case 'SUCCEEDED':
            progress = 100;
            status = 'ready';
            // Refresh the video data to get the URL
            const updatedData = await kv.get(`video:${videoId}`) as any;
            if (updatedData && updatedData.url) {
              return NextResponse.json({
                status: 'ready',
                url: updatedData.url,
                progress: 100,
                ...updatedData
              });
            }
            break;
          case 'FAILED':
            status = 'error';
            break;
          default:
            // Keep current progress
            break;
        }
        
        return NextResponse.json({
          ...videoData,
          status,
          progress,
          processingState: jobStatus.state,
          error: jobStatus.error
        });
      } catch (error) {
        console.error('[Status API] Error checking transcoder job:', error);
        // Fall through to return existing data
      }
    }
    
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