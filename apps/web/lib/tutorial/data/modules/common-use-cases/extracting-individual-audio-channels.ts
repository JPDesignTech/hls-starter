import { type Lesson } from '@/lib/tutorial/types';

export const extractingIndividualAudioChannels: Lesson = {
  id: 'extracting-individual-audio-channels',
  title: 'Extracting Individual Audio Channels',
  module: 'Common Use Cases',
  duration: 20,
  unlockAfter: 'timecode-burn-in',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Splitting stereo or multi-channel audio into separate files is essential for interviews, call recordings, and audio editing workflows. This allows you to isolate individual speakers or channels for processing.'
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.wav -map_channel 0.0.0 left.wav',
      explanation: 'Extract left channel from stereo audio. The format is input_file.stream.channel.',
      flagBreakdown: [
        {
          flag: '-map_channel 0.0.0',
          description: 'Map channel 0 (left) from first input, first stream to output'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.wav -map_channel 0.0.1 right.wav',
      explanation: 'Extract right channel from stereo audio. Channel 1 is the right channel.',
      flagBreakdown: [
        {
          flag: '-map_channel 0.0.1',
          description: 'Map channel 1 (right) from first input, first stream to output'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.wav -map_channel 0.0.0 left.wav -map_channel 0.0.1 right.wav',
      explanation: 'Extract both channels simultaneously. Create separate files for left and right in one command.',
      flagBreakdown: [
        {
          flag: '-map_channel 0.0.0',
          description: 'Extract left channel to left.wav'
        },
        {
          flag: '-map_channel 0.0.1',
          description: 'Extract right channel to right.wav'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Channel Mapping Format',
      content: 'Understanding -map_channel syntax:',
      bullets: [
        'Format: input_file.stream.channel',
        '0.0.0 = first input, first stream, channel 0 (left)',
        '0.0.1 = first input, first stream, channel 1 (right)',
        'Works with surround formats (5.1, 7.1) as well',
        'Useful for isolating individual speakers or channels'
      ]
    },
    {
      type: 'bullets',
      heading: 'Use Cases',
      content: 'When to extract individual channels:',
      bullets: [
        'Interviews: Separate interviewer and interviewee',
        'Call recordings: Isolate each participant',
        'Audio editing: Process channels independently',
        'Surround sound: Extract center, LFE, or surround channels',
        'Quality control: Check individual channel levels'
      ]
    },
    {
      type: 'challenge',
      title: 'Extract Audio Channels',
      description: 'Extract the left channel from a stereo audio file',
      requirements: [
        'Use -i for input file',
        'Use -map_channel with correct channel index',
        'Output should be left channel only'
      ],
      hints: [
        'Left channel is index 0',
        'Format is 0.0.0 (input.stream.channel)',
        'Right channel would be 0.0.1'
      ],
      solution: 'ffmpeg -i input.wav -map_channel 0.0.0 left.wav',
      validation: {
        type: 'contains',
        value: '-map_channel 0.0.0'
      }
    },
    {
      type: 'quiz',
      question: 'What does -map_channel 0.0.1 extract?',
      options: [
        { id: 'a', text: 'Left channel', correct: false },
        { id: 'b', text: 'Right channel', correct: true },
        { id: 'c', text: 'Center channel', correct: false },
        { id: 'd', text: 'All channels', correct: false }
      ],
      explanation: '-map_channel 0.0.1 extracts channel 1, which is the right channel in a stereo audio file. Channel 0 is left, channel 1 is right.'
    }
  ]
};
