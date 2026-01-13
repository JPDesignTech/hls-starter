import { Lesson } from '@/lib/tutorial/types';

export const durationAndBitrateAnalysis: Lesson = {
  id: 'duration-and-bitrate-analysis',
  title: 'Duration and Bitrate Analysis',
  module: 'FFProbe - Media Analysis',
  duration: 15,
  unlockAfter: 'codec-detection',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Extracting specific metadata fields like duration and bitrate is essential for automation and scripting. FFprobe allows you to extract individual fields in various output formats.'
    },
    {
      type: 'code',
      command: 'ffprobe -show_entries format=duration -v quiet input.mp4',
      explanation: 'Extract duration only. The -v quiet flag suppresses all output except the requested field, making it perfect for scripting.',
      flagBreakdown: [
        {
          flag: '-show_entries format=duration',
          description: 'Show only the duration field from format information'
        },
        {
          flag: '-v quiet',
          description: 'Suppress all output except requested fields'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffprobe -show_entries format=bit_rate -v quiet input.mp4',
      explanation: 'Extract bitrate only. Returns bitrate in bits per second.',
      flagBreakdown: [
        {
          flag: '-show_entries format=bit_rate',
          description: 'Show only the bit_rate field'
        },
        {
          flag: '-v quiet',
          description: 'Quiet mode for clean output'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffprobe -show_entries format=duration,bit_rate -v quiet input.mp4',
      explanation: 'Extract multiple fields. Combine multiple fields separated by commas.',
      flagBreakdown: [
        {
          flag: '-show_entries format=duration,bit_rate',
          description: 'Show both duration and bitrate fields'
        },
        {
          flag: '-v quiet',
          description: 'Quiet mode'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Field Extraction',
      content: 'Tips for extracting specific fields:',
      bullets: [
        'Use -v quiet for clean, scriptable output',
        'Combine multiple fields with commas',
        'Duration is in seconds (may include decimals)',
        'Bitrate is in bits per second',
        'Perfect for automation and scripting'
      ]
    },
    {
      type: 'quiz',
      question: 'What does -v quiet do?',
      options: [
        { id: 'a', text: 'Shows more verbose output', correct: false },
        { id: 'b', text: 'Suppresses all output except requested fields', correct: true },
        { id: 'c', text: 'Hides errors', correct: false },
        { id: 'd', text: 'Speeds up processing', correct: false }
      ],
      explanation: '-v quiet suppresses all output except the specifically requested fields, making the output clean and suitable for scripting and automation.'
    }
  ]
};
