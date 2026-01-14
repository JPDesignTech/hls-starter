import { spawn } from 'child_process';
import { resolveBinaryPaths } from './binaries';

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

/**
 * Analyze a media file using ffprobe
 * Returns detailed information about the file's format and streams
 */
export async function probeFile(filePath: string): Promise<ProbeResult> {
  const { ffprobe } = resolveBinaryPaths();

  return new Promise((resolve, reject) => {
    console.log('[FFprobe] Analyzing file:', filePath);

    const args = [
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_format',
      '-show_streams',
      filePath,
    ];

    const ffprobeProcess = spawn(ffprobe, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    ffprobeProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    ffprobeProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ffprobeProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('[FFprobe] Error:', stderr);
        reject(new Error(`FFprobe failed with exit code ${code}: ${stderr}`));
        return;
      }

      try {
        const data = JSON.parse(stdout);
        console.log('[FFprobe] Analysis complete');

        // Map the ffprobe output to our ProbeResult interface
        const result: ProbeResult = {
          format: {
            filename: data.format.filename || '',
            format_name: data.format.format_name || '',
            format_long_name: data.format.format_long_name || '',
            duration: parseFloat(data.format.duration || '0'),
            size: parseInt(data.format.size || '0', 10),
            bit_rate: parseInt(data.format.bit_rate || '0', 10),
          },
          streams: (data.streams || []).map((stream: any) => ({
            index: stream.index,
            codec_name: stream.codec_name || '',
            codec_type: stream.codec_type || '',
            codec_long_name: stream.codec_long_name || '',
            width: stream.width,
            height: stream.height,
            sample_rate: stream.sample_rate ? parseInt(stream.sample_rate, 10) : undefined,
            channels: stream.channels,
            duration: stream.duration ? parseFloat(stream.duration) : undefined,
            bit_rate: stream.bit_rate ? parseInt(stream.bit_rate, 10) : undefined,
          })),
        };

        resolve(result);
      } catch (error) {
        console.error('[FFprobe] Failed to parse output:', error);
        reject(new Error('Failed to parse ffprobe output'));
      }
    });

    ffprobeProcess.on('error', (error) => {
      console.error('[FFprobe] Process error:', error);
      reject(error);
    });
  });
}

/**
 * Get just the duration of a media file (faster than full probe)
 */
export async function getFileDuration(filePath: string): Promise<number> {
  const { ffprobe } = resolveBinaryPaths();

  return new Promise((resolve, reject) => {
    const args = [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      filePath,
    ];

    const ffprobeProcess = spawn(ffprobe, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    ffprobeProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    ffprobeProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ffprobeProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`FFprobe failed: ${stderr}`));
        return;
      }

      const duration = parseFloat(stdout.trim());
      if (isNaN(duration)) {
        reject(new Error('Failed to parse duration'));
        return;
      }

      resolve(duration);
    });

    ffprobeProcess.on('error', reject);
  });
}
