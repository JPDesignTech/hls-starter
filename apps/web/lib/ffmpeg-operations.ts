export type ParameterType = 'select' | 'input' | 'number' | 'text';

export interface ParameterOption {
  value: string;
  label: string;
}

export interface Parameter {
  id: string;
  label: string;
  type: ParameterType;
  options?: ParameterOption[];
  defaultValue?: string;
  help: string;
  placeholder?: string;
  min?: number;
  max?: number;
}

export interface Operation {
  id: string;
  name: string;
  description: string;
  params: Parameter[];
  learningTip?: string;
}

export const operations: Operation[] = [
  {
    id: 'convert',
    name: 'Convert Format',
    description: 'Convert video from one format to another',
    params: [
      {
        id: 'inputFormat',
        label: 'Input Format',
        type: 'select',
        options: [
          { value: 'mp4', label: 'MP4' },
          { value: 'avi', label: 'AVI' },
          { value: 'mkv', label: 'MKV' },
          { value: 'mov', label: 'MOV' },
          { value: 'webm', label: 'WebM' },
          { value: 'flv', label: 'FLV' },
        ],
        defaultValue: 'mp4',
        help: 'The format of your source video file',
      },
      {
        id: 'outputFormat',
        label: 'Output Format',
        type: 'select',
        options: [
          { value: 'mp4', label: 'MP4' },
          { value: 'avi', label: 'AVI' },
          { value: 'mkv', label: 'MKV' },
          { value: 'mov', label: 'MOV' },
          { value: 'webm', label: 'WebM' },
          { value: 'flv', label: 'FLV' },
        ],
        defaultValue: 'webm',
        help: 'The desired output format',
      },
      {
        id: 'videoCodec',
        label: 'Video Codec',
        type: 'select',
        options: [
          { value: 'copy', label: 'Copy (no re-encode)' },
          { value: 'libx264', label: 'H.264' },
          { value: 'libx265', label: 'H.265/HEVC' },
          { value: 'vp9', label: 'VP9' },
          { value: 'vp8', label: 'VP8' },
        ],
        defaultValue: 'libx264',
        help: 'Video codec determines compression and quality',
      },
      {
        id: 'audioCodec',
        label: 'Audio Codec',
        type: 'select',
        options: [
          { value: 'copy', label: 'Copy (no re-encode)' },
          { value: 'aac', label: 'AAC' },
          { value: 'mp3', label: 'MP3' },
          { value: 'opus', label: 'Opus' },
          { value: 'vorbis', label: 'Vorbis' },
        ],
        defaultValue: 'aac',
        help: 'Audio codec for the output file',
      },
    ],
    learningTip: 'Use "copy" codec to avoid re-encoding when formats are compatible, which is much faster.',
  },
  {
    id: 'resize',
    name: 'Resize Video',
    description: 'Change video resolution and dimensions',
    params: [
      {
        id: 'width',
        label: 'Width',
        type: 'number',
        defaultValue: '1280',
        help: 'Output width in pixels (-1 for auto)',
        min: -1,
        max: 7680,
      },
      {
        id: 'height',
        label: 'Height',
        type: 'number',
        defaultValue: '720',
        help: 'Output height in pixels (-1 for auto)',
        min: -1,
        max: 4320,
      },
      {
        id: 'aspectRatio',
        label: 'Maintain Aspect Ratio',
        type: 'select',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ],
        defaultValue: 'yes',
        help: 'Keep original proportions when resizing',
      },
    ],
    learningTip: 'Use -1 for width or height to maintain aspect ratio automatically.',
  },
  {
    id: 'compress',
    name: 'Compress Video',
    description: 'Reduce file size with quality control',
    params: [
      {
        id: 'crf',
        label: 'CRF (Quality)',
        type: 'number',
        defaultValue: '23',
        help: 'Constant Rate Factor: 0-51, lower = better quality (18-28 recommended)',
        min: 0,
        max: 51,
      },
      {
        id: 'preset',
        label: 'Encoding Preset',
        type: 'select',
        options: [
          { value: 'ultrafast', label: 'Ultra Fast' },
          { value: 'fast', label: 'Fast' },
          { value: 'medium', label: 'Medium' },
          { value: 'slow', label: 'Slow' },
          { value: 'veryslow', label: 'Very Slow' },
        ],
        defaultValue: 'medium',
        help: 'Speed vs compression tradeoff',
      },
      {
        id: 'maxBitrate',
        label: 'Max Bitrate (optional)',
        type: 'input',
        defaultValue: '',
        help: 'Maximum bitrate in kbps (e.g., 2000 for 2Mbps). Leave empty for CRF-only.',
        placeholder: '2000',
      },
    ],
    learningTip: 'CRF 18-23 is typically good quality. Lower CRF = better quality but larger files.',
  },
  {
    id: 'extract',
    name: 'Extract Audio',
    description: 'Extract audio track from video file',
    params: [
      {
        id: 'audioFormat',
        label: 'Audio Format',
        type: 'select',
        options: [
          { value: 'mp3', label: 'MP3' },
          { value: 'aac', label: 'AAC' },
          { value: 'wav', label: 'WAV' },
          { value: 'flac', label: 'FLAC' },
          { value: 'ogg', label: 'OGG' },
        ],
        defaultValue: 'mp3',
        help: 'Output audio file format',
      },
      {
        id: 'bitrate',
        label: 'Audio Bitrate',
        type: 'select',
        options: [
          { value: '128k', label: '128 kbps' },
          { value: '192k', label: '192 kbps' },
          { value: '256k', label: '256 kbps' },
          { value: '320k', label: '320 kbps' },
        ],
        defaultValue: '192k',
        help: 'Higher bitrate = better audio quality',
      },
      {
        id: 'sampleRate',
        label: 'Sample Rate (optional)',
        type: 'select',
        options: [
          { value: '', label: 'Keep original' },
          { value: '44100', label: '44.1 kHz' },
          { value: '48000', label: '48 kHz' },
          { value: '96000', label: '96 kHz' },
        ],
        defaultValue: '',
        help: 'Audio sample rate in Hz',
      },
    ],
    learningTip: 'The -vn flag disables video output, extracting only audio.',
  },
  {
    id: 'trim',
    name: 'Trim Video',
    description: 'Cut a segment from a video',
    params: [
      {
        id: 'startTime',
        label: 'Start Time',
        type: 'input',
        defaultValue: '00:00:00',
        help: 'Start time in format HH:MM:SS or seconds',
        placeholder: '00:00:10',
      },
      {
        id: 'duration',
        label: 'Duration',
        type: 'input',
        defaultValue: '00:00:10',
        help: 'Duration to extract in format HH:MM:SS or seconds',
        placeholder: '00:00:30',
      },
    ],
    learningTip: 'Use -ss for start time and -t for duration. Both accept seconds or HH:MM:SS format.',
  },
  {
    id: 'watermark',
    name: 'Add Watermark',
    description: 'Overlay an image watermark on video',
    params: [
      {
        id: 'position',
        label: 'Watermark Position',
        type: 'select',
        options: [
          { value: 'top-left', label: 'Top Left' },
          { value: 'top-right', label: 'Top Right' },
          { value: 'bottom-left', label: 'Bottom Left' },
          { value: 'bottom-right', label: 'Bottom Right' },
          { value: 'center', label: 'Center' },
        ],
        defaultValue: 'bottom-right',
        help: 'Position of the watermark on the video',
      },
      {
        id: 'opacity',
        label: 'Opacity',
        type: 'number',
        defaultValue: '0.5',
        help: 'Watermark opacity (0.0 to 1.0)',
        min: 0,
        max: 1,
      },
      {
        id: 'scale',
        label: 'Watermark Scale',
        type: 'input',
        defaultValue: '0.1',
        help: 'Scale factor relative to video (e.g., 0.1 = 10% of video size)',
        placeholder: '0.1',
      },
    ],
    learningTip: 'The overlay filter combines multiple inputs. Position uses x/y coordinates.',
  },
  {
    id: 'extractFrames',
    name: 'Extract Frames',
    description: 'Extract individual frames from video',
    params: [
      {
        id: 'fps',
        label: 'Frames Per Second',
        type: 'number',
        defaultValue: '1',
        help: 'How many frames to extract per second (1 = one frame per second)',
        min: 0.1,
        max: 60,
      },
      {
        id: 'outputFormat',
        label: 'Output Format',
        type: 'select',
        options: [
          { value: 'png', label: 'PNG' },
          { value: 'jpg', label: 'JPEG' },
          { value: 'webp', label: 'WebP' },
        ],
        defaultValue: 'png',
        help: 'Image format for extracted frames',
      },
      {
        id: 'startTime',
        label: 'Start Time (optional)',
        type: 'input',
        defaultValue: '',
        help: 'Start extracting from this time (HH:MM:SS or seconds)',
        placeholder: '00:00:05',
      },
    ],
    learningTip: 'Use -vf fps=1 to extract one frame per second. Combine with -ss for start time.',
  },
  {
    id: 'speed',
    name: 'Change Speed',
    description: 'Speed up or slow down video playback',
    params: [
      {
        id: 'speedFactor',
        label: 'Speed Factor',
        type: 'select',
        options: [
          { value: '0.5', label: '0.5x (Half Speed)' },
          { value: '0.75', label: '0.75x (Slower)' },
          { value: '1.0', label: '1.0x (Normal)' },
          { value: '1.25', label: '1.25x (Faster)' },
          { value: '1.5', label: '1.5x (Faster)' },
          { value: '2.0', label: '2.0x (Double Speed)' },
        ],
        defaultValue: '1.0',
        help: 'Speed multiplier (1.0 = normal speed)',
      },
    ],
    learningTip: 'The setpts filter adjusts presentation timestamps. Speed = 1/setpts value.',
  },
  {
    id: 'thumbnail',
    name: 'Generate Thumbnail',
    description: 'Extract a single frame as an image',
    params: [
      {
        id: 'timestamp',
        label: 'Timestamp',
        type: 'input',
        defaultValue: '00:00:01',
        help: 'Time to extract frame (HH:MM:SS or seconds)',
        placeholder: '00:00:05',
      },
      {
        id: 'width',
        label: 'Thumbnail Width',
        type: 'number',
        defaultValue: '320',
        help: 'Output image width in pixels',
        min: 1,
        max: 7680,
      },
      {
        id: 'height',
        label: 'Thumbnail Height',
        type: 'number',
        defaultValue: '180',
        help: 'Output image height in pixels',
        min: 1,
        max: 4320,
      },
    ],
    learningTip: 'Use -ss to seek to timestamp, -vframes 1 to extract one frame, and -s for size.',
  },
  {
    id: 'merge',
    name: 'Merge Videos',
    description: 'Concatenate multiple video files',
    params: [
      {
        id: 'method',
        label: 'Merge Method',
        type: 'select',
        options: [
          { value: 'concat', label: 'Concat Demuxer (same codecs)' },
          { value: 'filter', label: 'Concat Filter (different codecs)' },
        ],
        defaultValue: 'concat',
        help: 'Method depends on whether videos have same codecs',
      },
    ],
    learningTip: 'Concat demuxer is faster but requires same codecs. Filter works with different codecs.',
  },
];

export function getOperationById(id: string): Operation | undefined {
  return operations.find(op => op.id === id);
}
