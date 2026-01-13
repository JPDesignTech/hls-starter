import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { promisify } from 'util';
import { uploadFile } from '@/lib/storage';

const execAsync = promisify(exec);

// Ensure this route only runs on Node.js runtime
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for video processing

// Sample video IDs mapped to their GCS paths or public URLs
const SAMPLE_VIDEOS: Record<string, string> = {
  'sample-1': 'tutorial-samples/sample-1.mp4',
  'sample-2': 'tutorial-samples/sample-2.mp4',
  'default': 'tutorial-samples/sample-1.mp4',
};

// Validate FFMPEG command for security
function validateCommand(command: string, sampleVideoId: string): { valid: boolean; error?: string } {
  // Basic security checks
  const dangerousPatterns = [
    /rm\s+-rf/,
    /del\s+\/f/,
    /format\s+c:/i,
    /mkfs/,
    /dd\s+if=/,
    /\$\(/,
    /`/,
    /\$\{/,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(command)) {
      return { valid: false, error: 'Command contains potentially dangerous operations' };
    }
  }

  // Must start with ffmpeg
  if (!command.trim().startsWith('ffmpeg')) {
    return { valid: false, error: 'Command must start with ffmpeg' };
  }

  // Must reference the sample video
  if (!command.includes(`-i`) && !command.includes(sampleVideoId)) {
    return { valid: false, error: 'Command must include input file' };
  }

  return { valid: true };
}

// Parse FFMPEG command and extract parameters
function parseCommand(command: string, sampleVideoPath: string): string[] {
  // Replace sample video placeholder with actual path
  const processedCommand = command
    .replace(/sample\.mp4/g, sampleVideoPath)
    .replace(/input\.mp4/g, sampleVideoPath)
    .replace(/\$\{sampleVideo\}/g, sampleVideoPath);

  // Split command into parts, handling quoted strings
  const parts: string[] = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';

  for (let i = 0; i < processedCommand.length; i++) {
    const char = processedCommand[i];
    
    if ((char === '"' || char === "'") && !inQuotes) {
      inQuotes = true;
      quoteChar = char;
      current += char;
    } else if (char === quoteChar && inQuotes) {
      inQuotes = false;
      quoteChar = '';
      current += char;
    } else if (char === ' ' && !inQuotes) {
      if (current.trim()) {
        parts.push(current.trim());
        current = '';
      }
    } else {
      current += char;
    }
  }
  
  if (current.trim()) {
    parts.push(current.trim());
  }

  return parts;
}

export async function POST(request: NextRequest) {
  let tempFiles: string[] = [];
  
  try {
    const body = await request.json();
    const { sampleVideoId, command, previewType } = body;

    if (!sampleVideoId) {
      return NextResponse.json(
        { error: 'sampleVideoId is required' },
        { status: 400 }
      );
    }

    if (!command) {
      return NextResponse.json(
        { error: 'command is required' },
        { status: 400 }
      );
    }

    // Validate command
    const validation = validateCommand(command, sampleVideoId);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid command' },
        { status: 400 }
      );
    }

    // Get sample video path
    const sampleVideoPath = SAMPLE_VIDEOS[sampleVideoId] || SAMPLE_VIDEOS['default'];
    
    // Download sample video to temp directory
    const tempDir = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'temp');
    await fs.mkdir(tempDir, { recursive: true });
    
    const inputVideoPath = path.join(tempDir, `input_${Date.now()}.mp4`);
    tempFiles.push(inputVideoPath);

    // Check if sample video exists in public folder (for local dev)
    const publicVideoPath = path.join(process.cwd(), 'public', 'tutorial-samples', `${sampleVideoId}.mp4`);
    let videoPath = inputVideoPath;

    try {
      // Try to use public folder first (for local development)
      await fs.access(publicVideoPath);
      await fs.copyFile(publicVideoPath, inputVideoPath);
    } catch {
      // If not in public folder, try to download from GCS
      try {
        const { downloadFromGCS } = await import('@/lib/storage');
        const downloadedPath = await downloadFromGCS(sampleVideoPath);
        await fs.copyFile(downloadedPath, inputVideoPath);
      } catch (error) {
        console.error('Failed to get sample video:', error);
        return NextResponse.json(
          { error: 'Sample video not found' },
          { status: 404 }
        );
      }
    }

    // Parse and execute command
    const commandParts = parseCommand(command, inputVideoPath);
    
    // Detect output format from command (check for audio-only flags or output extension)
    const isAudioOnly = command.includes('-vn') || command.includes('-an');
    const outputExtension = command.match(/output\.(\w+)/)?.[1] || 'mp4';
    
    // Generate output path with appropriate extension
    const outputFilePath = path.join(tempDir, `output_${Date.now()}.${outputExtension}`);
    tempFiles.push(outputFilePath);

    // Replace output filename in command
    const outputIndex = commandParts.findIndex((part, idx) => 
      idx > 0 && !part.startsWith('-') && commandParts[idx - 1] !== '-i'
    );
    
    if (outputIndex !== -1) {
      commandParts[outputIndex] = outputFilePath;
    } else {
      commandParts.push(outputFilePath);
    }

    const startTime = Date.now();

    // Execute FFMPEG command
    const { stdout, stderr } = await execAsync(commandParts.join(' '), {
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      timeout: 120000, // 2 minute timeout
    });

    const executionTime = (Date.now() - startTime) / 1000;

    // Check if output file was created
    if (!await fs.access(outputFilePath).then(() => true).catch(() => false)) {
      throw new Error('FFMPEG command did not produce output file');
    }

    // Get file sizes
    const inputStats = await fs.stat(inputVideoPath);
    const outputStats = await fs.stat(outputFilePath);

    // Get video/audio dimensions using ffprobe
    let originalDimensions = { width: 1920, height: 1080 };
    let processedDimensions = { width: 1920, height: 1080 };

    try {
      const probeCmd = `ffprobe -v quiet -print_format json -show_streams "${inputVideoPath}"`;
      const { stdout: probeStdout } = await execAsync(probeCmd);
      const probeData = JSON.parse(probeStdout);
      const videoStream = probeData.streams?.find((s: any) => s.codec_type === 'video');
      if (videoStream) {
        originalDimensions = {
          width: videoStream.width || 1920,
          height: videoStream.height || 1080,
        };
      } else if (isAudioOnly) {
        originalDimensions = { width: 0, height: 0 };
      }
    } catch (error) {
      console.warn('Failed to probe original file:', error);
    }

    try {
      const probeCmd = `ffprobe -v quiet -print_format json -show_streams "${outputFilePath}"`;
      const { stdout: probeStdout } = await execAsync(probeCmd);
      const probeData = JSON.parse(probeStdout);
      const videoStream = probeData.streams?.find((s: any) => s.codec_type === 'video');
      if (videoStream) {
        processedDimensions = {
          width: videoStream.width || 1920,
          height: videoStream.height || 1080,
        };
      } else if (isAudioOnly) {
        processedDimensions = { width: 0, height: 0 };
      }
    } catch (error) {
      console.warn('Failed to probe processed file:', error);
    }

    // Determine content type based on output extension
    const contentTypeMap: Record<string, string> = {
      'mp4': 'video/mp4',
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'aac': 'audio/aac',
      'm4a': 'audio/mp4',
      'ogg': 'audio/ogg',
      'flac': 'audio/flac',
    };
    const contentType = contentTypeMap[outputExtension] || 'application/octet-stream';

    // Upload processed file to storage
    const outputFilename = `tutorial-output/${Date.now()}_${path.basename(outputFilePath)}`;
    const uploadedFile = await uploadFile({
      localPath: outputFilePath,
      remotePath: outputFilename,
      contentType,
      cacheControl: 'public, max-age=3600',
    });

    // For original video, use the sample video URL or upload it
    let originalUrl = `/tutorial-samples/${sampleVideoId}.mp4`;
    try {
      await fs.access(path.join(process.cwd(), 'public', 'tutorial-samples', `${sampleVideoId}.mp4`));
    } catch {
      // If not in public, try to get from GCS
      const { isGoogleCloudStorageConfigured } = await import('@/lib/storage');
      if (isGoogleCloudStorageConfigured()) {
        originalUrl = `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${sampleVideoPath}`;
      }
    }

    return NextResponse.json({
      originalUrl,
      processedUrl: uploadedFile.url,
      originalSize: inputStats.size,
      processedSize: outputStats.size,
      originalDimensions,
      processedDimensions,
      executionTime,
    });

  } catch (error) {
    console.error('Tutorial execute error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to execute FFMPEG command',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  } finally {
    // Clean up temp files
    for (const file of tempFiles) {
      try {
        await fs.unlink(file).catch(() => {});
      } catch (error) {
        console.error('Error cleaning up temp file:', file, error);
      }
    }
  }
}
