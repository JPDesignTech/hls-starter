import { type Lesson } from '@/lib/tutorial/types';

export const optimizingVideoFileSizes: Lesson = {
  id: 'optimizing-video-file-sizes',
  title: 'Optimizing Video File Sizes',
  module: 'Common Use Cases',
  duration: 20,
  unlockAfter: 'converting-videos-for-web',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Reducing file size while keeping acceptable quality is essential for storage, bandwidth, and delivery. FFmpeg provides CRF (Constant Rate Factor) and preset options to balance quality and file size effectively.'
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -c:v libx264 -crf 28 output.mp4',
      explanation: 'Use CRF for size optimization. Lower CRF = higher quality but larger files. CRF 28 is a good balance.',
      flagBreakdown: [
        {
          flag: '-c:v libx264',
          description: 'Use H.264 video codec'
        },
        {
          flag: '-crf 28',
          description: 'Constant Rate Factor 28 (lower = better quality, range 0-51)'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -preset slow -crf 23 output.mp4',
      explanation: 'Use preset for encoding speed vs quality trade-off. Slower presets produce smaller files at same quality but take longer.',
      flagBreakdown: [
        {
          flag: '-preset slow',
          description: 'Slower encoding produces better compression (smaller files)'
        },
        {
          flag: '-crf 23',
          description: 'CRF 23 for high quality'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -c:v libx264 -preset veryslow -crf 28 output.mp4',
      explanation: 'Maximum compression. Very slow preset with CRF 28 produces smallest files but takes longest to encode.',
      flagBreakdown: [
        {
          flag: '-preset veryslow',
          description: 'Slowest preset for maximum compression'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'CRF Values',
      content: 'Understanding CRF (Constant Rate Factor):',
      bullets: [
        'Range: 0-51 (lower = better quality)',
        'CRF 18: Visually lossless (large files)',
        'CRF 23: High quality (default, good balance)',
        'CRF 28: Good quality (smaller files)',
        'CRF 32+: Lower quality (very small files)'
      ]
    },
    {
      type: 'bullets',
      heading: 'Preset Options',
      content: 'Encoding presets (speed vs compression):',
      bullets: [
        'ultrafast: Fastest encoding, largest files',
        'fast: Fast encoding, larger files',
        'medium: Balanced (default)',
        'slow: Slower encoding, smaller files',
        'veryslow: Slowest encoding, smallest files',
        'Presets affect encoding time, not quality (CRF controls quality)'
      ]
    },
    {
      type: 'bullets',
      heading: 'Optimization Tips',
      content: 'Best practices for file size optimization:',
      bullets: [
        'Use CRF for quality control (lower = better)',
        'Use slower presets for smaller files (if time allows)',
        'Test different CRF values to find acceptable quality',
        'Consider resolution reduction for further size savings',
        'Balance quality vs file size based on use case'
      ]
    },
    {
      type: 'challenge',
      title: 'Optimize Video Size',
      description: 'Optimize a video for smaller file size using CRF 28 and medium preset',
      requirements: [
        'Use -c:v libx264',
        'Set CRF to 28',
        'Use -preset medium',
        'Output should be optimized MP4'
      ],
      hints: [
        'CRF 28 provides good quality with smaller files',
        'Preset medium balances speed and compression',
        'Use both flags together'
      ],
      solution: 'ffmpeg -i input.mp4 -c:v libx264 -preset medium -crf 28 output.mp4',
      validation: {
        type: 'contains',
        value: '-crf 28'
      }
    },
    {
      type: 'quiz',
      question: 'What does a lower CRF value mean?',
      options: [
        { id: 'a', text: 'Lower quality, smaller files', correct: false },
        { id: 'b', text: 'Higher quality, larger files', correct: true },
        { id: 'c', text: 'Faster encoding', correct: false },
        { id: 'd', text: 'Lower resolution', correct: false }
      ],
      explanation: 'Lower CRF values mean higher quality but larger file sizes. CRF 18 is visually lossless (large files), while CRF 28 provides good quality with smaller files.'
    }
  ]
};
