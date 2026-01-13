export type FlagCategory = 'input' | 'output' | 'video' | 'audio' | 'filter' | 'global' | 'codec' | 'metadata';

export interface FlagExplanation {
  name: string;
  description: string;
  category: FlagCategory;
  example: string;
  commonValues?: string[];
  notes?: string;
  documentationUrl?: string;
}

export const flagExplanations: Record<string, FlagExplanation> = {
  // Input/Output
  '-i': {
    name: 'Input file',
    description: 'Specifies the input file path. Can be used multiple times for multiple inputs.',
    category: 'input',
    example: '-i input.mp4',
  },
  'input': {
    name: 'Input file',
    description: 'Input file path (used without -i flag)',
    category: 'input',
    example: 'input.mp4',
  },
  'output': {
    name: 'Output file',
    description: 'Output file path (last argument)',
    category: 'output',
    example: 'output.mp4',
  },

  // Video Codecs
  '-c:v': {
    name: 'Video codec',
    description: 'Sets the video codec for encoding or copying',
    category: 'codec',
    example: '-c:v libx264',
    commonValues: ['libx264', 'libx265', 'vp9', 'vp8', 'copy'],
  },
  '-vcodec': {
    name: 'Video codec (legacy)',
    description: 'Legacy flag for video codec (use -c:v instead)',
    category: 'codec',
    example: '-vcodec libx264',
  },
  '-codec:v': {
    name: 'Video codec (alternative)',
    description: 'Alternative syntax for video codec',
    category: 'codec',
    example: '-codec:v libx264',
  },

  // Audio Codecs
  '-c:a': {
    name: 'Audio codec',
    description: 'Sets the audio codec for encoding or copying',
    category: 'codec',
    example: '-c:a aac',
    commonValues: ['aac', 'mp3', 'libmp3lame', 'opus', 'vorbis', 'copy'],
  },
  '-acodec': {
    name: 'Audio codec (legacy)',
    description: 'Legacy flag for audio codec (use -c:a instead)',
    category: 'codec',
    example: '-acodec libmp3lame',
  },
  '-codec:a': {
    name: 'Audio codec (alternative)',
    description: 'Alternative syntax for audio codec',
    category: 'codec',
    example: '-codec:a aac',
  },

  // Video Options
  '-vn': {
    name: 'Disable video',
    description: 'Disables video output (audio only)',
    category: 'video',
    example: '-vn',
  },
  '-an': {
    name: 'Disable audio',
    description: 'Disables audio output (video only)',
    category: 'audio',
    example: '-an',
  },
  '-sn': {
    name: 'Disable subtitles',
    description: 'Disables subtitle output',
    category: 'global',
    example: '-sn',
  },
  '-r': {
    name: 'Frame rate',
    description: 'Sets the frame rate (fps) for output',
    category: 'video',
    example: '-r 30',
  },
  '-s': {
    name: 'Video size',
    description: 'Sets the video resolution (widthxheight)',
    category: 'video',
    example: '-s 1920x1080',
  },
  '-aspect': {
    name: 'Aspect ratio',
    description: 'Sets the aspect ratio (e.g., 16:9, 4:3)',
    category: 'video',
    example: '-aspect 16:9',
  },
  '-b:v': {
    name: 'Video bitrate',
    description: 'Sets the video bitrate',
    category: 'video',
    example: '-b:v 2000k',
  },
  '-maxrate': {
    name: 'Max bitrate',
    description: 'Sets the maximum video bitrate',
    category: 'video',
    example: '-maxrate 2500k',
  },
  '-bufsize': {
    name: 'Buffer size',
    description: 'Sets the rate control buffer size',
    category: 'video',
    example: '-bufsize 4000k',
  },
  '-crf': {
    name: 'Constant Rate Factor',
    description: 'Quality-based encoding (0-51, lower = better quality, 18-28 recommended)',
    category: 'video',
    example: '-crf 23',
  },
  '-preset': {
    name: 'Encoding preset',
    description: 'Encoding speed vs compression tradeoff',
    category: 'video',
    example: '-preset medium',
    commonValues: ['ultrafast', 'fast', 'medium', 'slow', 'veryslow'],
  },
  '-tune': {
    name: 'Tune',
    description: 'Optimize encoding for specific content type',
    category: 'video',
    example: '-tune film',
    commonValues: ['film', 'animation', 'grain', 'stillimage', 'fastdecode', 'zerolatency'],
  },
  '-profile:v': {
    name: 'Video profile',
    description: 'Sets the H.264/H.265 profile',
    category: 'codec',
    example: '-profile:v high',
    commonValues: ['baseline', 'main', 'high'],
  },
  '-level': {
    name: 'Level',
    description: 'Sets the H.264/H.265 level',
    category: 'codec',
    example: '-level 4.0',
  },
  '-pix_fmt': {
    name: 'Pixel format',
    description: 'Sets the pixel format',
    category: 'video',
    example: '-pix_fmt yuv420p',
    commonValues: ['yuv420p', 'yuv422p', 'yuv444p', 'rgb24'],
  },

  // Audio Options
  '-ab': {
    name: 'Audio bitrate',
    description: 'Sets the audio bitrate',
    category: 'audio',
    example: '-ab 192k',
  },
  '-b:a': {
    name: 'Audio bitrate (alternative)',
    description: 'Alternative syntax for audio bitrate',
    category: 'audio',
    example: '-b:a 192k',
  },
  '-ar': {
    name: 'Sample rate',
    description: 'Sets the audio sample rate in Hz',
    category: 'audio',
    example: '-ar 44100',
    commonValues: ['44100', '48000', '96000'],
  },
  '-ac': {
    name: 'Audio channels',
    description: 'Sets the number of audio channels',
    category: 'audio',
    example: '-ac 2',
    commonValues: ['1', '2', '5.1', '6'],
  },
  '-af': {
    name: 'Audio filter',
    description: 'Applies audio filters',
    category: 'filter',
    example: '-af "volume=0.5"',
  },

  // Filters
  '-vf': {
    name: 'Video filter',
    description: 'Applies video filters (can chain multiple with commas)',
    category: 'filter',
    example: '-vf "scale=1280:720"',
  },
  '-filter:v': {
    name: 'Video filter (alternative)',
    description: 'Alternative syntax for video filter',
    category: 'filter',
    example: '-filter:v "scale=1280:720"',
  },
  '-filter_complex': {
    name: 'Complex filter',
    description: 'Applies complex filter graphs with multiple inputs/outputs',
    category: 'filter',
    example: '-filter_complex "[0:v][1:v]overlay=10:10"',
  },
  'scale': {
    name: 'Scale filter',
    description: 'Resizes video (width:height, use -1 to maintain aspect ratio)',
    category: 'filter',
    example: 'scale=1280:720',
  },
  'overlay': {
    name: 'Overlay filter',
    description: 'Overlays one video/image on another',
    category: 'filter',
    example: 'overlay=10:10',
  },
  'fps': {
    name: 'FPS filter',
    description: 'Changes or extracts frames at specific frame rate',
    category: 'filter',
    example: 'fps=1',
  },
  'setpts': {
    name: 'Set PTS filter',
    description: 'Sets presentation timestamps (used for speed changes)',
    category: 'filter',
    example: 'setpts=0.5*PTS',
  },
  'atempo': {
    name: 'Audio tempo filter',
    description: 'Changes audio playback speed without pitch change',
    category: 'filter',
    example: 'atempo=2.0',
  },
  'volume': {
    name: 'Volume filter',
    description: 'Adjusts audio volume',
    category: 'filter',
    example: 'volume=0.5',
  },

  // Time/Seeking
  '-ss': {
    name: 'Start time',
    description: 'Seek to start time (can be before or after -i)',
    category: 'input',
    example: '-ss 00:00:10',
  },
  '-t': {
    name: 'Duration',
    description: 'Sets the duration of output',
    category: 'output',
    example: '-t 00:00:30',
  },
  '-to': {
    name: 'End time',
    description: 'Sets the end time for output',
    category: 'output',
    example: '-to 00:01:00',
  },

  // Frame Selection
  '-frames:v': {
    name: 'Video frames',
    description: 'Sets the number of video frames to output',
    category: 'video',
    example: '-frames:v 1',
  },
  '-vframes': {
    name: 'Video frames (legacy)',
    description: 'Legacy flag for number of video frames',
    category: 'video',
    example: '-vframes 1',
  },

  // Global Options
  '-y': {
    name: 'Overwrite output',
    description: 'Automatically overwrite output files without asking',
    category: 'global',
    example: '-y',
  },
  '-n': {
    name: 'No overwrite',
    description: 'Do not overwrite output files',
    category: 'global',
    example: '-n',
  },
  '-f': {
    name: 'Format',
    description: 'Forces input or output format',
    category: 'global',
    example: '-f mp4',
  },
  '-threads': {
    name: 'Threads',
    description: 'Sets the number of threads to use',
    category: 'global',
    example: '-threads 4',
  },
  '-loglevel': {
    name: 'Log level',
    description: 'Sets the logging verbosity',
    category: 'global',
    example: '-loglevel error',
    commonValues: ['quiet', 'panic', 'fatal', 'error', 'warning', 'info', 'verbose', 'debug'],
  },
  '-hide_banner': {
    name: 'Hide banner',
    description: 'Suppresses printing banner',
    category: 'global',
    example: '-hide_banner',
  },
  '-stats': {
    name: 'Show stats',
    description: 'Shows encoding progress and statistics',
    category: 'global',
    example: '-stats',
  },
  '-progress': {
    name: 'Progress',
    description: 'Writes progress information to a file',
    category: 'global',
    example: '-progress progress.txt',
  },

  // Metadata
  '-metadata': {
    name: 'Metadata',
    description: 'Sets metadata key-value pairs',
    category: 'metadata',
    example: '-metadata title="My Video"',
  },
  '-map': {
    name: 'Map streams',
    description: 'Maps input streams to output (selects which streams to include)',
    category: 'global',
    example: '-map 0:v:0 -map 0:a:0',
  },
  '-map_metadata': {
    name: 'Map metadata',
    description: 'Maps metadata from input to output',
    category: 'metadata',
    example: '-map_metadata 0',
  },
};

const DOCUMENTATION_BASE_URL = 'https://ffmpeg.org/ffmpeg.html';

// Map categories to documentation sections
const categoryToSection: Record<FlagCategory, string> = {
  'input': '#main-options',
  'output': '#main-options',
  'video': '#video-options',
  'audio': '#audio-options',
  'filter': '#advanced-options',
  'global': '#generic-options',
  'codec': '#main-options',
  'metadata': '#main-options',
};

// Specific flag anchors (flags that have dedicated sections or specific mentions)
const flagSpecificAnchors: Record<string, string> = {
  '-i': '#main-options',
  '-c:v': '#main-options',
  '-c:a': '#main-options',
  '-codec': '#main-options',
  '-codec:v': '#main-options',
  '-codec:a': '#main-options',
  '-vcodec': '#main-options',
  '-acodec': '#main-options',
  '-vf': '#video-options',
  '-filter:v': '#video-options',
  '-af': '#audio-options',
  '-filter:a': '#audio-options',
  '-filter_complex': '#advanced-options',
  '-map': '#advanced-options',
  '-ss': '#main-options',
  '-t': '#main-options',
  '-to': '#main-options',
  '-crf': '#advanced-video-options',
  '-preset': '#advanced-video-options',
  '-b:v': '#video-options',
  '-b:a': '#audio-options',
  '-ab': '#audio-options',
  '-r': '#video-options',
  '-s': '#video-options',
  '-ar': '#audio-options',
  '-ac': '#audio-options',
  '-vn': '#video-options',
  '-an': '#audio-options',
  '-sn': '#advanced-subtitle-options',
  '-frames:v': '#video-options',
  '-vframes': '#video-options',
  '-pix_fmt': '#advanced-video-options',
  '-metadata': '#main-options',
  '-map_metadata': '#advanced-options',
  '-y': '#main-options',
  '-n': '#main-options',
  '-f': '#main-options',
  '-threads': '#generic-options',
  '-loglevel': '#generic-options',
  '-hide_banner': '#generic-options',
  '-stats': '#generic-options',
  '-progress': '#generic-options',
};

export function getDocumentationUrl(flag: string, category: FlagCategory): string {
  // Check for specific anchor first
  if (flagSpecificAnchors[flag]) {
    return `${DOCUMENTATION_BASE_URL}${flagSpecificAnchors[flag]}`;
  }
  
  // Fall back to category-based section
  const section = categoryToSection[category] || '#main-options';
  return `${DOCUMENTATION_BASE_URL}${section}`;
}

// Helper function to get explanation for a flag
export function getFlagExplanation(flag: string): FlagExplanation | undefined {
  // Remove leading dashes and normalize
  const normalized = flag.toLowerCase().replace(/^-+/, '');
  
  let explanation: FlagExplanation | undefined;
  
  // Try exact match first
  if (flagExplanations[flag]) {
    explanation = flagExplanations[flag];
  }
  // Try normalized version
  else if (flagExplanations[normalized]) {
    explanation = flagExplanations[normalized];
  }
  // Try without leading dash
  else {
    const withoutDash = flag.startsWith('-') ? flag.slice(1) : flag;
    if (flagExplanations[withoutDash]) {
      explanation = flagExplanations[withoutDash];
    }
  }
  
  if (explanation) {
    return {
      ...explanation,
      documentationUrl: explanation.documentationUrl || getDocumentationUrl(flag, explanation.category),
    };
  }
  
  return undefined;
}

// Get all flags by category
export function getFlagsByCategory(category: FlagCategory): Array<[string, FlagExplanation]> {
  return Object.entries(flagExplanations).filter(
    ([_, explanation]) => explanation.category === category
  );
}
