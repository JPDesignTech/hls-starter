import { type Lesson } from '@/lib/tutorial/types';

export const startingPlaybackFromSpecificTime: Lesson = {
  id: 'starting-playback-from-specific-time',
  title: 'Starting Playback from Specific Time',
  module: 'FFPlay - Video Playback',
  duration: 15,
  unlockAfter: 'window-size-control',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Seeking into media on start allows you to jump to a specific point in the video without watching from the beginning. This is great for testing small sections repeatedly, like transitions or specific scenes.'
    },
    {
      type: 'code',
      command: 'ffplay -ss 60 input.mp4',
      explanation: 'Start playback at 60 seconds. The -ss flag seeks to the specified time before starting playback.',
      flagBreakdown: [
        {
          flag: '-ss 60',
          description: 'Seek to 60 seconds from the start'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffplay -ss 00:01:30 input.mp4',
      explanation: 'Start playback at 1 minute and 30 seconds using timestamp format. More readable for longer videos.',
      flagBreakdown: [
        {
          flag: '-ss 00:01:30',
          description: 'Seek to 1 minute 30 seconds (HH:MM:SS format)'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffplay -ss 00:05:00 -t 30 input.mp4',
      explanation: 'Start at 5 minutes and play for 30 seconds. Combine -ss with -t to play a specific segment.',
      flagBreakdown: [
        {
          flag: '-ss 00:05:00',
          description: 'Start at 5 minutes'
        },
        {
          flag: '-t 30',
          description: 'Play for 30 seconds'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Seeking Notes',
      content: 'Important points about seeking:',
      bullets: [
        'Seeking speed varies depending on keyframes',
        'Great for testing small sections repeatedly',
        'Useful for verifying transitions or effects',
        'Timestamp format (HH:MM:SS) is more readable',
        'Can combine with -t to play specific segments'
      ]
    },
    {
      type: 'challenge',
      title: 'Start Playback at Specific Time',
      description: 'Start playing a video at 2 minutes and 15 seconds',
      requirements: [
        'Use ffplay command',
        'Use -ss flag with timestamp format',
        'Specify 2 minutes 15 seconds'
      ],
      hints: [
        'Timestamp format is HH:MM:SS',
        '2 minutes 15 seconds = 00:02:15',
        'Use -ss before the input file'
      ],
      solution: 'ffplay -ss 00:02:15 input.mp4',
      validation: {
        type: 'contains',
        value: '-ss 00:02:15'
      }
    },
    {
      type: 'quiz',
      question: 'What does -ss 60 do in FFplay?',
      options: [
        { id: 'a', text: 'Plays at 60x speed', correct: false },
        { id: 'b', text: 'Starts playback at 60 seconds', correct: true },
        { id: 'c', text: 'Plays for 60 seconds', correct: false },
        { id: 'd', text: 'Sets volume to 60%', correct: false }
      ],
      explanation: 'The -ss flag seeks to a specific time before starting playback. -ss 60 starts playback at 60 seconds from the beginning of the video.'
    }
  ]
};
