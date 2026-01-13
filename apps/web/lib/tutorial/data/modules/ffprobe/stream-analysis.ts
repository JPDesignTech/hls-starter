import { type Lesson } from '@/lib/tutorial/types';

export const streamAnalysis: Lesson = {
  id: 'stream-analysis',
  title: 'Stream Analysis',
  module: 'FFProbe - Media Analysis',
  duration: 20,
  unlockAfter: 'extracting-format-information',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Inspecting individual audio and video streams provides detailed information about each stream\'s codec, properties, and characteristics. Each stream has an index, and this information is essential when using -map in FFmpeg.'
    },
    {
      type: 'code',
      command: 'ffprobe -show_streams input.mp4',
      explanation: 'Display detailed information for all streams. This shows codec, resolution, bitrate, frame rate, and other properties for each stream.',
      flagBreakdown: [
        {
          flag: '-show_streams',
          description: 'Display detailed information for all streams'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'bullets',
      heading: 'Stream Information',
      content: 'Stream analysis provides:',
      bullets: [
        'Stream index: Position of stream in file (0, 1, 2, etc.)',
        'Codec: Codec name and type (video/audio)',
        'Resolution: Width and height for video streams',
        'Frame rate: Frames per second for video',
        'Sample rate: Samples per second for audio',
        'Channels: Number of audio channels',
        'Bitrate: Stream bitrate'
      ]
    },
    {
      type: 'code',
      command: 'ffprobe -show_streams -hide_banner input.mp4',
      explanation: 'Clean stream analysis output. Combine with -hide_banner for easier reading.',
      flagBreakdown: [
        {
          flag: '-show_streams',
          description: 'Show all stream information'
        },
        {
          flag: '-hide_banner',
          description: 'Hide version banner'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Stream Indexes',
      content: 'Understanding stream indexes:',
      bullets: [
        'Each stream has an index starting from 0',
        'Video streams are typically index 0',
        'Audio streams follow video streams',
        'Stream indexes are used with -map in FFmpeg',
        'Essential for selecting specific streams during processing'
      ]
    },
    {
      type: 'quiz',
      question: 'Why is stream analysis important when using FFmpeg?',
      options: [
        { id: 'a', text: 'It modifies the streams', correct: false },
        { id: 'b', text: 'It helps identify stream indexes for use with -map', correct: true },
        { id: 'c', text: 'It improves video quality', correct: false },
        { id: 'd', text: 'It reduces file size', correct: false }
      ],
      explanation: 'Stream analysis shows the index and properties of each stream, which is essential when using -map in FFmpeg to select specific streams for processing.'
    }
  ]
};
