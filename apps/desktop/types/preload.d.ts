// Type definitions for the HLS Desktop API exposed via contextBridge

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
}

export interface FFmpegResult {
  success: boolean;
  output: string;
  error?: string;
  exitCode: number;
}

export interface FFmpegExecutor {
  execute(command: string[], options?: FFmpegOptions): Promise<FFmpegResult>;
  cancel(id: string): Promise<void>;
}

export interface ProbeResult {
  format: {
    filename: string;
    format_name: string;
    format_long_name: string;
    duration: number;
    size: number;
    bit_rate: number;
  };
  streams: Array<{
    index: number;
    codec_name: string;
    codec_type: string;
    codec_long_name: string;
    width?: number;
    height?: number;
    sample_rate?: number;
    channels?: number;
    duration?: number;
    bit_rate?: number;
  }>;
}

export interface FFprobeExecutor {
  analyze(filePath: string): Promise<ProbeResult>;
}

export interface FileSystemAPI {
  selectFile(options?: { filters?: Array<{ name: string; extensions: string[] }> }): Promise<string | null>;
  selectDirectory(): Promise<string | null>;
  selectSaveLocation(defaultPath?: string): Promise<string | null>;
}

export interface PlatformInfo {
  platform: string;
  arch: string;
  version: string;
  appVersion: string;
  storageMode: 'local-only' | 'hybrid';
}

export interface HLSDesktopAPI {
  ffmpeg: FFmpegExecutor;
  ffprobe: FFprobeExecutor;
  fs: FileSystemAPI;
  platform: {
    info(): PlatformInfo;
  };
  window: {
    minimize(): void;
    maximize(): void;
    close(): void;
    isMaximized(): Promise<boolean>;
  };
}

declare global {
  interface Window {
    hlsDesktop: HLSDesktopAPI;
  }
}

export {};
