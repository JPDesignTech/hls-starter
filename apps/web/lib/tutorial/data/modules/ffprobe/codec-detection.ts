import { type Lesson } from '@/lib/tutorial/types';

export const codecDetection: Lesson = {
  id: 'codec-detection',
  title: 'Codec Detection',
  module: 'FFProbe - Media Analysis',
  duration: 15,
  unlockAfter: 'frame-by-frame-analysis',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Detecting codecs used in a file is essential for compatibility checks and automating transcoding pipelines. FFprobe can extract specific codec information using stream selection and entry filtering.'
    },
    {
      type: 'code',
      command: 'ffprobe -select_streams v -show_entries stream=codec_name input.mp4',
      explanation: 'Detect video codec name. This extracts only the codec name for the video stream, providing clean output.',
      flagBreakdown: [
        {
          flag: '-select_streams v',
          description: 'Select video streams only'
        },
        {
          flag: '-show_entries stream=codec_name',
          description: 'Show only the codec_name field from stream information'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffprobe -select_streams a -show_entries stream=codec_name input.mp4',
      explanation: 'Detect audio codec name. Select audio streams and show codec name.',
      flagBreakdown: [
        {
          flag: '-select_streams a',
          description: 'Select audio streams only'
        },
        {
          flag: '-show_entries stream=codec_name',
          description: 'Show codec name for audio stream'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffprobe -select_streams v:0 -show_entries stream=codec_name,codec_long_name input.mp4',
      explanation: 'Get both short and long codec names. Useful for detailed codec identification.',
      flagBreakdown: [
        {
          flag: '-select_streams v:0',
          description: 'Select first video stream'
        },
        {
          flag: '-show_entries stream=codec_name,codec_long_name',
          description: 'Show both short and long codec names'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Use Cases',
      content: 'Codec detection is useful for:',
      bullets: [
        'Compatibility checks: Verify if codec is supported',
        'Automation: Scripts that need to know codec before processing',
        'Transcoding pipelines: Determine if conversion is needed',
        'Quality control: Verify expected codecs are used',
        'Debugging: Identify codec-related issues'
      ]
    },
    {
      type: 'quiz',
      question: 'What does -select_streams v do?',
      options: [
        { id: 'a', text: 'Selects audio streams', correct: false },
        { id: 'b', text: 'Selects video streams', correct: true },
        { id: 'c', text: 'Selects all streams', correct: false },
        { id: 'd', text: 'Selects subtitle streams', correct: false }
      ],
      explanation: '-select_streams v selects video streams, while -select_streams a selects audio streams. This allows you to analyze specific stream types.'
    }
  ]
};
