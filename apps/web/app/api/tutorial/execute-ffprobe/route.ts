import { type NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Ensure this route only runs on Node.js runtime
export const runtime = 'nodejs';
export const maxDuration = 60; // 1 minute timeout for FFProbe (should be fast)

// Sample video IDs mapped to their GCS paths or public URLs
const SAMPLE_VIDEOS: Record<string, string> = {
  'sample-1': 'tutorial-samples/sample-1.mp4',
  'sample-2': 'tutorial-samples/sample-2.mp4',
  'default': 'tutorial-samples/sample-1.mp4',
};

// Validate FFProbe command for security
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

  // Must start with ffprobe
  if (!command.trim().startsWith('ffprobe')) {
    return { valid: false, error: 'Command must start with ffprobe' };
  }

  // Must reference input file
  if (!command.includes('-i') && !command.includes('input.') && !command.includes('sample.')) {
    return { valid: false, error: 'Command must include input file' };
  }

  return { valid: true };
}

// Parse FFProbe command and extract parameters
function parseCommand(command: string, sampleVideoPath: string): string[] {
  // Replace input file placeholders with actual path
  const processedCommand = command
    .replace(/sample\.(mp4|mp3|wav|avi|mov)/g, sampleVideoPath)
    .replace(/input\.(mp4|mp3|wav|avi|mov)/g, sampleVideoPath)
    .replace(/\$\{sampleVideo\}/g, sampleVideoPath);

  // Split command into parts, handling quoted strings
  const parts: string[] = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';

  for (const char of processedCommand) {
    
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
  try {
    const body = await request.json();
    const { sampleVideoId, command } = body;

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
        { error: validation.error ?? 'Invalid command' },
        { status: 400 }
      );
    }

    // Get sample video path
    const sampleVideoPath = SAMPLE_VIDEOS[sampleVideoId] || SAMPLE_VIDEOS.default;
    
    // Download sample video to temp directory
    const tempDir = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'temp');
    await fs.mkdir(tempDir, { recursive: true });
    
    const inputVideoPath = path.join(tempDir, `input_${Date.now()}.mp4`);

    // Check if sample video exists in public folder (for local dev)
    const publicVideoPath = path.join(process.cwd(), 'public', 'tutorial-samples', `${sampleVideoId}.mp4`);

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
        // Clean up downloaded file after copying
        try {
          await fs.unlink(downloadedPath);
        } catch {
          // Ignore cleanup errors
        }
      } catch (error) {
        console.error('Failed to get sample video:', error);
        return NextResponse.json(
          { error: 'Sample video not found. Please ensure sample files are available.' },
          { status: 404 }
        );
      }
    }

    // Parse and execute command
    const commandParts = parseCommand(command, inputVideoPath);
    
    const startTime = Date.now();

    // Execute FFProbe command
    const { stdout, stderr } = await execAsync(commandParts.join(' '), {
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      timeout: 30000, // 30 second timeout
    });

    const executionTime = (Date.now() - startTime) / 1000;

    // Clean up temp file
    try {
      await fs.unlink(inputVideoPath);
    } catch (error) {
      console.error('Error cleaning up temp file:', error);
    }

    // Determine output type based on command flags
    let outputType: 'text' | 'json' | 'csv' = 'text';
    if (command.includes('-print_format json') ?? command.includes('-of json')) {
      outputType = 'json';
    } else if (command.includes('-of csv')) {
      outputType = 'csv';
    }

    // Return the output
    return NextResponse.json({
      output: stdout ?? stderr, // FFProbe may output to stderr for some formats
      outputType,
      executionTime,
      success: true,
    });

  } catch (error) {
    console.error('FFProbe execute error:', error);
    
    // Try to extract error message
    let errorMessage = 'Failed to execute FFProbe command';
    if (error instanceof Error) {
      errorMessage = error.message;
      // Check if it's a timeout
      if (error.message.includes('timeout')) {
        errorMessage = 'Command execution timed out. Please check your command syntax.';
      }
      // Check if it's a command not found
      if (error.message.includes('ffprobe') && error.message.includes('not found')) {
        errorMessage = 'FFProbe is not available on this system.';
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        success: false,
      },
      { status: 500 }
    );
  }
}
