import { type Lesson } from '@/lib/tutorial/types';

export const memoryUsageControl: Lesson = {
  id: 'memory-usage-control',
  title: 'Memory Usage Control',
  module: 'Optimization & Performance',
  duration: 20,
  unlockAfter: 'pre-processing-optimization',
  content: [
    {
      type: 'introduction',
      heading: 'What This Lesson Covers',
      content: 'Managing memory when processing large files or running many concurrent jobs. FFmpeg might use buffering and caching internally — controlling memory helps with stability in production or batch workflows.'
    },
    {
      type: 'bullets',
      heading: 'Why It Matters',
      content: 'Memory control enables:',
      bullets: [
        'Stable processing of large files',
        'Running multiple concurrent encoding jobs',
        'Preventing out-of-memory errors',
        'Efficient resource utilization',
        'Production-ready batch workflows'
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -c:v libx264 -movflags +faststart output.mp4',
      explanation: 'Faststart flag moves metadata to the beginning of the file. Enables streaming without full in-memory reordering, reducing memory usage.',
      flagBreakdown: [
        {
          flag: '-movflags +faststart',
          description: 'Move metadata to beginning (enables progressive download, reduces memory)'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -c:v libx264 -threads 2 -preset medium output.mp4',
      explanation: 'Limit threads to reduce memory usage. Fewer threads use less memory per process, allowing more concurrent jobs.',
      flagBreakdown: [
        {
          flag: '-threads 2',
          description: 'Limit to 2 threads (reduces memory per process)'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -c:v libx264 -bufsize 2M -maxrate 3M output.mp4',
      explanation: 'Control buffer size to limit memory usage. Smaller buffers use less memory but may affect quality in complex scenes.',
      flagBreakdown: [
        {
          flag: '-bufsize 2M',
          description: 'Set buffer size to 2MB (limits memory usage)'
        },
        {
          flag: '-maxrate 3M',
          description: 'Set maximum bitrate to 3M (works with bufsize)'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -c:v libx264 -movflags +faststart -threads 0 output.mp4',
      explanation: 'Combine faststart with auto thread detection. Faststart reduces memory, auto threads optimize CPU usage.',
      flagBreakdown: [
        {
          flag: '-movflags +faststart',
          description: 'Enable faststart for streaming (reduces memory)'
        },
        {
          flag: '-threads 0',
          description: 'Auto-detect optimal threads'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Memory Management Techniques',
      content: 'Key approaches:',
      bullets: [
        'Faststart flag: Moves metadata to beginning, enables streaming without full reordering',
        'Limit threads: Fewer threads = less memory per process',
        'Control buffers: Smaller buffers reduce memory usage',
        'Use streaming modes instead of loading entire files',
        'Segment processing: Process in chunks for very large files',
        'Monitor memory usage when filtering or batch processing'
      ]
    },
    {
      type: 'bullets',
      heading: 'Best Practices',
      content: 'Memory optimization tips:',
      bullets: [
        'Use +faststart for web delivery (reduces memory)',
        'Limit threads when running multiple concurrent jobs',
        'Process large files in segments if memory is constrained',
        'Monitor memory usage during batch processing',
        'Use appropriate buffer sizes for your use case',
        'Consider hardware acceleration to offload CPU/memory'
      ]
    },
    {
      type: 'preview',
      heading: 'Try It: Memory Usage Control',
      content: 'See how faststart and thread control optimize memory usage',
      code: 'ffmpeg -i sample.mp4 -c:v libx264 -movflags +faststart output.mp4',
      explanation: 'This uses the faststart flag to optimize file structure for streaming. Faststart moves metadata to the beginning, enabling progressive download without requiring the entire file to be loaded into memory.',
      previewType: 'filter',
      sampleVideoId: 'sample-optimization-088'
    },
    {
      type: 'challenge',
      title: 'Optimize Memory Usage',
      description: 'Create a command that uses faststart and limits threads to 4',
      requirements: [
        'Use libx264 codec',
        'Enable faststart flag',
        'Limit threads to 4',
        'Use medium preset'
      ],
      hints: [
        '-movflags +faststart enables faststart',
        '-threads 4 limits thread count',
        'Combine with -preset medium'
      ],
      solution: 'ffmpeg -i input.mp4 -c:v libx264 -movflags +faststart -threads 4 -preset medium output.mp4',
      validation: {
        type: 'contains',
        value: '+faststart'
      }
    },
    {
      type: 'quiz',
      question: 'What does the +faststart flag do for memory usage?',
      options: [
        { id: 'a', text: 'Increases memory usage', correct: false },
        { id: 'b', text: 'Enables streaming without full in-memory reordering', correct: true },
        { id: 'c', text: 'Disables memory caching', correct: false },
        { id: 'd', text: 'Limits buffer size', correct: false }
      ],
      explanation: 'The +faststart flag moves metadata to the beginning of the file, enabling progressive download and streaming without requiring the entire file to be loaded into memory for reordering. This reduces memory usage during encoding.'
    }
  ]
};
