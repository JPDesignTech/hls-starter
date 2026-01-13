import { type NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/redis';
import { transcodeToHLS, DEFAULT_QUALITY_PRESETS } from '@/lib/transcoder-desktop';
import {
  getDesktopStorageMode,
  logStorageConfig,
  getGCSCredentials,
} from '@/lib/storage-desktop';
import path from 'path';
import fs from 'fs/promises';

// This route handles desktop-side video processing
// It runs FFmpeg locally and optionally uploads to GCS
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoId, localPath, outputDir } = body;

    if (!videoId) {
      return NextResponse.json(
        { error: 'No video ID provided' },
        { status: 400 }
      );
    }

    if (!localPath) {
      return NextResponse.json(
        { error: 'No local file path provided' },
        { status: 400 }
      );
    }

    // Log storage configuration
    logStorageConfig();
    const storageMode = getDesktopStorageMode();

    // Determine output directory
    const finalOutputDir =
      outputDir || path.join(process.cwd(), 'output', videoId);

    // Ensure output directory exists
    await fs.mkdir(finalOutputDir, { recursive: true });

    console.log('[Desktop Process] Starting local transcoding:', {
      videoId,
      localPath,
      outputDir: finalOutputDir,
      storageMode,
    });

    // Store initial processing state
    await kv.set(`video:${videoId}`, {
      id: videoId,
      processingStartTime: Date.now(),
      status: 'processing',
      progress: 0,
      isDesktop: true,
    });

    // Track progress
    let lastProgress = 0;

    // Transcode video locally
    const result = await transcodeToHLS({
      inputPath: localPath,
      outputDir: finalOutputDir,
      qualities: DEFAULT_QUALITY_PRESETS,
      segmentDuration: 6,
      onProgress: async (progress) => {
        // Update progress in Redis every 5%
        if (progress.percent - lastProgress >= 5) {
          lastProgress = progress.percent;
          await kv.set(`video:${videoId}`, {
            id: videoId,
            status: 'processing',
            progress: Math.round(progress.percent),
            currentQuality: progress.quality,
            isDesktop: true,
          });
          console.log(
            `[Desktop Process] Progress: ${Math.round(progress.percent)}% (${progress.quality})`
          );
        }
      },
      onQualityComplete: (quality) => {
        console.log(`[Desktop Process] Completed quality: ${quality}`);
      },
    });

    if (!result.success) {
      throw new Error(result.error || 'Transcoding failed');
    }

    console.log('[Desktop Process] Transcoding completed successfully');

    // Optionally upload to GCS (only if configured in hybrid mode)
    let cloudUrl: string | undefined;
    if (storageMode === 'hybrid') {
      try {
        console.log('[Desktop Process] Uploading to GCS (hybrid mode)...');
        const credentials = getGCSCredentials();

        if (credentials) {
          // Import storage utilities
          const { Storage } = await import('@google-cloud/storage');

          // Decode service account key
          const serviceAccountKey = Buffer.from(
            credentials.serviceAccountKey,
            'base64'
          ).toString('utf-8');
          const credentials_json = JSON.parse(serviceAccountKey);

          const storage = new Storage({
            projectId: credentials.projectId,
            credentials: credentials_json,
          });

          const bucket = storage.bucket(credentials.bucketName);

          // Upload master playlist and all segments
          const files = await fs.readdir(finalOutputDir);
          for (const file of files) {
            const localFilePath = path.join(finalOutputDir, file);
            const gcsPath = `${videoId}/${file}`;

            await bucket.upload(localFilePath, {
              destination: gcsPath,
              metadata: {
                cacheControl: 'public, max-age=3600',
              },
            });
          }

          cloudUrl = `https://storage.googleapis.com/${credentials.bucketName}/${videoId}/master.m3u8`;
          console.log('[Desktop Process] Uploaded to GCS:', cloudUrl);
        }
      } catch (uploadError) {
        console.warn(
          '[Desktop Process] GCS upload failed (continuing with local-only):',
          uploadError
        );
        // Don't throw - local processing succeeded
      }
    } else {
      console.log('[Desktop Process] Skipping cloud upload (local-only mode)');
    }

    // Get local URL for the master playlist
    const localUrl = `file://${result.masterPlaylistPath}`;

    // Store video metadata in Redis
    const videoData = {
      id: videoId,
      localUrl,
      cloudUrl,
      localPath: result.masterPlaylistPath,
      processedAt: new Date().toISOString(),
      isDesktop: true,
      qualities: DEFAULT_QUALITY_PRESETS.map((q) => ({
        name: q.name,
        resolution: `${q.width}x${q.height}`,
        bitrate: q.videoBitrate,
      })),
    };

    console.log('[Desktop Process] Storing video data in Redis');
    await kv.set(`video:${videoId}`, videoData);

    return NextResponse.json({
      success: true,
      localUrl,
      cloudUrl, // undefined if local-only mode
      localPath: result.masterPlaylistPath,
      storageMode,
      qualities: videoData.qualities,
    });

  } catch (error) {
    console.error('[Desktop Process] Processing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process video' },
      { status: 500 }
    );
  }
}
