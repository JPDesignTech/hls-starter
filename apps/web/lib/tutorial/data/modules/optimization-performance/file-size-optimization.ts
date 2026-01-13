import { Lesson } from '@/lib/tutorial/types';

export const fileSizeOptimization: Lesson = {
  id: 'file-size-optimization',
  title: 'File Size Optimization',
  module: 'Optimization & Performance',
  duration: 25,
  unlockAfter: 'multi-threading',
  content: [
    {
      type: 'introduction',
      heading: 'What This Lesson Covers',
      content: 'Balancing bitrate, compression, and quality to reduce file sizes efficiently. Essential for storage, bandwidth, and delivery optimization.'
    },
    {
      type: 'bullets',
      heading: 'Why It Matters',
      content: 'File size optimization enables:',
      bullets: [
        'Reduced storage costs',
        'Faster upload/download times',
        'Lower bandwidth usage',
        'Better streaming performance',
        'Cost-effective content delivery'
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset slow output.mp4',
      explanation: 'Use CRF (Constant Rate Factor) for quality-based size optimization. Lower CRF = higher quality & larger size. CRF 23 is high quality default. Slower preset improves compression.',
      flagBreakdown: [
        {
          flag: '-crf 23',
          description: 'Constant Rate Factor 23 (high quality, range 0-51, lower = better quality)'
        },
        {
          flag: '-preset slow',
          description: 'Slower encoding produces better compression (smaller files at same quality)'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -c:v libx264 -crf 28 -preset medium output.mp4',
      explanation: 'Balance quality and file size. CRF 28 provides good quality with smaller files. Medium preset balances speed and compression.',
      flagBreakdown: [
        {
          flag: '-crf 28',
          description: 'CRF 28: Good quality with smaller file size'
        },
        {
          flag: '-preset medium',
          description: 'Balanced encoding speed and compression'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -c:v libx264 -b:v 1500k -maxrate 2000k -bufsize 3000k output.mp4',
      explanation: 'Two-pass bitrate control for precise file size. Target bitrate 1500k with max rate 2000k and buffer 3000k for VBR control.',
      flagBreakdown: [
        {
          flag: '-b:v 1500k',
          description: 'Target average bitrate: 1500 kilobits per second'
        },
        {
          flag: '-maxrate 2000k',
          description: 'Maximum bitrate: 2000k (prevents spikes)'
        },
        {
          flag: '-bufsize 3000k',
          description: 'Buffer size: 3000k (controls rate variability)'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -c:v libx264 -crf 28 -preset slow -c:a copy output.mp4',
      explanation: 'Optimize video only, copy audio without re-encoding. Saves processing time and avoids audio quality loss.',
      flagBreakdown: [
        {
          flag: '-c:a copy',
          description: 'Copy audio stream without re-encoding (faster, no quality loss)'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Optimization Techniques',
      content: 'Key methods for file size reduction:',
      bullets: [
        'CRF: Maintain quality while adjusting final size (lower = better quality)',
        'Two-pass: Control bitrate to target size precisely',
        'Presets: Slower presets = better compression (smaller files)',
        'Avoid re-encoding audio if size is critical (use -c:a copy)',
        'Lower resolution reduces file size significantly',
        'Test different CRF values to find acceptable quality threshold'
      ]
    },
    {
      type: 'bullets',
      heading: 'CRF Value Guide',
      content: 'Understanding CRF values:',
      bullets: [
        'CRF 18: Visually lossless (very large files)',
        'CRF 23: High quality (default, good balance)',
        'CRF 28: Good quality (smaller files, recommended)',
        'CRF 32: Lower quality (very small files)',
        'CRF 51: Lowest quality (smallest files)',
        'Range: 0-51, lower = better quality'
      ]
    },
    {
      type: 'preview',
      heading: 'Try It: File Size Optimization',
      content: 'See how CRF and presets optimize file size while maintaining quality',
      code: 'ffmpeg -i sample.mp4 -c:v libx264 -crf 28 -preset slow output.mp4',
      explanation: 'This optimizes file size using CRF 28 (good quality) with slow preset (better compression). The result shows reduced file size while maintaining acceptable quality.',
      previewType: 'filter',
      sampleVideoId: 'sample-optimization-085'
    },
    {
      type: 'challenge',
      title: 'Optimize File Size',
      description: 'Create a command that optimizes file size using CRF 30 with medium preset',
      requirements: [
        'Use libx264 codec',
        'Set CRF to 30',
        'Use medium preset',
        'Copy audio without re-encoding'
      ],
      hints: [
        'CRF 30 provides smaller files with acceptable quality',
        '-preset medium balances speed and compression',
        'Use -c:a copy to avoid audio re-encoding'
      ],
      solution: 'ffmpeg -i input.mp4 -c:v libx264 -crf 30 -preset medium -c:a copy output.mp4',
      validation: {
        type: 'contains',
        value: '-crf 30'
      }
    },
    {
      type: 'quiz',
      question: 'What is the main advantage of using CRF over fixed bitrate for file size optimization?',
      options: [
        { id: 'a', text: 'Faster encoding', correct: false },
        { id: 'b', text: 'Maintains quality while adjusting file size', correct: true },
        { id: 'c', text: 'Smaller output files', correct: false },
        { id: 'd', text: 'Better audio quality', correct: false }
      ],
      explanation: 'CRF (Constant Rate Factor) maintains consistent quality across the video while allowing file size to vary. This means complex scenes get more bits and simple scenes get fewer bits, resulting in better quality per file size compared to fixed bitrate encoding.'
    }
  ]
};
