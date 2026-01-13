import { Lesson } from '@/lib/tutorial/types';

export const loggingAndDebugging: Lesson = {
  id: 'logging-and-debugging',
  title: 'Logging and Debugging',
  module: 'Advanced Techniques',
  duration: 25,
  unlockAfter: 'error-handling',
  content: [
    {
      type: 'introduction',
      heading: 'What This Lesson Covers',
      content: 'Understanding FFmpeg\'s logs and using them to troubleshoot problems. You\'ll often get silent failures or unexpected results without proper logging.'
    },
    {
      type: 'bullets',
      heading: 'Why It Matters',
      content: 'Logging and debugging enable:',
      bullets: [
        'Diagnosing filter graph errors',
        'Identifying codec negotiation issues',
        'Finding performance bottlenecks',
        'Understanding unexpected behavior',
        'Troubleshooting production issues'
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -loglevel verbose -i input.mp4 output.mp4',
      explanation: 'Increase verbosity to verbose level. Shows detailed information about encoding process, codec selection, and filter operations.',
      flagBreakdown: [
        {
          flag: '-loglevel verbose',
          description: 'Set log level to verbose (detailed output)'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -loglevel debug -i input.mp4 output.mp4',
      explanation: 'Maximum verbosity: debug level shows extremely detailed information including frame-by-frame processing. Use for deep troubleshooting.',
      flagBreakdown: [
        {
          flag: '-loglevel debug',
          description: 'Set log level to debug (maximum detail)'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -loglevel error -i input.mp4 output.mp4 2>error.log',
      explanation: 'Log only errors to file. Useful for production where you only care about failures. Redirect stderr to log file.',
      flagBreakdown: [
        {
          flag: '-loglevel error',
          description: 'Only show error messages'
        },
        {
          flag: '2>error.log',
          description: 'Redirect stderr (errors) to error.log file'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -loglevel info -i input.mp4 -vf "complex filters..." output.mp4 2>&1 | tee full.log',
      explanation: 'Log everything to file while also displaying. 2>&1 redirects stderr to stdout, tee saves to file and displays.',
      flagBreakdown: [
        {
          flag: '-loglevel info',
          description: 'Info level: shows informational messages'
        },
        {
          flag: '2>&1 | tee full.log',
          description: 'Redirect stderr to stdout, save to file and display'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Log Levels',
      content: 'Available log levels (least to most verbose):',
      bullets: [
        'quiet: No output (except errors)',
        'panic: Only panic messages',
        'fatal: Only fatal errors',
        'error: Only errors',
        'warning: Warnings and errors',
        'info: Informational messages (default)',
        'verbose: Detailed information',
        'debug: Extremely detailed (frame-by-frame)',
        'trace: Maximum verbosity'
      ]
    },
    {
      type: 'bullets',
      heading: 'Debugging Tips',
      content: 'Effective debugging strategies:',
      bullets: [
        'Start with verbose level for general issues',
        'Use debug level for filter graph problems',
        'Log to files for later analysis',
        'Look for codec negotiation messages',
        'Check filter chain validation errors',
        'Monitor performance metrics in logs',
        'Compare logs between working and failing commands'
      ]
    },
    {
      type: 'preview',
      heading: 'Try It: Logging and Debugging',
      content: 'See how different log levels provide different levels of detail',
      code: 'ffmpeg -loglevel verbose -i sample.mp4 -vf "scale=1280:720" output.mp4',
      explanation: 'This uses verbose logging to show detailed information about the encoding process. Logging is essential for troubleshooting and understanding FFmpeg behavior.',
      previewType: 'filter',
      sampleVideoId: 'sample-advanced-097'
    },
    {
      type: 'challenge',
      title: 'Create Debug Log',
      description: 'Create a command that logs debug output to a file',
      requirements: [
        'Use debug log level',
        'Save output to debug.log',
        'Process a video file'
      ],
      hints: [
        '-loglevel debug sets maximum verbosity',
        'Redirect stderr: 2>debug.log',
        'Or use 2>&1 | tee for display and file'
      ],
      solution: 'ffmpeg -loglevel debug -i input.mp4 output.mp4 2>debug.log',
      validation: {
        type: 'contains',
        value: '-loglevel debug'
      }
    },
    {
      type: 'quiz',
      question: 'What log level provides the most detailed output for troubleshooting?',
      options: [
        { id: 'a', text: 'verbose', correct: false },
        { id: 'b', text: 'debug', correct: true },
        { id: 'c', text: 'info', correct: false },
        { id: 'd', text: 'error', correct: false }
      ],
      explanation: 'The debug log level provides the most detailed output, including frame-by-frame processing information. This is extremely useful for troubleshooting filter graph errors, codec issues, and performance problems, though it generates a lot of output.'
    }
  ]
};
