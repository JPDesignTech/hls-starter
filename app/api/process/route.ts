import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { uploadDirectory } from '@/lib/storage';
import { kv } from '@/lib/redis';

// Ensure this route only runs on Node.js runtime
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for video processing

// Quality presets for adaptive bitrate streaming
const QUALITY_PRESETS = [
  {
    name: '1080p',
    width: 1920,
    height: 1080,
    videoBitrate: '5000k',
    audioBitrate: '192k',
    maxrate: '5350k',
    bufsize: '7500k',
  },
  {
    name: '720p',
    width: 1280,
    height: 720,
    videoBitrate: '2800k',
    audioBitrate: '128k',
    maxrate: '3000k',
    bufsize: '4200k',
  },
  {
    name: '480p',
    width: 854,
    height: 480,
    videoBitrate: '1400k',
    audioBitrate: '128k',
    maxrate: '1498k',
    bufsize: '2100k',
  },
  {
    name: '360p',
    width: 640,
    height: 360,
    videoBitrate: '800k',
    audioBitrate: '96k',
    maxrate: '856k',
    bufsize: '1200k',
  },
];

// Get video metadata
async function getVideoMetadata(inputPath: string): Promise<any> {
  const ffmpeg = (await import('fluent-ffmpeg')).default;
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err: any, metadata: any) => {
      if (err) reject(err);
      else resolve(metadata);
    });
  });
}

// Create master playlist for adaptive bitrate streaming
async function createMasterPlaylist(
  outputPath: string,
  qualities: Array<{
    name: string;
    playlistPath: string;
    bandwidth: number;
    resolution: string;
  }>
): Promise<void> {
  let content = '#EXTM3U\n#EXT-X-VERSION:3\n\n';
  
  for (const quality of qualities) {
    content += `#EXT-X-STREAM-INF:BANDWIDTH=${quality.bandwidth},RESOLUTION=${quality.resolution}\n`;
    content += `${quality.name}/playlist.m3u8\n\n`;
  }
  
  await fs.writeFile(outputPath, content, 'utf-8');
}

// Transcode video to multiple qualities
async function transcodeVideo(options: {
  inputPath: string;
  outputDir: string;
  videoId: string;
}) {
  const ffmpeg = (await import('fluent-ffmpeg')).default;
  const { inputPath, outputDir, videoId } = options;
  
  // Create output directory
  await fs.mkdir(outputDir, { recursive: true });
  
  // Get video metadata
  const metadata = await getVideoMetadata(inputPath);
  const videoStream = metadata.streams.find((s: any) => s.codec_type === 'video');
  
  if (!videoStream) {
    throw new Error('No video stream found in input file');
  }
  
  const sourceHeight = videoStream.height || 1080;
  const qualities: Array<{
    name: string;
    playlistPath: string;
    bandwidth: number;
    resolution: string;
  }> = [];
  
  // Filter qualities based on source video resolution
  const applicableQualities = QUALITY_PRESETS.filter(preset => preset.height <= sourceHeight);
  
  // Transcode to each quality
  for (const preset of applicableQualities) {
    const outputPath = path.join(outputDir, preset.name);
    await fs.mkdir(outputPath, { recursive: true });
    
    const playlistPath = path.join(outputPath, 'playlist.m3u8');
    const segmentPath = path.join(outputPath, 'segment_%03d.ts');
    
    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-c:v libx264',
          '-c:a aac',
          `-b:v ${preset.videoBitrate}`,
          `-b:a ${preset.audioBitrate}`,
          `-vf scale=${preset.width}:${preset.height}`,
          `-maxrate ${preset.maxrate}`,
          `-bufsize ${preset.bufsize}`,
          '-preset fast',
          '-profile:v main',
          '-level 4.0',
          '-hls_time 6',
          '-hls_list_size 0',
          '-hls_segment_filename', segmentPath,
          '-f hls',
        ])
        .output(playlistPath)
        .on('end', () => {
          qualities.push({
            name: preset.name,
            playlistPath: path.relative(outputDir, playlistPath),
            bandwidth: parseInt(preset.videoBitrate) * 1000 + parseInt(preset.audioBitrate) * 1000,
            resolution: `${preset.width}x${preset.height}`,
          });
          resolve();
        })
        .on('error', reject)
        .run();
    });
  }
  
  // Create master playlist
  const masterPlaylistPath = path.join(outputDir, 'master.m3u8');
  await createMasterPlaylist(masterPlaylistPath, qualities);
  
  return {
    videoId,
    qualities,
    masterPlaylistPath: path.relative(outputDir, masterPlaylistPath),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoId } = body;

    if (!videoId) {
      return NextResponse.json(
        { error: 'No video ID provided' },
        { status: 400 }
      );
    }

    // Get video info from uploads directory
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const files = await fs.readdir(uploadsDir);
    const videoFile = files.find((f: string) => f.startsWith(videoId));

    if (!videoFile) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    const inputPath = path.join(uploadsDir, videoFile);
    const outputDir = path.join(process.cwd(), 'output', videoId);

    // Transcode video to multiple qualities
    const transcodeResult = await transcodeVideo({
      inputPath,
      outputDir,
      videoId,
    });

    // Upload to storage (Google Cloud Storage or local)
    const uploadedFiles = await uploadDirectory(outputDir, videoId);

    // Get the master playlist URL
    const masterPlaylistFile = uploadedFiles.find(f => f.name.includes('master.m3u8'));
    
    if (!masterPlaylistFile) {
      throw new Error('Master playlist not found');
    }

    // Store video metadata in Redis
    await kv.set(`video:${videoId}`, {
      id: videoId,
      url: masterPlaylistFile.url,
      qualities: transcodeResult.qualities,
      processedAt: new Date().toISOString(),
      files: uploadedFiles.map(f => ({
        name: f.name,
        url: f.url,
        size: f.size,
      })),
    });

    // Clean up local files (optional)
    // await fs.rm(outputDir, { recursive: true, force: true });
    // await fs.unlink(inputPath);

    return NextResponse.json({
      success: true,
      url: masterPlaylistFile.url,
      qualities: transcodeResult.qualities,
    });
  } catch (error) {
    console.error('Processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process video' },
      { status: 500 }
    );
  }
} 