import { Lesson } from '@/lib/tutorial/types';

export const twoPassEncoding: Lesson = {
  id: 'two-pass-encoding',
  title: 'Two-Pass Encoding',
  module: 'Optimization & Performance',
  duration: 30,
  unlockAfter: 'adding-watermarks',
  content: [
    {
      type: 'introduction',
      heading: 'What This Lesson Covers',
      content: 'Optimizing bitrate distribution by encoding video in two passes. Two-pass encoding analyzes the video first, then optimizes bitrate allocation — yielding higher quality at a target file size compared to single-pass encoding.'
    },
    {
      type: 'bullets',
      heading: 'Why It Matters',
      content: 'Two-pass encoding is ideal when:',
      bullets: [
        'Both quality and consistent file size matter',
        'Creating streaming assets with target bitrates',
        'You need optimal bitrate distribution across scenes',
        'File size predictability is important'
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -y -i input.mp4 -c:v libx264 -b:v 2500k -pass 1 -an -f null /dev/null',
      explanation: 'First pass: Analyzes video complexity and stores statistics. No audio (-an), outputs to null device. The -y flag overwrites existing files.',
      flagBreakdown: [
        {
          flag: '-c:v libx264',
          description: 'Use H.264 video codec'
        },
        {
          flag: '-b:v 2500k',
          description: 'Target video bitrate: 2500 kilobits per second'
        },
        {
          flag: '-pass 1',
          description: 'First pass: analysis only'
        },
        {
          flag: '-an',
          description: 'Disable audio processing in first pass'
        },
        {
          flag: '-f null /dev/null',
          description: 'Output to null device (discard output, keep stats)'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -c:v libx264 -b:v 2500k -pass 2 -c:a aac output.mp4',
      explanation: 'Second pass: Uses statistics from first pass to allocate bits efficiently. Includes audio encoding. Produces final optimized output.',
      flagBreakdown: [
        {
          flag: '-pass 2',
          description: 'Second pass: uses stats from pass 1 for optimal encoding'
        },
        {
          flag: '-c:a aac',
          description: 'Encode audio with AAC codec'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -y -i input.mp4 -c:v libx264 -b:v 2500k -pass 1 -an -f null /dev/null && ffmpeg -i input.mp4 -c:v libx264 -b:v 2500k -pass 2 -c:a aac output.mp4',
      explanation: 'Complete two-pass encoding in one command (bash). Uses && to chain both passes sequentially.',
      flagBreakdown: [
        {
          flag: '&&',
          description: 'Chain commands: run second only if first succeeds'
        }
      ]
    },
    {
      type: 'diagram',
      title: 'Two-Pass Encoding Process',
      diagram: `flowchart TD
    Start[Start] --> Pass1[Pass 1: Analysis]
    Pass1 --> Analyze[Analyze Frame Complexity]
    Analyze --> Stats[Store Statistics]
    Stats --> Pass2[Pass 2: Encoding]
    Pass2 --> Allocate[Allocate Bits Optimally]
    Allocate --> Encode[Encode Video]
    Encode --> Output[Output File]`,
      explanation: 'Two-pass encoding: First pass analyzes video complexity and stores statistics. Second pass uses these statistics to allocate bits optimally, giving complex scenes more bits and simple scenes fewer bits.',
      diagramType: 'mermaid',
      diagramFormat: 'flowchart'
    },
    {
      type: 'bullets',
      heading: 'How Two-Pass Works',
      content: 'The two-pass process:',
      bullets: [
        'Pass 1: Analyzes video complexity frame-by-frame',
        'Pass 1: Stores statistics about scene complexity',
        'Pass 2: Uses statistics to allocate bits optimally',
        'Pass 2: Complex scenes get more bits, simple scenes get fewer',
        'Result: Better quality at target file size than single-pass',
        'Encoding time roughly doubles due to two passes'
      ]
    },
    {
      type: 'bullets',
      heading: 'When to Use Two-Pass',
      content: 'Best scenarios:',
      bullets: [
        'Target file size is critical (streaming, storage limits)',
        'Video has varying complexity (action scenes, static shots)',
        'Quality per bitrate is more important than encoding speed',
        'Creating assets for CDN or streaming platforms',
        'Not ideal for real-time or live encoding'
      ]
    },
    {
      type: 'preview',
      heading: 'Try It: Two-Pass Encoding',
      content: 'See how two-pass encoding optimizes bitrate distribution for better quality at target file size',
      code: 'ffmpeg -i sample.mp4 -c:v libx264 -b:v 2000k -pass 1 -an -f null /dev/null && ffmpeg -i sample.mp4 -c:v libx264 -b:v 2000k -pass 2 -c:a copy output.mp4',
      explanation: 'This demonstrates two-pass encoding: first pass analyzes complexity, second pass uses that data for optimal bitrate allocation. Note: This may take longer but produces better quality.',
      previewType: 'filter',
      sampleVideoId: 'sample-optimization-082'
    },
    {
      type: 'challenge',
      title: 'Create Two-Pass Encoding',
      description: 'Create a two-pass encoding command with bitrate 3000k',
      requirements: [
        'Use libx264 codec',
        'Set bitrate to 3000k',
        'First pass: no audio, output to null',
        'Second pass: include audio encoding'
      ],
      hints: [
        'First pass uses -pass 1 and -an (no audio)',
        'Second pass uses -pass 2',
        'Both passes use same -b:v bitrate',
        'Use && to chain commands'
      ],
      solution: 'ffmpeg -y -i input.mp4 -c:v libx264 -b:v 3000k -pass 1 -an -f null /dev/null && ffmpeg -i input.mp4 -c:v libx264 -b:v 3000k -pass 2 -c:a aac output.mp4',
      validation: {
        type: 'contains',
        value: '-pass 1'
      }
    },
    {
      type: 'quiz',
      question: 'What is the main advantage of two-pass encoding over single-pass?',
      options: [
        { id: 'a', text: 'Faster encoding time', correct: false },
        { id: 'b', text: 'Higher quality at target file size', correct: true },
        { id: 'c', text: 'Smaller output files', correct: false },
        { id: 'd', text: 'Better audio quality', correct: false }
      ],
      explanation: 'Two-pass encoding analyzes video complexity first, then allocates bits optimally in the second pass. This results in higher quality at the target file size compared to single-pass encoding, which allocates bits uniformly.'
    }
  ]
};
