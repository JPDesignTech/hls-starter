import { type NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/redis';
import { isGoogleCloudStorageConfigured } from '@/lib/storage';
import { createTranscodeJob, waitForTranscodeJob } from '@/lib/transcoder';

// Ensure this route only runs on Node.js runtime
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for video processing

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoId, gcsPath } = body;

    if (!videoId) {
      return NextResponse.json(
        { error: 'No video ID provided' },
        { status: 400 }
      );
    }

    // Check if we're using Google Cloud Storage and Transcoder API
    if (!isGoogleCloudStorageConfigured()) {
      return NextResponse.json(
        { error: 'Google Cloud Storage is required for video transcoding' },
        { status: 500 }
      );
    }

    if (!gcsPath) {
      return NextResponse.json(
        { error: 'No GCS path provided' },
        { status: 400 }
      );
    }

    // Check for required environment variables
    const projectId = process.env.GCP_PROJECT_ID;
    const bucketName = process.env.GCS_BUCKET_NAME;
    
    if (!projectId) {
      console.error('[Process] Missing GCP_PROJECT_ID environment variable');
      return NextResponse.json(
        { error: 'Google Cloud Project ID not configured. Please set GCP_PROJECT_ID environment variable.' },
        { status: 500 }
      );
    }
    
    if (!bucketName) {
      console.error('[Process] Missing GCS_BUCKET_NAME environment variable');
      return NextResponse.json(
        { error: 'Google Cloud Storage bucket not configured. Please set GCS_BUCKET_NAME environment variable.' },
        { status: 500 }
      );
    }
    
    // Prepare input and output URIs for Transcoder API
    const inputUri = `gs://${bucketName}/${gcsPath}`;
    const outputUri = `gs://${bucketName}/${videoId}/`;

    console.log('[Process] Starting transcoding job:', {
      videoId,
      inputUri,
      outputUri,
    });

    try {
      // Create a transcoding job using Google Cloud Transcoder API
      const jobName = await createTranscodeJob({
        inputUri,
        outputUri,
        projectId,
        location: 'us-central1',
      });

      console.log('[Process] Created transcoding job:', jobName);

      // Store initial processing state with job name
      await kv.set(`video:${videoId}`, {
        id: videoId,
        transcoderJobName: jobName,
        processingStartTime: Date.now(),
        status: 'processing',
        progress: 50
      });

      // Wait for the job to complete
      const success = await waitForTranscodeJob(jobName);

      if (!success) {
        throw new Error('Transcoding job failed');
      }

      console.log('[Process] Transcoding job completed successfully');

      // Get the master playlist URL
      const masterPlaylistUrl = `https://storage.googleapis.com/${bucketName}/${videoId}/master.m3u8`;
      
      // Add a small delay to ensure files are fully written
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Store video metadata in Redis
      const videoData = {
        id: videoId,
        url: masterPlaylistUrl,
        processedAt: new Date().toISOString(),
        transcoderJobName: jobName,
        qualities: [
          { name: '1080p', resolution: '1920x1080', bitrate: '5000k' },
          { name: '720p', resolution: '1280x720', bitrate: '2800k' },
          { name: '480p', resolution: '854x480', bitrate: '1400k' },
          { name: '360p', resolution: '640x360', bitrate: '800k' },
        ],
      };

      console.log('[Process] Storing video data in Redis:', JSON.stringify(videoData, null, 2));
      await kv.set(`video:${videoId}`, videoData);

      return NextResponse.json({
        success: true,
        url: masterPlaylistUrl,
        qualities: videoData.qualities,
        jobName,
      });

    } catch (transcodeError) {
      console.error('Transcoding error:', transcodeError);
      
      // Fallback: serve the original video
      const originalVideoUrl = `https://storage.googleapis.com/${bucketName}/${gcsPath}`;
      
      // Store video metadata in Redis
      await kv.set(`video:${videoId}`, {
        id: videoId,
        url: originalVideoUrl,
        isOriginal: true,
        processedAt: new Date().toISOString(),
        error: 'Transcoding failed, serving original video from storage',
      });
      
      return NextResponse.json({
        success: true,
        url: originalVideoUrl,
        isOriginal: true,
        message: 'Serving original video from storage (transcoding failed)',
      });
    }
  } catch (error) {
    console.error('Processing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process video' },
      { status: 500 }
    );
  }
} 