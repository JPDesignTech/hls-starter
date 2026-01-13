import path from 'path';
import fs from 'fs';
import { app } from 'electron';

interface BinaryPaths {
  ffmpeg: string;
  ffprobe: string;
}

/**
 * Get the platform-specific binary directory name
 */
function getPlatformDir(): string {
  const platform = process.platform;
  const arch = process.arch;

  // Map to our bundled binary structure
  if (platform === 'darwin') {
    if (arch === 'arm64') return 'darwin-arm64';
    return 'darwin-x64';
  }
  
  if (platform === 'win32') {
    return 'win32-x64';
  }

  // Fallback for Linux (not currently supported but can be added)
  throw new Error(`Unsupported platform: ${platform}-${arch}`);
}

/**
 * Get the binary executable extension for the current platform
 */
function getBinaryExtension(): string {
  return process.platform === 'win32' ? '.exe' : '';
}

/**
 * Resolve the path to bundled FFmpeg binaries
 * In development, uses resources/ffmpeg
 * In production, uses app.asar.unpacked or extraResources
 */
export function resolveBinaryPaths(): BinaryPaths {
  const isDev = process.env.NODE_ENV === 'development';
  const platformDir = getPlatformDir();
  const ext = getBinaryExtension();

  let baseDir: string;

  if (isDev) {
    // In development, binaries are in apps/desktop/resources/ffmpeg
    baseDir = path.join(__dirname, '../../resources/ffmpeg', platformDir);
  } else {
    // In production, binaries are in extraResources
    const resourcesPath = process.resourcesPath || path.join(app.getAppPath(), '..');
    baseDir = path.join(resourcesPath, 'ffmpeg', platformDir);
  }

  const ffmpegPath = path.join(baseDir, `ffmpeg${ext}`);
  const ffprobePath = path.join(baseDir, `ffprobe${ext}`);

  console.log('[FFmpeg] Resolved binary paths:', { ffmpegPath, ffprobePath });

  return {
    ffmpeg: ffmpegPath,
    ffprobe: ffprobePath,
  };
}

/**
 * Validate that FFmpeg binaries exist and are executable
 */
export function validateBinaries(): { valid: boolean; error?: string } {
  try {
    const paths = resolveBinaryPaths();

    // Check if ffmpeg exists
    if (!fs.existsSync(paths.ffmpeg)) {
      return {
        valid: false,
        error: `FFmpeg binary not found at: ${paths.ffmpeg}`,
      };
    }

    // Check if ffprobe exists
    if (!fs.existsSync(paths.ffprobe)) {
      return {
        valid: false,
        error: `FFprobe binary not found at: ${paths.ffprobe}`,
      };
    }

    // On Unix-like systems, check if files are executable
    if (process.platform !== 'win32') {
      try {
        fs.accessSync(paths.ffmpeg, fs.constants.X_OK);
        fs.accessSync(paths.ffprobe, fs.constants.X_OK);
      } catch (error) {
        return {
          valid: false,
          error: 'FFmpeg binaries are not executable. Please check file permissions.',
        };
      }
    }

    console.log('[FFmpeg] Binary validation successful');
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown validation error',
    };
  }
}

/**
 * Get FFmpeg version information
 */
export async function getFFmpegVersion(ffmpegPath: string): Promise<string> {
  const { spawn } = await import('child_process');
  
  return new Promise((resolve, reject) => {
    const process = spawn(ffmpegPath, ['-version']);
    let output = '';

    process.stdout.on('data', (data) => {
      output += data.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        const versionMatch = output.match(/ffmpeg version (\S+)/);
        resolve(versionMatch ? versionMatch[1] : 'unknown');
      } else {
        reject(new Error(`Failed to get FFmpeg version (exit code: ${code})`));
      }
    });

    process.on('error', (error) => {
      reject(error);
    });
  });
}
