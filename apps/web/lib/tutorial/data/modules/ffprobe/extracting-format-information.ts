import { type Lesson } from '@/lib/tutorial/types';

export const extractingFormatInformation: Lesson = {
  id: 'extracting-format-information',
  title: 'Extracting Format Information',
  module: 'FFProbe - Media Analysis',
  duration: 15,
  unlockAfter: 'basic-metadata-extraction',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Container-level metadata provides information about the file format itself, not individual streams. This includes format name, duration, bitrate, and file size.'
    },
    {
      type: 'code',
      command: 'ffprobe -show_format input.mp4',
      explanation: 'Display format-level information. This shows container metadata including format name, duration, bitrate, and file size.',
      flagBreakdown: [
        {
          flag: '-show_format',
          description: 'Display format (container) level information'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'bullets',
      heading: 'Useful Format Fields',
      content: 'Key format information includes:',
      bullets: [
        'format_name: Container format (mp4, avi, mkv, etc.)',
        'duration: Total duration in seconds',
        'bit_rate: Overall bitrate in bits per second',
        'size: File size in bytes',
        'nb_streams: Number of streams in the file'
      ]
    },
    {
      type: 'code',
      command: 'ffprobe -show_format -hide_banner input.mp4',
      explanation: 'Combine flags for cleaner output. -hide_banner removes version info, -show_format shows container metadata.',
      flagBreakdown: [
        {
          flag: '-show_format',
          description: 'Show format information'
        },
        {
          flag: '-hide_banner',
          description: 'Hide version banner'
        }
      ]
    },
    {
      type: 'quiz',
      question: 'What does -show_format display?',
      options: [
        { id: 'a', text: 'Individual frame information', correct: false },
        { id: 'b', text: 'Container-level metadata (format name, duration, bitrate)', correct: true },
        { id: 'c', text: 'Only video stream information', correct: false },
        { id: 'd', text: 'Only audio stream information', correct: false }
      ],
      explanation: '-show_format displays container-level metadata including format name, duration, bitrate, and file size, not individual stream or frame information.'
    }
  ]
};
