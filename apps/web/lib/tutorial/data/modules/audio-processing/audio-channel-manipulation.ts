import { Lesson } from '@/lib/tutorial/types';

export const audioChannelManipulation: Lesson = {
  id: 'audio-channel-manipulation',
  title: 'Audio Channel Manipulation',
  module: 'Audio Processing',
  duration: 20,
  unlockAfter: 'audio-bitrate-control',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Changing mono/stereo layouts and selecting specific channels is useful for voice recordings, podcast cleanup, and meeting broadcast standards. FFmpeg provides several methods to manipulate audio channels.'
    },
    {
      type: 'code',
      command: 'ffmpeg -i stereo.mp3 -ac 1 mono.mp3',
      explanation: 'Convert stereo audio to mono. The -ac flag controls the number of audio channels.',
      flagBreakdown: [
        {
          flag: '-ac 1',
          description: 'Set audio channels to 1 (mono)'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i mono.wav -ac 2 stereo.wav',
      explanation: 'Convert mono audio to stereo. FFmpeg duplicates the mono channel to both left and right channels.',
      flagBreakdown: [
        {
          flag: '-ac 2',
          description: 'Set audio channels to 2 (stereo)'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.wav -map_channel 0.0.0 left.wav',
      explanation: 'Extract the left channel from a stereo file. The format is input_file.stream.channel.',
      flagBreakdown: [
        {
          flag: '-map_channel 0.0.0',
          description: 'Map channel 0 (left) from first input, first stream to output'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.wav -map_channel 0.0.1 right.wav',
      explanation: 'Extract the right channel from a stereo file. Channel 1 is the right channel.',
      flagBreakdown: [
        {
          flag: '-map_channel 0.0.1',
          description: 'Map channel 1 (right) from first input, first stream to output'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Channel Manipulation Use Cases',
      content: 'Common scenarios for channel manipulation:',
      bullets: [
        'Mono conversion: Useful for voice recordings and podcasts',
        'Stereo conversion: For compatibility with stereo playback systems',
        'Channel extraction: Isolating left/right channels for editing',
        'Accessibility: Converting to mono for hearing-impaired listeners',
        'Broadcast standards: Meeting specific channel requirements'
      ]
    },
    {
      type: 'challenge',
      title: 'Convert to Mono',
      description: 'Convert a stereo audio file to mono format',
      requirements: [
        'Use -i for input stereo file',
        'Use -ac 1 for mono output',
        'Output should be mono audio'
      ],
      hints: [
        'The -ac flag controls channel count',
        '1 channel = mono, 2 channels = stereo',
        'Mono is useful for voice recordings'
      ],
      solution: 'ffmpeg -i stereo.mp3 -ac 1 mono.mp3',
      validation: {
        type: 'contains',
        value: '-ac 1'
      }
    },
    {
      type: 'quiz',
      question: 'What does -ac 1 do?',
      options: [
        { id: 'a', text: 'Sets audio codec to 1', correct: false },
        { id: 'b', text: 'Sets audio channels to 1 (mono)', correct: true },
        { id: 'c', text: 'Sets audio bitrate to 1 kbps', correct: false },
        { id: 'd', text: 'Sets audio sample rate to 1 Hz', correct: false }
      ],
      explanation: 'The -ac flag controls the number of audio channels. -ac 1 sets the output to mono (1 channel).'
    }
  ]
};
