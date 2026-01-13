import { type Lesson } from '@/lib/tutorial/types';

export const basicMetadataExtraction: Lesson = {
  id: 'basic-metadata-extraction',
  title: 'Basic Metadata Extraction',
  module: 'FFProbe - Media Analysis',
  duration: 15,
  unlockAfter: 'introduction-to-ffprobe',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Viewing high-level file information is the most common use of FFprobe. The basic command provides an overview of the media file including duration, bitrate, stream count, and codec information.'
    },
    {
      type: 'code',
      command: 'ffprobe -hide_banner input.mp4',
      explanation: 'Display file information without the FFprobe banner. The -hide_banner flag removes version and build information for cleaner output.',
      flagBreakdown: [
        {
          flag: '-hide_banner',
          description: 'Hide FFprobe version and build information'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'bullets',
      heading: 'Output Information',
      content: 'Basic FFprobe output includes:',
      bullets: [
        'Duration: Total length of the media file',
        'Bitrate: Overall bitrate of the file',
        'Stream count: Number of audio and video streams',
        'Codec info: Codecs used for each stream',
        'Container format: File format (MP4, AVI, MKV, etc.)'
      ]
    },
    {
      type: 'code',
      command: 'ffprobe input.mp4',
      explanation: 'Default FFprobe output includes banner and detailed information. Useful for getting complete overview of the file.',
      flagBreakdown: [
        {
          flag: 'input.mp4',
          description: 'Input file to analyze'
        }
      ]
    },
    {
      type: 'quiz',
      question: 'What does -hide_banner do in FFprobe?',
      options: [
        { id: 'a', text: 'Hides all output', correct: false },
        { id: 'b', text: 'Removes version and build information for cleaner output', correct: true },
        { id: 'c', text: 'Hides file information', correct: false },
        { id: 'd', text: 'Shows more detailed information', correct: false }
      ],
      explanation: 'The -hide_banner flag removes the FFprobe version and build information banner, making the output cleaner and easier to read.'
    }
  ]
};
