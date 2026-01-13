import { type Lesson } from '@/lib/tutorial/types';

export const performanceProfiling: Lesson = {
  id: 'performance-profiling',
  title: 'Performance Profiling',
  module: 'Advanced Techniques',
  duration: 25,
  unlockAfter: 'logging-and-debugging',
  content: [
    {
      type: 'introduction',
      heading: 'What This Lesson Covers',
      content: 'Measuring and understanding performance — how long encoding/filters take. For large batches or real-time systems, understanding slow areas is essential.'
    },
    {
      type: 'bullets',
      heading: 'Why It Matters',
      content: 'Performance profiling enables:',
      bullets: [
        'Identifying bottlenecks in encoding',
        'Comparing hardware vs software encoding',
        'Estimating job durations',
        'Optimizing filter chains',
        'Planning batch processing workflows'
      ]
    },
    {
      type: 'code',
      command: 'time ffmpeg -i input.mp4 -vf "complex filters..." output.mp4',
      explanation: 'Time command wrapper: Reports real time, user CPU time, and system CPU time. Useful for comparing encoding methods.',
      flagBreakdown: [
        {
          flag: 'time',
          description: 'Unix command: measures execution time of following command'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "scale=1280:720" -c:v libx264 -preset ultrafast output.mp4',
      explanation: 'Fast preset for quick testing. Use ultrafast preset to test filter chains quickly before using slower, higher-quality presets.',
      flagBreakdown: [
        {
          flag: '-preset ultrafast',
          description: 'Fastest encoding preset (for testing)'
        }
      ]
    },
    {
      type: 'code',
      command: '#!/bin/bash\nSTART=$(date +%s)\nffmpeg -i input.mp4 output.mp4\nEND=$(date +%s)\nDIFF=$((END - START))\necho "Encoding took $DIFF seconds"',
      explanation: 'Bash timing script: Capture start/end timestamps, calculate difference. More control than time command.',
      flagBreakdown: [
        {
          flag: '$(date +%s)',
          description: 'Get current Unix timestamp (seconds since epoch)'
        },
        {
          flag: '$((END - START))',
          description: 'Calculate time difference in seconds'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "scale=1280:720" -c:v libx264 -progress progress.txt output.mp4',
      explanation: 'Progress output: FFmpeg writes progress information to file. Shows frame count, bitrate, speed, and time.',
      flagBreakdown: [
        {
          flag: '-progress progress.txt',
          description: 'Write progress information to file'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Profiling Techniques',
      content: 'Methods for measuring performance:',
      bullets: [
        'time command: Quick timing wrapper',
        'Date timestamps: More control in scripts',
        'Progress file: Real-time encoding metrics',
        'Log analysis: Extract timing from verbose logs',
        'CPU/GPU monitoring: System-level performance',
        'Compare presets: Test speed vs quality trade-offs'
      ]
    },
    {
      type: 'bullets',
      heading: 'Performance Metrics',
      content: 'Key metrics to monitor:',
      bullets: [
        'Real time: Wall-clock time (total duration)',
        'CPU time: Processor time used',
        'Encoding speed: Frames per second (fps)',
        'Bitrate: Actual bitrate achieved',
        'Memory usage: Peak memory consumption',
        'GPU utilization: For hardware acceleration'
      ]
    },
    {
      type: 'preview',
      heading: 'Try It: Performance Profiling',
      content: 'See how performance profiling helps identify bottlenecks',
      code: 'ffmpeg -i sample.mp4 -vf "scale=1280:720" -c:v libx264 -preset medium output.mp4',
      explanation: 'This command can be timed to measure performance. Profiling helps identify slow operations and optimize encoding workflows.',
      previewType: 'filter',
      sampleVideoId: 'sample-advanced-098'
    },
    {
      type: 'challenge',
      title: 'Measure Encoding Time',
      description: 'Create a script that measures and reports encoding time',
      requirements: [
        'Capture start time',
        'Run FFmpeg command',
        'Capture end time',
        'Calculate and display duration'
      ],
      hints: [
        'Use date +%s for timestamps',
        'Calculate difference: $((END - START))',
        'Display result with echo',
        'Format as seconds or minutes'
      ],
      solution: '#!/bin/bash\nSTART=$(date +%s)\nffmpeg -i input.mp4 output.mp4\nEND=$(date +%s)\nDIFF=$((END - START))\necho "Encoding took $DIFF seconds"',
      validation: {
        type: 'contains',
        value: 'date +%s'
      }
    },
    {
      type: 'quiz',
      question: 'What does the "time" command measure?',
      options: [
        { id: 'a', text: 'Only CPU time', correct: false },
        { id: 'b', text: 'Real time, user CPU time, and system CPU time', correct: true },
        { id: 'c', text: 'Only real time', correct: false },
        { id: 'd', text: 'Memory usage', correct: false }
      ],
      explanation: 'The "time" command measures three things: real time (wall-clock time), user CPU time (time spent in user mode), and system CPU time (time spent in kernel mode). This gives a complete picture of how long a command takes and how much CPU resources it uses.'
    }
  ]
};
