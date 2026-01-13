import { ipcMain, BrowserWindow } from 'electron';
import { executeFFmpeg, cancelFFmpegProcess } from '../ffmpeg/executor';
import { probeFile, getFileDuration } from '../ffmpeg/probe';
import { validateBinaries } from '../ffmpeg/binaries';
import { v4 as uuidv4 } from 'uuid';

// Add uuid as a dependency
// This file handles all FFmpeg-related IPC communication

/**
 * Setup FFmpeg IPC handlers
 * These handlers allow the renderer process to execute ffmpeg/ffprobe commands
 */
export function setupFFmpegHandlers() {
  // Validate binaries on startup
  const validation = validateBinaries();
  if (!validation.valid) {
    console.error('[FFmpeg] Binary validation failed:', validation.error);
    // You might want to show a dialog to the user here
  }

  /**
   * Execute an FFmpeg command
   * Returns a promise that resolves when the command completes
   */
  ipcMain.handle('ffmpeg:execute', async (event, args: string[], options?: any) => {
    const processId = uuidv4();
    const mainWindow = BrowserWindow.fromWebContents(event.sender);

    console.log('[IPC] FFmpeg execute request:', { processId, args: args.slice(0, 5) });

    // Get duration for progress calculation if input file is provided
    let duration: number | undefined;
    const inputIndex = args.indexOf('-i');
    if (inputIndex !== -1 && args[inputIndex + 1]) {
      try {
        duration = await getFileDuration(args[inputIndex + 1]);
        console.log('[IPC] Input file duration:', duration);
      } catch (error) {
        console.warn('[IPC] Could not get file duration:', error);
      }
    }

    try {
      const result = await executeFFmpeg(
        args,
        {
          cwd: options?.cwd,
          onProgress: (progress) => {
            // Send progress updates back to renderer
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('ffmpeg:progress', {
                processId,
                progress,
              });
            }
          },
          onError: (error) => {
            console.error('[IPC] FFmpeg error:', error);
          },
        },
        processId,
        duration
      );

      console.log('[IPC] FFmpeg execution completed:', {
        processId,
        success: result.success,
        exitCode: result.exitCode,
      });

      return result;
    } catch (error) {
      console.error('[IPC] FFmpeg execution failed:', error);
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error',
        exitCode: -1,
      };
    }
  });

  /**
   * Cancel a running FFmpeg process
   */
  ipcMain.handle('ffmpeg:cancel', async (event, processId: string) => {
    console.log('[IPC] FFmpeg cancel request:', processId);
    const success = cancelFFmpegProcess(processId);
    return { success };
  });

  /**
   * Analyze a media file with ffprobe
   */
  ipcMain.handle('ffprobe:analyze', async (event, filePath: string) => {
    console.log('[IPC] FFprobe analyze request:', filePath);

    try {
      const result = await probeFile(filePath);
      console.log('[IPC] FFprobe analysis completed');
      return result;
    } catch (error) {
      console.error('[IPC] FFprobe analysis failed:', error);
      throw error;
    }
  });

  /**
   * Get duration of a media file (faster than full probe)
   */
  ipcMain.handle('ffprobe:duration', async (event, filePath: string) => {
    console.log('[IPC] FFprobe duration request:', filePath);

    try {
      const duration = await getFileDuration(filePath);
      console.log('[IPC] Duration:', duration);
      return duration;
    } catch (error) {
      console.error('[IPC] Failed to get duration:', error);
      throw error;
    }
  });

  console.log('[IPC] FFmpeg handlers registered');
}
