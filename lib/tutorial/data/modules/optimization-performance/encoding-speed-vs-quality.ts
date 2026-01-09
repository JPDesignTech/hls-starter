import { Lesson } from '@/lib/tutorial/types';

export const encodingSpeedVsQuality: Lesson = {
  id: 'encoding-speed-vs-quality',
  title: 'Encoding Speed vs Quality',
  module: 'Optimization & Performance',
  duration: 25,
  unlockAfter: 'file-size-optimization',
  content: [
    {
      type: 'introduction',
      heading: 'What This Lesson Covers',
      content: 'How to balance encoding speed and output quality. Understanding presets and their impact on encoding time versus compression efficiency.'
    },
    {
      type: 'bullets',
      heading: 'Why It Matters',
      content: 'Speed vs quality tuning enables:',
      bullets: [
        'Optimizing encoding time for your workflow',
        'Choosing the right balance for your use case',
        'Understanding trade-offs between speed and quality',
        'Maximizing efficiency based on time constraints',
        'Achieving best quality when time allows'
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -c:v libx265 -preset medium -crf 28 output.mp4',
      explanation: 'Balanced preset with HEVC codec. Medium preset provides good balance between encoding speed and compression efficiency.',
      flagBreakdown: [
        {
          flag: '-c:v libx265',
          description: 'Use HEVC (H.265) codec for better compression'
        },
        {
          flag: '-preset medium',
          description: 'Balanced encoding speed and compression (default)'
        },
        {
          flag: '-crf 28',
          description: 'Quality setting (lower = better quality)'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -c:v libx264 -preset ultrafast -crf 23 output.mp4',
      explanation: 'Ultrafast preset: fastest encoding but largest files. Good for quick previews or when speed is critical.',
      flagBreakdown: [
        {
          flag: '-preset ultrafast',
          description: 'Fastest encoding, largest files, lowest compression'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -c:v libx264 -preset veryslow -crf 23 output.mp4',
      explanation: 'Veryslow preset: slowest encoding but smallest files at same quality. Best compression efficiency, use when time allows.',
      flagBreakdown: [
        {
          flag: '-preset veryslow',
          description: 'Slowest encoding, smallest files, highest compression'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -c:v libx264 -preset slow -crf 23 output.mp4',
      explanation: 'Slow preset: good compression with reasonable encoding time. Recommended for final encodes when quality matters.',
      flagBreakdown: [
        {
          flag: '-preset slow',
          description: 'Good compression, reasonable speed, recommended for quality'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Preset Options',
      content: 'Encoding presets (speed vs compression):',
      bullets: [
        'ultrafast: Fastest encoding, largest files, lowest compression',
        'superfast: Very fast, larger files',
        'veryfast: Fast encoding, larger files',
        'faster: Fast encoding, larger files',
        'fast: Fast encoding, larger files',
        'medium: Balanced (default), good compromise',
        'slow: Good compression, reasonable speed (recommended)',
        'slower: Better compression, slower encoding',
        'veryslow: Best compression, slowest encoding, smallest files'
      ]
    },
    {
      type: 'bullets',
      heading: 'Speed vs Quality Trade-offs',
      content: 'Understanding the balance:',
      bullets: [
        'Faster presets: Quick encoding but larger files at same quality',
        'Slower presets: Better compression (smaller files) but longer encoding',
        'Presets affect encoding time, not quality (CRF controls quality)',
        'Use faster presets for previews and testing',
        'Use slower presets for final encodes when quality matters',
        'Medium to slow presets offer best balance for most use cases'
      ]
    },
    {
      type: 'preview',
      heading: 'Try It: Speed vs Quality',
      content: 'Compare encoding speed and file size with different presets',
      code: 'ffmpeg -i sample.mp4 -c:v libx264 -preset slow -crf 23 output.mp4',
      explanation: 'This uses the slow preset for better compression. Slower presets produce smaller files at the same quality but take longer to encode. Compare encoding time and file size with faster presets.',
      previewType: 'filter',
      sampleVideoId: 'sample-optimization-086'
    },
    {
      type: 'challenge',
      title: 'Use Veryslow Preset',
      description: 'Create a command that uses veryslow preset for maximum compression',
      requirements: [
        'Use libx264 codec',
        'Set preset to veryslow',
        'Use CRF 23 for quality'
      ],
      hints: [
        '-preset veryslow provides best compression',
        'CRF 23 maintains high quality',
        'This will take longer but produce smaller files'
      ],
      solution: 'ffmpeg -i input.mp4 -c:v libx264 -preset veryslow -crf 23 output.mp4',
      validation: {
        type: 'contains',
        value: '-preset veryslow'
      }
    },
    {
      type: 'quiz',
      question: 'What is the main trade-off between faster and slower encoding presets?',
      options: [
        { id: 'a', text: 'Faster presets produce better quality', correct: false },
        { id: 'b', text: 'Slower presets produce smaller files at same quality', correct: true },
        { id: 'c', text: 'Faster presets produce smaller files', correct: false },
        { id: 'd', text: 'Slower presets are always better', correct: false }
      ],
      explanation: 'Slower presets use more advanced compression algorithms that take longer to encode but produce smaller files at the same quality level. Faster presets prioritize speed over compression efficiency, resulting in larger files.'
    }
  ]
};
