import { type Lesson } from '@/lib/tutorial/types';

export const jsonOutputFormatting: Lesson = {
  id: 'json-output-formatting',
  title: 'JSON Output Formatting',
  module: 'FFProbe - Media Analysis',
  duration: 15,
  unlockAfter: 'video-stream-analysis',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Machine-readable FFprobe output is essential for automation, APIs, and validation pipelines. JSON format provides structured, parseable output that can be easily processed by scripts and applications.'
    },
    {
      type: 'code',
      command: 'ffprobe -print_format json -show_streams -show_format input.mp4',
      explanation: 'Output in JSON format. This provides structured, machine-readable output with all stream and format information.',
      flagBreakdown: [
        {
          flag: '-print_format json',
          description: 'Output format as JSON'
        },
        {
          flag: '-show_streams',
          description: 'Include stream information'
        },
        {
          flag: '-show_format',
          description: 'Include format information'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'bullets',
      heading: 'Why JSON?',
      content: 'JSON output is useful for:',
      bullets: [
        'Automation: Easy to parse in scripts and programs',
        'APIs: Structured data for web services',
        'Validation pipelines: Programmatic media validation',
        'Data processing: Extract and process metadata programmatically',
        'Integration: Works with modern development tools and languages'
      ]
    },
    {
      type: 'code',
      command: 'ffprobe -print_format json -show_streams -show_format -hide_banner input.mp4',
      explanation: 'Clean JSON output. Combine with -hide_banner for pure JSON without version information.',
      flagBreakdown: [
        {
          flag: '-print_format json',
          description: 'JSON output format'
        },
        {
          flag: '-hide_banner',
          description: 'Hide version banner'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'JSON Structure',
      content: 'JSON output contains:',
      bullets: [
        'format: Container-level metadata',
        'streams: Array of stream objects',
        'Each stream: Codec, properties, and technical details',
        'Nested structure: Easy to navigate programmatically',
        'Type-safe: Can be parsed into objects in most languages'
      ]
    },
    {
      type: 'quiz',
      question: 'What is the main advantage of JSON output format?',
      options: [
        { id: 'a', text: 'It\'s more readable for humans', correct: false },
        { id: 'b', text: 'It\'s machine-readable and easy to parse programmatically', correct: true },
        { id: 'c', text: 'It\'s smaller in size', correct: false },
        { id: 'd', text: 'It shows more information', correct: false }
      ],
      explanation: 'JSON output provides structured, machine-readable data that can be easily parsed by scripts, APIs, and applications, making it ideal for automation and integration.'
    }
  ]
};
