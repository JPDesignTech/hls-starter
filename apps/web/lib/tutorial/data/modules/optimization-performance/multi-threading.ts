import { type Lesson } from '@/lib/tutorial/types';

export const multiThreading: Lesson = {
  id: 'multi-threading',
  title: 'Multi-Threading',
  module: 'Optimization & Performance',
  duration: 20,
  unlockAfter: 'hardware-acceleration',
  content: [
    {
      type: 'introduction',
      heading: 'What This Lesson Covers',
      content: 'Using multiple CPU cores to speed up encoding/decoding. FFmpeg supports multi-threaded processing — distributing work across cores improves performance on modern systems.'
    },
    {
      type: 'bullets',
      heading: 'Why It Matters',
      content: 'Multi-threading enables:',
      bullets: [
        'Utilizing all available CPU cores',
        'Faster encoding on multi-core systems',
        'Better CPU resource utilization',
        'Improved performance for parallel tasks',
        'Efficient batch processing'
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -c:v libx264 -threads 0 output.mp4',
      explanation: 'Let FFmpeg automatically choose optimal thread count. -threads 0 uses all available CPU cores for best performance.',
      flagBreakdown: [
        {
          flag: '-threads 0',
          description: 'Auto-detect optimal thread count (uses all available cores)'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -c:v libx264 -threads 4 output.mp4',
      explanation: 'Explicitly set thread count to 4. Useful when you want to limit CPU usage or reserve cores for other tasks.',
      flagBreakdown: [
        {
          flag: '-threads 4',
          description: 'Use exactly 4 threads for encoding'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -c:v libx264 -threads 8 -preset medium output.mp4',
      explanation: 'Combine multi-threading with preset. Threads control parallelization, preset controls encoding speed/quality trade-off.',
      flagBreakdown: [
        {
          flag: '-threads 8',
          description: 'Use 8 threads (good for 8+ core CPUs)'
        },
        {
          flag: '-preset medium',
          description: 'Balanced encoding preset'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -threads 0 -i input.mp4 -c:v libx264 -threads 0 output.mp4',
      explanation: 'Set threads for both decoding and encoding. First -threads applies to input decoding, second applies to encoding.',
      flagBreakdown: [
        {
          flag: '-threads 0 (before -i)',
          description: 'Multi-threaded input decoding'
        },
        {
          flag: '-threads 0 (after -c:v)',
          description: 'Multi-threaded encoding'
        }
      ]
    },
    {
      type: 'diagram',
      title: 'Multi-Threading Architecture',
      diagram: `graph TB
    Input[Input Video] --> Split[Split Work]
    Split --> Thread1[Thread 1<br/>Core 1]
    Split --> Thread2[Thread 2<br/>Core 2]
    Split --> Thread3[Thread 3<br/>Core 3]
    Split --> Thread4[Thread 4<br/>Core 4]
    Thread1 --> Combine[Combine Results]
    Thread2 --> Combine
    Thread3 --> Combine
    Thread4 --> Combine
    Combine --> Output[Output Video]`,
      explanation: 'Multi-threading architecture: Input video work is split across multiple CPU cores/threads, each processing frames in parallel. Results are then combined to create the final output, significantly speeding up encoding on multi-core systems.',
      diagramType: 'mermaid',
      diagramFormat: 'graph'
    },
    {
      type: 'bullets',
      heading: 'Thread Control Guidelines',
      content: 'Understanding thread settings:',
      bullets: [
        '-threads 0: Auto-detect optimal count (recommended)',
        '-threads N: Use exactly N threads',
        'Too many threads can hurt performance (context switching overhead)',
        'Optimal thread count often equals CPU core count',
        'Multi-threading applies to both encoding and decoding',
        'Some codecs have better multi-threading support than others'
      ]
    },
    {
      type: 'bullets',
      heading: 'Performance Tips',
      content: 'Best practices:',
      bullets: [
        'Use -threads 0 for automatic optimization',
        'Monitor CPU usage to verify multi-threading is working',
        'For batch processing, consider thread count per job',
        'Combine with hardware acceleration for maximum performance',
        'Too many threads can cause performance degradation',
        'Test different thread counts to find optimal for your system'
      ]
    },
    {
      type: 'preview',
      heading: 'Try It: Multi-Threading',
      content: 'See how multi-threading utilizes all CPU cores for faster encoding',
      code: 'ffmpeg -i sample.mp4 -c:v libx264 -threads 0 -preset medium output.mp4',
      explanation: 'This uses automatic thread detection to utilize all available CPU cores. Multi-threading can significantly speed up encoding on multi-core systems.',
      previewType: 'filter',
      sampleVideoId: 'sample-optimization-084'
    },
    {
      type: 'challenge',
      title: 'Configure Multi-Threading',
      description: 'Create a command that uses 6 threads for encoding',
      requirements: [
        'Use libx264 codec',
        'Set threads to 6',
        'Use medium preset'
      ],
      hints: [
        '-threads 6 sets thread count',
        'Place after -c:v libx264',
        'Combine with -preset medium'
      ],
      solution: 'ffmpeg -i input.mp4 -c:v libx264 -threads 6 -preset medium output.mp4',
      validation: {
        type: 'contains',
        value: '-threads 6'
      }
    },
    {
      type: 'quiz',
      question: 'What does -threads 0 do in FFmpeg?',
      options: [
        { id: 'a', text: 'Disables multi-threading', correct: false },
        { id: 'b', text: 'Auto-detects optimal thread count', correct: true },
        { id: 'c', text: 'Uses only one thread', correct: false },
        { id: 'd', text: 'Uses maximum possible threads', correct: false }
      ],
      explanation: '-threads 0 tells FFmpeg to automatically detect and use the optimal number of threads based on your CPU cores. This is usually the best choice as it maximizes performance without manual tuning.'
    }
  ]
};
