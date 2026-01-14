// Preload script for HLS Starter Desktop
// This script runs in the renderer process before web content loads
// Used for exposing safe APIs to the renderer via contextBridge

import { contextBridge, ipcRenderer } from 'electron';
import type {
  HLSDesktopAPI,
  FFmpegOptions,
  FFmpegResult,
  FFmpegProgress,
  ProbeResult,
  PlatformInfo,
} from '../types/preload';

/**
 * Expose desktop-specific APIs to the renderer process
 * These APIs are available via window.hlsDesktop in the web app
 */
const hlsDesktopAPI: HLSDesktopAPI = {
  // FFmpeg command execution
  ffmpeg: {
    /**
     * Execute an FFmpeg command
     * @param command - Array of command arguments (without 'ffmpeg' itself)
     * @param options - Execution options including progress callback
     * @returns Promise resolving to execution result
     */
    execute: async (command: string[], options?: FFmpegOptions): Promise<FFmpegResult> => {
      // Set up progress listener if callback provided
      let progressListener: ((event: any, data: { processId: string; progress: FFmpegProgress }) => void) | null = null;
      
      if (options?.onProgress) {
        progressListener = (event: any, data: { processId: string; progress: FFmpegProgress }) => {
          options.onProgress!(data.progress);
        };
        ipcRenderer.on('ffmpeg:progress', progressListener);
      }

      try {
        const result = await ipcRenderer.invoke('ffmpeg:execute', command, {
          cwd: options?.cwd,
        });

        // Clean up progress listener
        if (progressListener) {
          ipcRenderer.removeListener('ffmpeg:progress', progressListener);
        }

        return result;
      } catch (error) {
        // Clean up progress listener on error
        if (progressListener) {
          ipcRenderer.removeListener('ffmpeg:progress', progressListener);
        }
        throw error;
      }
    },

    /**
     * Cancel a running FFmpeg process
     * @param id - Process ID to cancel
     */
    cancel: async (id: string): Promise<void> => {
      const result = await ipcRenderer.invoke('ffmpeg:cancel', id);
      if (!result.success) {
        throw new Error(`Failed to cancel process: ${id}`);
      }
    },
  },

  // FFprobe media analysis
  ffprobe: {
    /**
     * Analyze a media file to get detailed information
     * @param filePath - Path to the media file
     * @returns Promise resolving to probe result with format and stream info
     */
    analyze: async (filePath: string): Promise<ProbeResult> => {
      return ipcRenderer.invoke('ffprobe:analyze', filePath);
    },
  },

  // File system operations
  fs: {
    /**
     * Show native file picker dialog
     * @param options - Optional filters for file types
     * @returns Promise resolving to selected file path or null if cancelled
     */
    selectFile: async (options?: { filters?: Array<{ name: string; extensions: string[] }> }): Promise<string | null> => {
      return ipcRenderer.invoke('fs:select-file', options);
    },

    /**
     * Show native directory picker dialog
     * @returns Promise resolving to selected directory path or null if cancelled
     */
    selectDirectory: async (): Promise<string | null> => {
      return ipcRenderer.invoke('fs:select-directory');
    },

    /**
     * Show native save dialog
     * @param defaultPath - Optional default save path
     * @returns Promise resolving to selected save location or null if cancelled
     */
    selectSaveLocation: async (defaultPath?: string): Promise<string | null> => {
      return ipcRenderer.invoke('fs:select-save-location', defaultPath);
    },
  },

  // Platform information
  platform: {
    /**
     * Get platform and app version information
     * @returns Platform info object
     */
    info: (): PlatformInfo => {
      // This can be synchronous since we're just reading process properties
      return ipcRenderer.sendSync('platform:info');
    },
  },

  // Window controls
  window: {
    /**
     * Minimize the application window
     */
    minimize: () => {
      ipcRenderer.send('window-minimize');
    },

    /**
     * Toggle maximize/restore the application window
     */
    maximize: () => {
      ipcRenderer.send('window-maximize');
    },

    /**
     * Close the application window
     */
    close: () => {
      ipcRenderer.send('window-close');
    },

    /**
     * Check if the window is currently maximized
     * @returns Promise resolving to true if maximized, false otherwise
     */
    isMaximized: async (): Promise<boolean> => {
      return ipcRenderer.invoke('window-is-maximized');
    },
  },
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('hlsDesktop', hlsDesktopAPI);

// Also expose a flag to detect if running in desktop mode
contextBridge.exposeInMainWorld('isDesktop', true);

console.log('[Preload] HLS Desktop API exposed to renderer');
