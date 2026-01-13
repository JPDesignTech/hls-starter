/**
 * Desktop FFmpeg transcoder
 * Converts Google Transcoder API configurations to equivalent FFmpeg commands
 * Provides local video processing without cloud costs
 */

import path from 'path';
import { executeFFmpeg } from './desktop-adapter';

export interface QualityPreset {
  name: string;
  width: number;
  height: number;
  videoBitrate: string; // e.g., "5000k"
  maxrate: string;
  bufsize: string;
  audioBitrate: string; // e.g., "128k"
}

export interface TranscodeOptions {
  inputPath: string;
  outputDir: string;
  qualities?: QualityPreset[];
  segmentDuration?: number; // In seconds
  onProgress?: (progress: { percent: number; quality: string; time: number }) => void;
  onQualityComplete?: (quality: string) => void;
}

export interface TranscodeResult {
  success: boolean;
  masterPlaylistPath?: string;
  qualityPlaylists?: string[];
  error?: string;
}

/**
 * Default quality presets matching Google Transcoder configuration
 * From apps/web/lib/transcoder.ts
 */
export const DEFAULT_QUALITY_PRESETS: QualityPreset[] = [
  {
    name: '1080p',
    width: 1920,
    height: 1080,
    videoBitrate: '5000k',
    maxrate: '5000k',
    bufsize: '5000k',
    audioBitrate: '128k',
  },
  {
    name: '720p',
    width: 1280,
    height: 720,
    videoBitrate: '2800k',
    maxrate: '2800k',
    bufsize: '2800k',
    audioBitrate: '128k',
  },
  {
    name: '480p',
    width: 854,
    height: 480,
    videoBitrate: '1400k',
    maxrate: '1400k',
    bufsize: '1400k',
    audioBitrate: '128k',
  },
  {
    name: '360p',
    width: 640,
    height: 360,
    videoBitrate: '800k',
    maxrate: '800k',
    bufsize: '800k',
    audioBitrate: '128k',
  },
];

/**
 * Build FFmpeg command for a single quality level with HLS output
 */
function buildQualityCommand(
  inputPath: string,
  outputDir: string,
  quality: QualityPreset,
  segmentDuration: number
): string[] {
  const outputName = quality.name.toLowerCase();
  const playlistPath = path.join(outputDir, `${outputName}.m3u8`);
  const segmentPattern = path.join(outputDir, `${outputName}_%03d.ts`);

  return [
    '-i', inputPath,
    
    // Video encoding settings
    '-c:v', 'libx264',
    '-preset', 'veryfast', // Balance between speed and compression
    '-profile:v', quality.height >= 720 ? 'high' : 'main',
    '-level', '4.0',
    '-pix_fmt', 'yuv420p',
    
    // Video size and bitrate
    '-vf', `scale=${quality.width}:${quality.height}`,
    '-b:v', quality.videoBitrate,
    '-maxrate', quality.maxrate,
    '-bufsize', quality.bufsize,
    
    // GOP settings (keyframe every 3 seconds at 30fps = 90 frames)
    '-g', '90',
    '-keyint_min', '90',
    '-sc_threshold', '0',
    
    // Audio encoding
    '-c:a', 'aac',
    '-b:a', quality.audioBitrate,
    '-ar', '48000',
    '-ac', '2',
    
    // HLS settings
    '-f', 'hls',
    '-hls_time', segmentDuration.toString(),
    '-hls_playlist_type', 'vod',
    '-hls_segment_filename', segmentPattern,
    '-hls_segment_type', 'mpegts',
    
    // Output playlist
    playlistPath,
  ];
}

/**
 * Generate master playlist content
 */
function generateMasterPlaylist(qualities: QualityPreset[]): string {
  let content = '#EXTM3U\n#EXT-X-VERSION:3\n\n';

  for (const quality of qualities) {
    const bandwidth = parseInt(quality.videoBitrate) * 1000; // Convert to bps
    const outputName = quality.name.toLowerCase();
    
    content += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${quality.width}x${quality.height},NAME="${quality.name}"\n`;
    content += `${outputName}.m3u8\n\n`;
  }

  return content;
}

/**
 * Transcode video to HLS with multiple quality levels
 * Executes FFmpeg commands sequentially for each quality
 */
export async function transcodeToHLS(
  options: TranscodeOptions
): Promise<TranscodeResult> {
  const {
    inputPath,
    outputDir,
    qualities = DEFAULT_QUALITY_PRESETS,
    segmentDuration = 6,
    onProgress,
    onQualityComplete,
  } = options;

  console.log('[Transcoder Desktop] Starting HLS transcoding:', {
    input: inputPath,
    output: outputDir,
    qualities: qualities.map(q => q.name),
  });

  const qualityPlaylists: string[] = [];

  try {
    // Process each quality level sequentially
    for (let i = 0; i < qualities.length; i++) {
      const quality = qualities[i];
      console.log(`[Transcoder Desktop] Processing ${quality.name}...`);

      const command = buildQualityCommand(
        inputPath,
        outputDir,
        quality,
        segmentDuration
      );

      // Execute FFmpeg for this quality
      const result = await executeFFmpeg(command, {
        onProgress: (progress) => {
          if (onProgress) {
            onProgress({
              percent: progress.percent,
              quality: quality.name,
              time: progress.time,
            });
          }
        },
      });

      if (!result || !result.success) {
        throw new Error(
          `Failed to transcode ${quality.name}: ${result?.error || 'Unknown error'}`
        );
      }

      const playlistPath = path.join(outputDir, `${quality.name.toLowerCase()}.m3u8`);
      qualityPlaylists.push(playlistPath);

      if (onQualityComplete) {
        onQualityComplete(quality.name);
      }

      console.log(`[Transcoder Desktop] Completed ${quality.name}`);
    }

    // Generate master playlist
    console.log('[Transcoder Desktop] Generating master playlist...');
    const masterPlaylistContent = generateMasterPlaylist(qualities);
    const masterPlaylistPath = path.join(outputDir, 'master.m3u8');

    // Write master playlist (requires file system access)
    const fs = await import('fs/promises');
    await fs.writeFile(masterPlaylistPath, masterPlaylistContent, 'utf-8');

    console.log('[Transcoder Desktop] Transcoding complete!');

    return {
      success: true,
      masterPlaylistPath,
      qualityPlaylists,
    };
  } catch (error) {
    console.error('[Transcoder Desktop] Transcoding failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Build a single FFmpeg command for all qualities using filter_complex
 * This is faster than sequential processing but more complex
 */
export function buildMultiQualityCommand(
  inputPath: string,
  outputDir: string,
  qualities: QualityPreset[],
  segmentDuration: number
): string[] {
  const command: string[] = [
    '-i', inputPath,
    '-hide_banner',
  ];

  // Build filter_complex for splitting and scaling
  const filterComplex: string[] = [];
  const videoMaps: string[] = [];
  
  // Split video into N streams
  filterComplex.push(`[0:v]split=${qualities.length}${qualities.map((_, i) => `[v${i}]`).join('')}`);
  
  // Scale each stream to different quality
  qualities.forEach((quality, i) => {
    filterComplex.push(`[v${i}]scale=${quality.width}:${quality.height}[vout${i}]`);
    videoMaps.push(`[vout${i}]`);
  });

  command.push('-filter_complex', filterComplex.join(';'));

  // Map each scaled video stream with encoding settings
  qualities.forEach((quality, i) => {
    command.push(
      '-map', `[vout${i}]`,
      '-c:v:' + i, 'libx264',
      '-b:v:' + i, quality.videoBitrate,
      '-maxrate:' + i, quality.maxrate,
      '-bufsize:' + i, quality.bufsize,
      '-preset', 'veryfast',
      '-g', '90',
      '-keyint_min', '90',
      '-sc_threshold', '0'
    );
  });

  // Map audio streams (same for all qualities)
  qualities.forEach((quality, i) => {
    command.push(
      '-map', 'a:0',
      '-c:a:' + i, 'aac',
      '-b:a:' + i, quality.audioBitrate,
      '-ar', '48000',
      '-ac', '2'
    );
  });

  // HLS output settings
  command.push(
    '-f', 'hls',
    '-hls_time', segmentDuration.toString(),
    '-hls_playlist_type', 'vod',
    '-master_pl_name', 'master.m3u8',
    '-var_stream_map', qualities.map((_, i) => `v:${i},a:${i}`).join(' ')
  );

  // Output pattern
  qualities.forEach((quality, i) => {
    const outputName = quality.name.toLowerCase();
    command.push(
      '-hls_segment_filename', path.join(outputDir, `${outputName}_%03d.ts`),
      path.join(outputDir, `${outputName}.m3u8`)
    );
  });

  return command;
}

/**
 * Estimate transcoding time based on video duration and quality settings
 */
export function estimateTranscodingTime(
  durationSeconds: number,
  qualityCount: number
): number {
  // Rough estimate: 1x realtime per quality on average hardware
  // Actual speed depends on CPU, quality settings, and input format
  return durationSeconds * qualityCount * 1.5; // 1.5x buffer for safety
}
