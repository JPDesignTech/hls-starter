import { Lesson } from '@/lib/tutorial/types';

export const videoCodecs: Lesson = {
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
      type: 'diagram',
      title: 'Video Encoding Process',
      diagram: `flowchart LR
    RawVideo[Raw Video Frames] --> Encoder[Video Encoder<br/>libx264/libx265]
    Encoder --> Compress[Compress Frames]
    Compress --> Encode[Encode to Codec]
    Encode --> Container[Add to Container]`,
      explanation: 'Video encoding process: raw frames are compressed and encoded using a codec (like H.264 or H.265), then packaged into a container format.',
      diagramType: 'mermaid',
      diagramFormat: 'flowchart'
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
};
