import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import { createStorage } from '@/lib/gcs-config';

// Helper to get upload directory
const getUploadDir = () => {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
  return isProduction ? '/tmp' : 'temp';
};

interface CorruptionIssue {
  type: string;
  severity: 'critical' | 'warning' | 'info';
  description: string;
  detection: string;
  fixCommand?: string;
  explanation?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { filename, originalName, gcsPath } = await request.json();
    
    console.log('Corruption check request:', { filename, originalName, gcsPath });
    
    if (!filename && !gcsPath) {
      return NextResponse.json({ error: 'No filename provided' }, { status: 400 });
    }

    const tempDir = getUploadDir();
    let filePath: string;
    let tempFile = false;
    
    // If GCS path is provided, download from GCS
    if (gcsPath) {
      try {
        const storage = createStorage();
        const bucketName = process.env.GCS_BUCKET_NAME;
        if (!bucketName) {
          throw new Error('GCS bucket name not configured. Please set GCS_BUCKET_NAME environment variable.');
        }
        
        console.log(`Attempting to download from GCS: bucket=${bucketName}, path=${gcsPath}`);
        
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(gcsPath);
        
        // Check if file exists first
        const [exists] = await file.exists();
        if (!exists) {
          console.error(`File not found in GCS: ${gcsPath}`);
          throw new Error(`File not found in GCS: ${gcsPath}. The file may still be uploading or the path is incorrect.`);
        }
        
        // Create temp directory if it doesn't exist
        await fs.mkdir(tempDir, { recursive: true });
        
        // Download file to temp location
        filePath = path.join(tempDir, `corruption-check-${Date.now()}-${path.basename(gcsPath)}`);
        console.log(`Downloading to: ${filePath}`);
        await file.download({ destination: filePath });
        console.log('Download successful');
        tempFile = true;
      } catch (error) {
        console.error('Error downloading from GCS:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: `Failed to download file from storage: ${errorMessage}` }, { status: 500 });
      }
    } else {
      // Fallback to local file (for backwards compatibility)
      filePath = path.join(tempDir, filename);
    }
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Get file stats
    const stats = await fs.stat(filePath);
    
    // Use FFprobe service to analyze the file
    const ffprobeServiceUrl = process.env.FFPROBE_SERVICE_URL || process.env.NEXT_PUBLIC_FFPROBE_SERVICE_URL;
    if (!ffprobeServiceUrl) {
      // Clean up temp file if needed
      if (tempFile) {
        await fs.unlink(filePath).catch(() => {});
      }
      return NextResponse.json({ error: 'FFprobe service not configured' }, { status: 500 });
    }

    let ffprobeData: any;
    let errorOutput = '';

    // For GCS files, use the public URL for FFprobe service
    if (gcsPath) {
      const bucketName = process.env.GCS_BUCKET_NAME;
      const fileUrlForProbe = `https://storage.googleapis.com/${bucketName}/${gcsPath}`;
      console.log(`Using GCS URL for probe: ${fileUrlForProbe}`);
      
      // First, get the basic probe data
      console.log(`Calling FFprobe service at: ${ffprobeServiceUrl}/probe`);
      const ffprobeResponse = await fetch(`${ffprobeServiceUrl}/probe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: fileUrlForProbe,
          detailed: false,
          // Request both stdout and stderr to get error messages
          includeStderr: true
        }),
        // Add timeout for reliability
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      console.log(`FFprobe response status: ${ffprobeResponse.status}`);
      
      if (!ffprobeResponse.ok) {
        const errorText = await ffprobeResponse.text();
        console.error('FFprobe service error:', errorText);
        // Clean up temp file if needed
        if (tempFile) {
          await fs.unlink(filePath).catch(() => {});
        }
        throw new Error(`FFprobe analysis failed: ${ffprobeResponse.status} - ${errorText}`);
      }

      const ffprobeResult = await ffprobeResponse.json();
      console.log('FFprobe result:', JSON.stringify(ffprobeResult).substring(0, 200) + '...');
      
      if (!ffprobeResult.success) {
        // Clean up temp file if needed
        if (tempFile) {
          await fs.unlink(filePath).catch(() => {});
        }
        throw new Error(ffprobeResult.error || 'FFprobe service failed');
      }

      ffprobeData = ffprobeResult.data;
      
      // Extract error output from the result
      if (ffprobeResult.stderr) {
        errorOutput = ffprobeResult.stderr;
      }
      
      // If we didn't get error output from the first call, make a second call specifically for error detection
      if (!errorOutput) {
        console.log('Running error detection scan...');
        
        // For error detection, we need to run FFprobe with error verbosity
        // This might require calling the service differently or using a raw command
        try {
          const errorDetectionResponse = await fetch(`${ffprobeServiceUrl}/probe`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url: fileUrlForProbe,
              // Use custom options to get error output
              customCommand: true,
              command: 'ffmpeg',
              args: ['-v', 'error', '-i', fileUrlForProbe, '-f', 'null', '-']
            }),
            signal: AbortSignal.timeout(30000)
          });
          
          if (errorDetectionResponse.ok) {
            const errorResult = await errorDetectionResponse.json();
            if (errorResult.stderr) {
              errorOutput = errorResult.stderr;
              console.log('Got error output from detection scan');
            }
          }
        } catch (e) {
          console.log('Error detection scan failed, continuing with basic analysis');
        }
      }
    } else {
      // For local files, fall back to reading file (should rarely happen)
      const fileBuffer = await fs.readFile(filePath);
      const base64Data = fileBuffer.toString('base64');
      
      const ffprobeResponse = await fetch(ffprobeServiceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: base64Data,
          filename: originalName || filename,
          options: ['-v', 'error', '-show_format', '-show_streams', '-print_format', 'json']
        }),
      });

      if (!ffprobeResponse.ok) {
        if (tempFile) {
          await fs.unlink(filePath).catch(() => {});
        }
        throw new Error('FFprobe analysis failed');
      }

      ffprobeData = await ffprobeResponse.json();
    }

    // Analyze the results for corruption issues
    const result = analyzeForCorruption(ffprobeData, errorOutput, stats, originalName || filename);

    // Clean up the temp file
    if (tempFile) {
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.error('Error cleaning up temp file:', err);
      }
    }

    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Corruption check error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}

function analyzeForCorruption(ffprobeData: any, errorOutput: string, stats: any, filename: string) {
  const issues: CorruptionIssue[] = [];
  
  // Parse the actual container format from format_name
  let containerFormat = 'Unknown';
  if (ffprobeData.format?.format_name) {
    // format_name often contains multiple possible formats like "mov,mp4,m4a,3gp,3g2,mj2"
    // We need to determine the actual format based on the file extension or format_long_name
    const formatList = ffprobeData.format.format_name.split(',');
    const fileExt = filename.split('.').pop()?.toLowerCase();
    
    // Try to match file extension with format list
    if (fileExt && formatList.includes(fileExt)) {
      containerFormat = fileExt;
    } else {
      // Use the first format in the list as fallback
      containerFormat = formatList[0];
    }
    
    // Special handling for common cases
    if (ffprobeData.format.format_long_name) {
      if (ffprobeData.format.format_long_name.includes('QuickTime')) {
        containerFormat = 'mov';
      } else if (ffprobeData.format.format_long_name.includes('MP4')) {
        containerFormat = 'mp4';
      } else if (ffprobeData.format.format_long_name.includes('WebM')) {
        containerFormat = 'webm';
      } else if (ffprobeData.format.format_long_name.includes('Matroska')) {
        containerFormat = 'mkv';
      } else if (ffprobeData.format.format_long_name.includes('AVI')) {
        containerFormat = 'avi';
      }
    }
  }
  
  const metadata: any = {
    format: containerFormat,
    duration: ffprobeData.format?.duration ? parseFloat(ffprobeData.format.duration) : undefined,
    bitrate: ffprobeData.format?.bit_rate ? parseInt(ffprobeData.format.bit_rate) : undefined,
    fileSize: stats.size,
  };

  // Extract stream information
  const videoStream = ffprobeData.streams?.find((s: any) => s.codec_type === 'video');
  const audioStream = ffprobeData.streams?.find((s: any) => s.codec_type === 'audio');

  if (videoStream) {
    metadata.hasVideo = true;
    metadata.videoCodec = videoStream.codec_name;
    metadata.resolution = `${videoStream.width}x${videoStream.height}`;
    
    // Parse frame rate more carefully
    try {
      if (videoStream.avg_frame_rate && videoStream.avg_frame_rate !== '0/0') {
        const [num, den] = videoStream.avg_frame_rate.split('/').map(Number);
        metadata.fps = den > 0 ? num / den : 0;
      } else if (videoStream.r_frame_rate && videoStream.r_frame_rate !== '0/0') {
        const [num, den] = videoStream.r_frame_rate.split('/').map(Number);
        metadata.fps = den > 0 ? num / den : 0;
      }
    } catch (e) {
      metadata.fps = 0;
    }
  }

  if (audioStream) {
    metadata.hasAudio = true;
    metadata.audioCodec = audioStream.codec_name;
    metadata.sampleRate = audioStream.sample_rate;
    metadata.channels = audioStream.channels;
  }

  // 1. Check for missing moov atom (MP4/MOV specific) - Based on RFC
  if (containerFormat === 'mp4' || containerFormat === 'mov') {
    if (errorOutput.includes('moov atom not found') || 
        errorOutput.includes('Invalid data found when processing input')) {
      issues.push({
        type: 'Missing Container Metadata',
        severity: 'critical',
        description: 'The video file is missing essential metadata (moov atom) required for playback',
        detection: 'moov atom not found',
        fixCommand: 'ffmpeg -i input.mp4 -c copy -movflags +faststart output.mp4',
        explanation: 'This typically happens with incomplete downloads or improperly finalized recordings. The fix attempts to rebuild the container structure.'
      });
    }
  }

  // 2. Check for codec parameter issues - Updated patterns from RFC
  if (errorOutput.includes('Could not find codec parameters') || 
      errorOutput.includes('unspecified size') ||
      errorOutput.includes('unknown codec')) {
    const streamMatch = errorOutput.match(/stream\s+(\d+)/i);
    const streamInfo = streamMatch ? streamMatch[1] : '0';
    
    issues.push({
      type: 'Missing Codec Parameters',
      severity: 'critical',
      description: `Stream ${streamInfo} is missing essential codec information like resolution or frame rate`,
      detection: 'Could not find codec parameters',
      fixCommand: 'ffmpeg -probesize 100M -analyzeduration 100M -i input.mkv -c copy output.mkv',
      explanation: 'Codec parameters might be located later in the file. Increasing probe size can help FFmpeg find them.'
    });
  }

  // 3. Check for non-monotonic timestamps - More specific pattern
  if (errorOutput.includes('Non-monotonous DTS') || 
      errorOutput.includes('non monotonically increasing dts') ||
      errorOutput.includes('Invalid timestamps')) {
    issues.push({
      type: 'Timestamp Errors',
      severity: 'warning',
      description: 'The video has out-of-order timestamps which can cause playback issues',
      detection: 'Non-monotonous DTS detected',
      fixCommand: 'ffmpeg -fflags +genpts -i input.mp4 -c copy output.mp4',
      explanation: 'Timestamps are not in the correct order. This often happens after improper editing or concatenation.'
    });
  }

  // 4. Check for A/V sync issues - More detailed check
  if (videoStream && audioStream) {
    // Check duration mismatch
    const videoDuration = videoStream.duration ? parseFloat(videoStream.duration) : 
                          (videoStream.duration_ts && videoStream.time_base ? 
                           eval(videoStream.time_base) * videoStream.duration_ts : 0);
    const audioDuration = audioStream.duration ? parseFloat(audioStream.duration) :
                          (audioStream.duration_ts && audioStream.time_base ? 
                           eval(audioStream.time_base) * audioStream.duration_ts : 0);
    
    if (videoDuration > 0 && audioDuration > 0) {
      const drift = Math.abs(videoDuration - audioDuration);
      if (drift > 0.5) { // More than 0.5 second drift
        issues.push({
          type: 'Audio-Video Sync Drift',
          severity: 'warning',
          description: `Audio and video streams have different durations (${drift.toFixed(2)}s difference)`,
          detection: `Video: ${videoDuration.toFixed(2)}s, Audio: ${audioDuration.toFixed(2)}s`,
          fixCommand: 'ffmpeg -i input.mp4 -c:v copy -af "aresample=async=1:first_pts=0" -c:a aac output.mp4',
          explanation: 'The audio will gradually go out of sync. The fix resamples audio to match video timing.'
        });
      }
    }
    
    // Check for start time differences
    const videoStartTime = videoStream.start_time ? parseFloat(videoStream.start_time) : 0;
    const audioStartTime = audioStream.start_time ? parseFloat(audioStream.start_time) : 0;
    const startDiff = Math.abs(videoStartTime - audioStartTime);
    
    if (startDiff > 0.1) { // More than 100ms start difference
      issues.push({
        type: 'Stream Start Time Mismatch',
        severity: 'warning',
        description: `Audio and video streams have different start times (${startDiff.toFixed(3)}s difference)`,
        detection: `Video starts at: ${videoStartTime.toFixed(3)}s, Audio starts at: ${audioStartTime.toFixed(3)}s`,
        fixCommand: `ffmpeg -i input.mp4 -itsoffset ${startDiff} -i input.mp4 -map 1:v -map 0:a -c copy output.mp4`,
        explanation: 'Different start times can cause constant A/V sync offset. The fix aligns the streams.'
      });
    }
  }

  // 5. Check for decode errors - Comprehensive list from RFC
  const decodeErrors = [
    'decode_slice_header error',
    'no frame!',
    'non-existing PPS',
    'Error while decoding stream',
    'Invalid NAL unit',
    'Bitstream error',
    'missing picture in access unit',
    'concealing',
    'decode MB',
    'error while decoding',
    'Reference frame missing'
  ];
  
  const foundDecodeErrors = decodeErrors.filter(error => 
    errorOutput.toLowerCase().includes(error.toLowerCase())
  );
  
  if (foundDecodeErrors.length > 0) {
    issues.push({
      type: 'Damaged Frames',
      severity: 'warning',
      description: 'Some video frames are corrupted and may cause visual artifacts',
      detection: foundDecodeErrors.join(', '),
      fixCommand: 'ffmpeg -err_detect ignore_err -i input.mp4 -c:v libx264 -c:a aac output.mp4',
      explanation: 'Re-encoding the video will skip or interpolate damaged frames, though some quality loss may occur.'
    });
  }

  // 6. Check for missing streams
  if (!videoStream && !audioStream) {
    issues.push({
      type: 'No Media Streams',
      severity: 'critical',
      description: 'No video or audio streams were detected in the file',
      detection: 'No streams found',
      fixCommand: 'ffmpeg -i input.mp4 -f mp4 -c:v libx264 -c:a aac output.mp4',
      explanation: 'The file may be severely corrupted or not a valid media file.'
    });
  }

  // 7. Check for variable frame rate issues
  if (videoStream && videoStream.avg_frame_rate !== videoStream.r_frame_rate) {
    issues.push({
      type: 'Variable Frame Rate',
      severity: 'info',
      description: 'The video has variable frame rate which may cause issues in some editors',
      detection: `avg_frame_rate: ${videoStream.avg_frame_rate}, r_frame_rate: ${videoStream.r_frame_rate}`,
      fixCommand: 'ffmpeg -i input.mp4 -vf "fps=30" -c:a copy output.mp4',
      explanation: 'Some applications require constant frame rate. This converts to 30fps constant.'
    });
  }

  // 8. Check for exotic codecs
  const supportedVideoCodecs = ['h264', 'hevc', 'h265', 'vp9', 'vp8', 'mpeg4', 'mpeg2video'];
  const supportedAudioCodecs = ['aac', 'mp3', 'opus', 'vorbis', 'ac3', 'eac3', 'pcm_s16le', 'flac'];
  
  if (videoStream && !supportedVideoCodecs.includes(videoStream.codec_name?.toLowerCase())) {
    issues.push({
      type: 'Unsupported Video Codec',
      severity: 'info',
      description: `Video codec "${videoStream.codec_name}" may not be widely supported`,
      detection: `codec: ${videoStream.codec_name}`,
      fixCommand: 'ffmpeg -i input.mp4 -c:v libx264 -preset medium -crf 23 -c:a copy output.mp4',
      explanation: 'Converting to H.264 ensures maximum compatibility.'
    });
  }
  
  if (audioStream && !supportedAudioCodecs.includes(audioStream.codec_name?.toLowerCase())) {
    issues.push({
      type: 'Unsupported Audio Codec',
      severity: 'info',
      description: `Audio codec "${audioStream.codec_name}" may not be widely supported`,
      detection: `codec: ${audioStream.codec_name}`,
      fixCommand: 'ffmpeg -i input.mp4 -c:v copy -c:a aac -b:a 192k output.mp4',
      explanation: 'Converting to AAC ensures maximum compatibility.'
    });
  }

  // 9. Additional checks based on RFC
  
  // Check for incorrect channel layout
  if (audioStream) {
    const channels = audioStream.channels || 0;
    const channelLayout = audioStream.channel_layout || '';
    
    if ((channels === 1 && channelLayout !== 'mono') || 
        (channels === 2 && !channelLayout.includes('stereo'))) {
      issues.push({
        type: 'Incorrect Audio Channel Layout',
        severity: 'info',
        description: `Audio channel configuration mismatch: ${channels} channels with ${channelLayout} layout`,
        detection: `channels: ${channels}, layout: ${channelLayout}`,
        fixCommand: `ffmpeg -i input.mp4 -c:v copy -ac ${channels} output.mp4`,
        explanation: 'Channel layout mismatch can cause phase issues or silent channels.'
      });
    }
  }

  // Check for missing index (AVI specific)
  if (containerFormat === 'avi' && errorOutput.includes('missing index')) {
    issues.push({
      type: 'Missing Index',
      severity: 'warning',
      description: 'AVI file is missing index, seeking may not work properly',
      detection: 'missing index',
      fixCommand: 'ffmpeg -i input.avi -c copy -movflags +faststart output.avi',
      explanation: 'FFmpeg will rebuild the index during remuxing.'
    });
  }

  // WebM-specific checks (often problematic for editing software)
  if (containerFormat === 'webm') {
    issues.push({
      type: 'WebM Container Format',
      severity: 'info',
      description: 'WebM format may have compatibility issues with some editing software',
      detection: `Container: ${containerFormat}`,
      fixCommand: 'ffmpeg -i input.webm -c:v libx264 -c:a aac -movflags +faststart output.mp4',
      explanation: 'Converting to MP4 with H.264/AAC ensures maximum compatibility with editing software like Descript.'
    });
    
    // WebM often has VFR which can cause issues
    if (videoStream && videoStream.avg_frame_rate !== videoStream.r_frame_rate) {
      issues.push({
        type: 'WebM Variable Frame Rate',
        severity: 'warning',
        description: 'WebM files often use variable frame rate which can cause sync issues',
        detection: 'WebM with VFR',
        fixCommand: 'ffmpeg -i input.webm -vf "fps=30" -c:v libx264 -c:a aac -af "aresample=async=1:first_pts=0" output.mp4',
        explanation: 'This converts to constant 30fps MP4 with audio resampling to maintain sync.'
      });
    }
  }

  // Check for very low or very high frame rates
  if (metadata.fps && (metadata.fps < 10 || metadata.fps > 120)) {
    issues.push({
      type: 'Unusual Frame Rate',
      severity: 'info',
      description: `Video has an unusual frame rate of ${metadata.fps.toFixed(2)} fps`,
      detection: `Frame rate: ${metadata.fps.toFixed(2)} fps`,
      fixCommand: `ffmpeg -i input.${containerFormat} -vf "fps=30" -c:a copy output.mp4`,
      explanation: 'Standard frame rates (24, 30, 60 fps) are more widely compatible.'
    });
  }

  // Update fix commands to use actual container format
  issues.forEach(issue => {
    if (issue.fixCommand && containerFormat !== 'Unknown') {
      // Replace generic 'input.mp4' with actual format
      issue.fixCommand = issue.fixCommand.replace(/input\.(mp4|mkv|avi|webm|mov)/g, `input.${containerFormat}`);
      
      // For output, default to MP4 unless fixing a specific container issue
      if (!issue.fixCommand.includes('output.') || issue.fixCommand.includes('output.mp4')) {
        // Already has correct output format
      } else if (issue.type === 'Missing Index' && containerFormat === 'avi') {
        issue.fixCommand = issue.fixCommand.replace(/output\.\w+/, 'output.avi');
      }
    }
  });

  return {
    videoId: uuidv4(),
    filename: filename,
    fileSize: stats.size,
    issues,
    metadata,
    analyzedAt: new Date().toISOString(),
    rawOutput: {
      ffprobe: ffprobeData,
      errors: errorOutput
    }
  };
}