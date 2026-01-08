// Tutorial content data structure and types

export interface TextBlock {
  type: 'text';
  content: string; // Markdown or HTML content
  title?: string;
}

export interface CodeBlock {
  type: 'code';
  command: string;
  explanation?: string;
  flagBreakdown?: Array<{
    flag: string;
    description: string;
  }>;
  tryItYourself?: boolean; // Link to command builder
}

export interface ChallengeBlock {
  type: 'challenge';
  title: string;
  description: string;
  requirements: string[];
  hints: string[];
  solution: string;
  validation?: {
    type: 'exact' | 'contains' | 'regex';
    value: string;
  };
}

export interface QuizBlock {
  type: 'quiz';
  question: string;
  options: Array<{
    id: string;
    text: string;
    correct: boolean;
  }>;
  explanation: string;
}

// New section types for redesigned tutorial
export interface IntroductionBlock {
  type: 'introduction';
  heading: string;
  content: string;
}

export interface BulletsBlock {
  type: 'bullets';
  heading: string;
  content?: string;
  bullets: string[];
}

export interface PreviewBlock {
  type: 'preview';
  heading: string;
  content: string;
  code: string;
  explanation?: string;
  previewType: 'resize' | 'crop' | 'format' | 'filter';
  sampleVideoId: string;
}

export type ContentBlock = TextBlock | CodeBlock | ChallengeBlock | QuizBlock | IntroductionBlock | BulletsBlock | PreviewBlock;

export interface Lesson {
  id: string;
  title: string;
  module: string;
  duration: number; // minutes
  content: ContentBlock[];
  unlockAfter?: string; // lesson id prerequisite
}

export const lessons: Lesson[] = [
  {
    id: 'what-is-ffmpeg',
    title: 'What is FFMPEG?',
    module: 'Fundamentals',
    duration: 15,
    content: [
      {
        type: 'text',
        title: 'Introduction',
        content: `FFMPEG is a powerful, open-source multimedia framework that can decode, encode, transcode, mux, demux, stream, filter, and play almost any media format. It's the backbone of many video processing applications and services.

## What FFMPEG Does

FFMPEG provides a comprehensive solution for:
- **Transcoding**: Converting media files from one format to another
- **Streaming**: Processing live or on-demand media streams
- **Filtering**: Applying effects, transformations, and enhancements
- **Analysis**: Extracting metadata and technical information from media files

## Core Components

FFMPEG consists of several command-line tools:
- **ffmpeg**: The main tool for converting media files
- **ffprobe**: For analyzing and gathering information about media files
- **ffplay**: A simple media player for testing

## Why Learn FFMPEG?

Understanding FFMPEG gives you:
- Complete control over video and audio processing
- The ability to automate complex media workflows
- Deep understanding of codecs, containers, and streaming protocols
- Skills applicable to video editing, streaming, and media analysis`
      },
      {
        type: 'code',
        command: 'ffmpeg -version',
        explanation: 'Check your FFMPEG installation and version information',
        flagBreakdown: [
          {
            flag: '-version',
            description: 'Display version information and build configuration'
          }
        ]
      },
      {
        type: 'quiz',
        question: 'What is the primary purpose of FFMPEG?',
        options: [
          { id: 'a', text: 'Video editing', correct: false },
          { id: 'b', text: 'Media transcoding and processing', correct: true },
          { id: 'c', text: 'Video streaming only', correct: false },
          { id: 'd', text: 'Audio editing', correct: false }
        ],
        explanation: 'FFMPEG is primarily a multimedia framework for transcoding, encoding, decoding, and processing various media formats, not just for editing.'
      }
    ]
  },
  {
    id: 'input-output',
    title: 'Input and Output',
    module: 'Fundamentals',
    duration: 20,
    unlockAfter: 'what-is-ffmpeg',
    content: [
      {
        type: 'text',
        title: 'Basic FFMPEG Command Structure',
        content: `Every FFMPEG command follows a basic structure:

\`\`\`
ffmpeg [input options] -i input_file [output options] output_file
\`\`\`

The \`-i\` flag specifies the input file, and the last argument is typically the output file.

## Input Files

You can specify multiple input files by using multiple \`-i\` flags. FFMPEG will process them in order.`
      },
      {
        type: 'code',
        command: 'ffmpeg -i input.mp4 output.avi',
        explanation: 'Basic transcoding: convert MP4 to AVI format',
        flagBreakdown: [
          {
            flag: '-i input.mp4',
            description: 'Specify the input file (input.mp4)'
          },
          {
            flag: 'output.avi',
            description: 'The output filename and format (determined by extension)'
          }
        ],
        tryItYourself: true
      },
      {
        type: 'challenge',
        title: 'Convert a Video File',
        description: 'Write an FFMPEG command to convert a video file named "video.mp4" to "video.mkv"',
        requirements: [
          'Use the -i flag for input',
          'Specify the output filename with .mkv extension'
        ],
        hints: [
          'Start with ffmpeg',
          'Use -i to specify the input file',
          'The output filename comes last'
        ],
        solution: 'ffmpeg -i video.mp4 video.mkv',
        validation: {
          type: 'contains',
          value: '-i video.mp4'
        }
      },
      {
        type: 'quiz',
        question: 'What does the -i flag do in FFMPEG?',
        options: [
          { id: 'a', text: 'Sets the output file', correct: false },
          { id: 'b', text: 'Specifies the input file', correct: true },
          { id: 'c', text: 'Enables interactive mode', correct: false },
          { id: 'd', text: 'Sets the input codec', correct: false }
        ],
        explanation: 'The -i flag is used to specify the input file(s) for FFMPEG to process.'
      }
    ]
  },
  {
    id: 'video-codecs',
    title: 'Video Codecs',
    module: 'Video Processing',
    duration: 25,
    unlockAfter: 'input-output',
    content: [
      {
        type: 'text',
        title: 'Understanding Video Codecs',
        content: `A codec (coder-decoder) is a program that compresses and decompresses digital video. FFMPEG supports many codecs, each with different characteristics.

## Common Video Codecs

- **H.264 (libx264)**: Most widely supported, good balance of quality and file size
- **H.265/HEVC (libx265)**: Better compression than H.264, smaller files
- **VP9**: Open-source codec, excellent for web streaming
- **AV1**: Latest generation, best compression but slower encoding

## Selecting a Codec

Use the \`-c:v\` (or \`-vcodec\`) flag to specify the video codec.`
      },
      {
        type: 'code',
        command: 'ffmpeg -i input.mp4 -c:v libx264 output.mp4',
        explanation: 'Convert video using H.264 codec',
        flagBreakdown: [
          {
            flag: '-c:v libx264',
            description: 'Set the video codec to H.264 (libx264 encoder)'
          }
        ],
        tryItYourself: true
      },
      {
        type: 'code',
        command: 'ffmpeg -i input.mp4 -c:v libx265 output.mp4',
        explanation: 'Convert video using H.265/HEVC codec for better compression',
        flagBreakdown: [
          {
            flag: '-c:v libx265',
            description: 'Set the video codec to H.265/HEVC for better compression'
          }
        ]
      },
      {
        type: 'challenge',
        title: 'Convert with Specific Codec',
        description: 'Write a command to convert input.mp4 to output.mp4 using the VP9 codec (libvpx-vp9)',
        requirements: [
          'Use -c:v flag',
          'Specify libvpx-vp9 as the codec'
        ],
        hints: [
          'The codec name is libvpx-vp9',
          'Remember to use -c:v before the codec name'
        ],
        solution: 'ffmpeg -i input.mp4 -c:v libvpx-vp9 output.mp4',
        validation: {
          type: 'contains',
          value: 'libvpx-vp9'
        }
      },
      {
        type: 'quiz',
        question: 'Which flag is used to specify the video codec?',
        options: [
          { id: 'a', text: '-codec', correct: false },
          { id: 'b', text: '-c:v or -vcodec', correct: true },
          { id: 'c', text: '-v', correct: false },
          { id: 'd', text: '-video', correct: false }
        ],
        explanation: 'The -c:v (or -vcodec) flag is used to specify the video codec in FFMPEG commands.'
      }
    ]
  },
  {
    id: 'audio-codecs',
    title: 'Audio Codecs',
    module: 'Audio Processing',
    duration: 20,
    unlockAfter: 'video-codecs',
    content: [
      {
        type: 'text',
        title: 'Audio Codec Basics',
        content: `Just like video, audio also uses codecs to compress and decompress audio data. FFMPEG supports many audio codecs.

## Common Audio Codecs

- **AAC**: Advanced Audio Coding, widely supported, good quality
- **MP3**: Very common, good compatibility
- **Opus**: Excellent quality at low bitrates, great for streaming
- **FLAC**: Lossless compression, no quality loss

## Selecting an Audio Codec

Use the \`-c:a\` (or \`-acodec\`) flag to specify the audio codec.`
      },
      {
        type: 'code',
        command: 'ffmpeg -i input.mp4 -c:a aac output.mp4',
        explanation: 'Convert audio track to AAC codec',
        flagBreakdown: [
          {
            flag: '-c:a aac',
            description: 'Set the audio codec to AAC'
          }
        ],
        tryItYourself: true
      },
      {
        type: 'code',
        command: 'ffmpeg -i input.mp4 -c:v copy -c:a mp3 output.mp4',
        explanation: 'Copy video stream and convert audio to MP3',
        flagBreakdown: [
          {
            flag: '-c:v copy',
            description: 'Copy video stream without re-encoding (faster)'
          },
          {
            flag: '-c:a mp3',
            description: 'Convert audio to MP3 codec'
          }
        ]
      },
      {
        type: 'challenge',
        title: 'Extract Audio',
        description: 'Extract audio from a video file and save it as an MP3 file',
        requirements: [
          'Use -i for input',
          'Use -c:a mp3 for audio codec',
          'Output should be .mp3 file'
        ],
        hints: [
          'You can use -vn to disable video',
          'Or just specify an audio output format'
        ],
        solution: 'ffmpeg -i input.mp4 -c:a mp3 output.mp3',
        validation: {
          type: 'contains',
          value: '-c:a mp3'
        }
      },
      {
        type: 'quiz',
        question: 'What flag is used to specify the audio codec?',
        options: [
          { id: 'a', text: '-c:a or -acodec', correct: true },
          { id: 'b', text: '-audio', correct: false },
          { id: 'c', text: '-a', correct: false },
          { id: 'd', text: '-codec:a', correct: false }
        ],
        explanation: 'The -c:a (or -acodec) flag is used to specify the audio codec in FFMPEG commands.'
      }
    ]
  },
  {
    id: 'quality-control',
    title: 'Quality Control',
    module: 'Video Processing',
    duration: 30,
    unlockAfter: 'audio-codecs',
    content: [
      {
        type: 'text',
        title: 'Controlling Video Quality',
        content: `FFMPEG offers several ways to control the quality and file size of your output:

## CRF (Constant Rate Factor)

CRF is a quality-based encoding mode. Lower values mean higher quality but larger files.
- Range: 0-51 (for H.264)
- Recommended: 18-28
- 23 is default and considered visually lossless

## Bitrate

Bitrate controls the amount of data per second. Higher bitrate = better quality but larger files.
- Use \`-b:v\` for video bitrate
- Use \`-b:a\` for audio bitrate

## Two-Pass Encoding

For precise file size control, use two-pass encoding to analyze the video first, then encode.`
      },
      {
        type: 'code',
        command: 'ffmpeg -i input.mp4 -c:v libx264 -crf 23 output.mp4',
        explanation: 'Encode with CRF 23 (default quality)',
        flagBreakdown: [
          {
            flag: '-crf 23',
            description: 'Set Constant Rate Factor to 23 (default, visually lossless quality)'
          }
        ],
        tryItYourself: true
      },
      {
        type: 'code',
        command: 'ffmpeg -i input.mp4 -c:v libx264 -b:v 2M output.mp4',
        explanation: 'Encode with specific bitrate (2 Mbps)',
        flagBreakdown: [
          {
            flag: '-b:v 2M',
            description: 'Set video bitrate to 2 megabits per second'
          }
        ]
      },
      {
        type: 'challenge',
        title: 'High Quality Encoding',
        description: 'Create a command to encode with CRF 18 (high quality)',
        requirements: [
          'Use -c:v libx264',
          'Set CRF to 18'
        ],
        hints: [
          'CRF flag is -crf',
          'Lower CRF = higher quality'
        ],
        solution: 'ffmpeg -i input.mp4 -c:v libx264 -crf 18 output.mp4',
        validation: {
          type: 'contains',
          value: '-crf 18'
        }
      },
      {
        type: 'quiz',
        question: 'What does a lower CRF value mean?',
        options: [
          { id: 'a', text: 'Lower quality, smaller file', correct: false },
          { id: 'b', text: 'Higher quality, larger file', correct: true },
          { id: 'c', text: 'Same quality, faster encoding', correct: false },
          { id: 'd', text: 'Lower quality, larger file', correct: false }
        ],
        explanation: 'Lower CRF values result in higher quality output but produce larger file sizes.'
      }
    ]
  },
  {
    id: 'filtering-basics',
    title: 'Filtering Basics',
    module: 'Video Processing',
    duration: 25,
    unlockAfter: 'quality-control',
    content: [
      {
        type: 'text',
        title: 'Video Filters',
        content: `FFMPEG filters allow you to modify video and audio streams. Filters are applied using the \`-vf\` (video filter) or \`-af\` (audio filter) flags.

## Common Video Filters

- **scale**: Resize video
- **crop**: Crop video to specific dimensions
- **rotate**: Rotate video
- **fade**: Add fade in/out effects
- **overlay**: Overlay one video on another

## Filter Syntax

Filters can be chained using commas. Each filter can have parameters.`
      },
      {
        type: 'code',
        command: 'ffmpeg -i input.mp4 -vf scale=1280:720 output.mp4',
        explanation: 'Resize video to 1280x720 resolution',
        flagBreakdown: [
          {
            flag: '-vf scale=1280:720',
            description: 'Apply video filter: scale to width 1280, height 720'
          }
        ],
        tryItYourself: true
      },
      {
        type: 'code',
        command: 'ffmpeg -i input.mp4 -vf "scale=1920:1080,crop=1280:720" output.mp4',
        explanation: 'Scale then crop video',
        flagBreakdown: [
          {
            flag: '-vf "scale=1920:1080,crop=1280:720"',
            description: 'Chain filters: first scale to 1920x1080, then crop to 1280x720'
          }
        ]
      },
      {
        type: 'challenge',
        title: 'Resize Video',
        description: 'Create a command to resize input.mp4 to 1920x1080 (Full HD)',
        requirements: [
          'Use -vf flag',
          'Use scale filter',
          'Set dimensions to 1920x1080'
        ],
        hints: [
          'Filter syntax: scale=width:height',
          'Remember to use -vf before the filter'
        ],
        solution: 'ffmpeg -i input.mp4 -vf scale=1920:1080 output.mp4',
        validation: {
          type: 'contains',
          value: 'scale=1920:1080'
        }
      },
      {
        type: 'quiz',
        question: 'What flag is used to apply video filters?',
        options: [
          { id: 'a', text: '-filter', correct: false },
          { id: 'b', text: '-vf or -filter:v', correct: true },
          { id: 'c', text: '-video-filter', correct: false },
          { id: 'd', text: '-f', correct: false }
        ],
        explanation: 'The -vf (or -filter:v) flag is used to apply video filters in FFMPEG commands.'
      }
    ]
  }
];

// Helper function to get lesson by ID
export function getLessonById(id: string): Lesson | undefined {
  return lessons.find(lesson => lesson.id === id);
}

// Helper function to get all lessons in a module
export function getLessonsByModule(module: string): Lesson[] {
  return lessons.filter(lesson => lesson.module === module);
}

// Helper function to get all modules
export function getModules(): string[] {
  return Array.from(new Set(lessons.map(lesson => lesson.module)));
}
