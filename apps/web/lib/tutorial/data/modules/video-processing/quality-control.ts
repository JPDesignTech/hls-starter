import { type Lesson } from '@/lib/tutorial/types';

export const qualityControl: Lesson = {
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
      type: 'diagram',
      title: 'CRF Encoding Process',
      diagram: `flowchart TD
    Input[Input Video] --> Analyze[Analyze Frame Complexity]
    Analyze --> CRF[Apply CRF Value]
    CRF --> Quality{Quality vs Size}
    Quality -->|Low CRF| HighQuality[High Quality<br/>Large File]
    Quality -->|High CRF| LowQuality[Lower Quality<br/>Small File]
    HighQuality --> Output[Output File]
    LowQuality --> Output`,
      explanation: 'CRF encoding analyzes frame complexity and adjusts quality automatically. Lower CRF values prioritize quality, higher values prioritize file size.',
      diagramType: 'mermaid',
      diagramFormat: 'flowchart'
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
};
