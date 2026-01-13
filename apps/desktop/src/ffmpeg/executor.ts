import { spawn, ChildProcess } from 'child_process';
import { resolveBinaryPaths } from './binaries';
import { EventEmitter } from 'events';

export interface FFmpegOptions {
  cwd?: string;
  onProgress?: (progress: FFmpegProgress) => void;
  onError?: (error: string) => void;
}

export interface FFmpegProgress {
  time: number; // Current time in seconds
  percent: number; // Progress percentage (0-100)
  fps: number; // Current FPS
  bitrate: string; // Current bitrate
  speed: string; // Processing speed
}

export interface FFmpegResult {
  success: boolean;
  output: string;
  error?: string;
  exitCode: number;
}

// Store active processes for cancellation
const activeProcesses = new Map<string, ChildProcess>();

/**
 * Parse FFmpeg progress from stderr output
 * Example: frame=  123 fps= 25 q=28.0 size=    1024kB time=00:00:05.00 bitrate=1677.7kbits/s speed=1.5x
 */
function parseProgress(line: string, duration?: number): FFmpegProgress | null {
  const timeMatch = line.match(/time=(\d{2}):(\d{2}):(\d{2}\.\d{2})/);
  const fpsMatch = line.match(/fps=\s*(\d+(?:\.\d+)?)/);
  const bitrateMatch = line.match(/bitrate=\s*(\S+)/);
  const speedMatch = line.match(/speed=\s*(\S+)/);

  if (!timeMatch) return null;

  const hours = parseInt(timeMatch[1], 10);
  const minutes = parseInt(timeMatch[2], 10);
  const seconds = parseFloat(timeMatch[3]);
  const currentTime = hours * 3600 + minutes * 60 + seconds;

  const percent = duration ? Math.min((currentTime / duration) * 100, 100) : 0;

  return {
    time: currentTime,
    percent: Math.round(percent * 100) / 100,
    fps: fpsMatch ? parseFloat(fpsMatch[1]) : 0,
    bitrate: bitrateMatch ? bitrateMatch[1] : '0kbits/s',
    speed: speedMatch ? speedMatch[1] : '0x',
  };
}

/**
 * Execute an FFmpeg command with progress tracking
 */
export async function executeFFmpeg(
  args: string[],
  options: FFmpegOptions = {},
  processId?: string,
  duration?: number
): Promise<FFmpegResult> {
  const { ffmpeg } = resolveBinaryPaths();
  const { cwd, onProgress, onError } = options;

  return new Promise((resolve) => {
    console.log('[FFmpeg] Executing command:', ffmpeg, args.join(' '));

    const ffmpegProcess = spawn(ffmpeg, args, {
      cwd: cwd || process.cwd(),
      // Capture stderr where FFmpeg outputs progress
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    // Store process if ID provided (for cancellation)
    if (processId) {
      activeProcesses.set(processId, ffmpegProcess);
    }

    let stdout = '';
    let stderr = '';

    ffmpegProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    ffmpegProcess.stderr.on('data', (data) => {
      const line = data.toString();
      stderr += line;

      // Parse and emit progress
      if (onProgress) {
        const progress = parseProgress(line, duration);
        if (progress) {
          onProgress(progress);
        }
      }

      // Check for errors in stderr
      if (line.includes('Error') || line.includes('Invalid')) {
        if (onError) {
          onError(line);
        }
      }
    });

    ffmpegProcess.on('close', (code) => {
      // Clean up process reference
      if (processId) {
        activeProcesses.delete(processId);
      }

      const exitCode = code ?? -1;
      const success = exitCode === 0;

      console.log('[FFmpeg] Process finished with exit code:', exitCode);

      if (!success) {
        console.error('[FFmpeg] Error output:', stderr);
      }

      resolve({
        success,
        output: stdout || stderr,
        error: success ? undefined : stderr || 'FFmpeg process failed',
        exitCode,
      });
    });

    ffmpegProcess.on('error', (error) => {
      console.error('[FFmpeg] Process error:', error);
      
      if (processId) {
        activeProcesses.delete(processId);
      }

      if (onError) {
        onError(error.message);
      }

      resolve({
        success: false,
        output: '',
        error: error.message,
        exitCode: -1,
      });
    });
  });
}

/**
 * Cancel a running FFmpeg process
 */
export function cancelFFmpegProcess(processId: string): boolean {
  const process = activeProcesses.get(processId);
  if (process) {
    process.kill('SIGTERM');
    activeProcesses.delete(processId);
    console.log('[FFmpeg] Cancelled process:', processId);
    return true;
  }
  console.warn('[FFmpeg] Process not found for cancellation:', processId);
  return false;
}

/**
 * Get the number of active FFmpeg processes
 */
export function getActiveProcessCount(): number {
  return activeProcesses.size;
}
