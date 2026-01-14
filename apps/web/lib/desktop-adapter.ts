/**
 * Desktop environment detection and adapter utilities
 * Provides seamless integration between web and desktop versions
 */

import type { HLSDesktopAPI, FFmpegExecutor, FFprobeExecutor, FileSystemAPI } from '@/types/desktop';

/**
 * Check if the app is running in desktop mode (Electron)
 */
export function isDesktopEnvironment(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.isDesktop === true && 'hlsDesktop' in window;
}

/**
 * Get the desktop API if available
 * Returns null if running in web browser
 */
export function getDesktopAPI(): HLSDesktopAPI | null {
  if (!isDesktopEnvironment()) {
    return null;
  }
  return window.hlsDesktop || null;
}

/**
 * Get FFmpeg executor
 * Returns the desktop executor if available, null otherwise
 */
export function getFFmpegExecutor(): FFmpegExecutor | null {
  const api = getDesktopAPI();
  return api?.ffmpeg || null;
}

/**
 * Get FFprobe executor
 * Returns the desktop executor if available, null otherwise
 */
export function getFFprobeExecutor(): FFprobeExecutor | null {
  const api = getDesktopAPI();
  return api?.ffprobe || null;
}

/**
 * Get file system API
 * Returns the desktop file system API if available, null otherwise
 */
export function getFileSystemAPI(): FileSystemAPI | null {
  const api = getDesktopAPI();
  return api?.fs || null;
}

/**
 * Get platform information
 * Returns null if running in web browser
 */
export function getPlatformInfo() {
  const api = getDesktopAPI();
  return api?.platform.info() || null;
}

/**
 * Check if local FFmpeg processing is available
 */
export function hasLocalProcessing(): boolean {
  return getFFmpegExecutor() !== null;
}

/**
 * Open native file picker (desktop only)
 * Falls back to standard HTML file input in browser
 */
export async function selectVideoFile(): Promise<string | null> {
  const fs = getFileSystemAPI();
  
  if (fs) {
    // Desktop: Use native file picker
    return fs.selectFile({
      filters: [
        { name: 'Video Files', extensions: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
  }
  
  // Web: Return null (caller should use <input type="file">)
  return null;
}

/**
 * Open native directory picker (desktop only)
 */
export async function selectOutputDirectory(): Promise<string | null> {
  const fs = getFileSystemAPI();
  
  if (fs) {
    return fs.selectDirectory();
  }
  
  return null;
}

/**
 * Execute FFmpeg command with automatic fallback
 * If desktop mode: execute locally
 * If web mode: return null (caller should use API routes)
 */
export async function executeFFmpeg(
  command: string[],
  options?: {
    onProgress?: (progress: { percent: number; time: number }) => void;
    onError?: (error: string) => void;
  }
) {
  const ffmpeg = getFFmpegExecutor();
  
  if (!ffmpeg) {
    console.log('[Desktop Adapter] FFmpeg not available, use API routes instead');
    return null;
  }

  console.log('[Desktop Adapter] Executing FFmpeg locally:', command.slice(0, 5).join(' '), '...');
  
  return ffmpeg.execute(command, {
    onProgress: options?.onProgress,
    onError: options?.onError,
  });
}

/**
 * Probe a video file with automatic fallback
 * If desktop mode: probe locally
 * If web mode: return null (caller should use API routes)
 */
export async function probeVideoFile(filePath: string) {
  const ffprobe = getFFprobeExecutor();
  
  if (!ffprobe) {
    console.log('[Desktop Adapter] FFprobe not available, use API routes instead');
    return null;
  }

  console.log('[Desktop Adapter] Probing file locally:', filePath);
  
  return ffprobe.analyze(filePath);
}

/**
 * Log environment information
 */
export function logEnvironmentInfo() {
  if (isDesktopEnvironment()) {
    const info = getPlatformInfo();
    console.log('[Desktop Adapter] Running in desktop mode:', info);
  } else {
    console.log('[Desktop Adapter] Running in web browser mode');
  }
}
