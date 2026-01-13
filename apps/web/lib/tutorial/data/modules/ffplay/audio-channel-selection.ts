import { type Lesson } from '@/lib/tutorial/types';

export const audioChannelSelection: Lesson = {
  id: 'audio-channel-selection',
  title: 'Audio Channel Selection',
  module: 'FFPlay - Video Playback',
  duration: 20,
  unlockAfter: 'full-screen-mode',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Selecting a specific audio stream is essential when a file contains multiple audio tracks (languages, commentary, etc.). FFplay allows you to choose which audio stream to play using stream indexes.'
    },
    {
      type: 'bullets',
      heading: 'Show Streams First (Recommended)',
      content: 'Before selecting an audio stream, identify available streams:',
      bullets: [
        'Use FFprobe to see all streams: ffprobe -show_streams input.mkv',
        'Audio streams are typically numbered starting from 0',
        'Each stream has an index (0, 1, 2, etc.)',
        'Streams may have language tags or descriptions'
      ]
    },
    {
      type: 'code',
      command: 'ffprobe -show_streams input.mkv',
      explanation: 'Display all streams in the file. Look for audio streams and their indexes to determine which one to select.',
      flagBreakdown: [
        {
          flag: '-show_streams',
          description: 'Show detailed information for all streams'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffplay -ast 1 input.mkv',
      explanation: 'Select audio stream by index. This plays audio stream 1 (second audio stream, index 1).',
      flagBreakdown: [
        {
          flag: '-ast 1',
          description: 'Select audio stream index 1 (second audio stream)'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffplay -ast 0 input.mkv',
      explanation: 'Select the first audio stream (index 0). This is the default if -ast is not specified.',
      flagBreakdown: [
        {
          flag: '-ast 0',
          description: 'Select audio stream index 0 (first audio stream)'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Audio Stream Selection Notes',
      content: 'Important points about audio selection:',
      bullets: [
        '-ast selects the audio stream by index (0, 1, 2...)',
        'Great for testing multilingual media',
        'Use FFprobe first to identify stream indexes',
        'Stream indexes start from 0',
        'You can also cycle through streams with the a key during playback'
      ]
    },
    {
      type: 'challenge',
      title: 'Select Audio Stream',
      description: 'Create a command to play a video file using the second audio stream (index 1)',
      requirements: [
        'Use ffplay command',
        'Use -ast flag to select audio stream',
        'Select stream index 1'
      ],
      hints: [
        'The -ast flag selects audio stream',
        'Stream index 1 is the second stream',
        'Indexes start from 0'
      ],
      solution: 'ffplay -ast 1 input.mkv',
      validation: {
        type: 'contains',
        value: '-ast 1'
      }
    },
    {
      type: 'quiz',
      question: 'What does -ast 1 do in FFplay?',
      options: [
        { id: 'a', text: 'Plays audio at 1x speed', correct: false },
        { id: 'b', text: 'Selects audio stream index 1 (second audio stream)', correct: true },
        { id: 'c', text: 'Sets audio volume to 1', correct: false },
        { id: 'd', text: 'Plays audio for 1 second', correct: false }
      ],
      explanation: 'The -ast flag selects an audio stream by its index. -ast 1 selects the second audio stream (index 1), which is useful for multilingual files or files with multiple audio tracks.'
    }
  ]
};
