import { type Lesson } from '@/lib/tutorial/types';

export const loopingPlayback: Lesson = {
  id: 'looping-playback',
  title: 'Looping Playback',
  module: 'FFPlay - Video Playback',
  duration: 15,
  unlockAfter: 'starting-playback-from-specific-time',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Looping a file continuously or a set number of times is perfect for verifying color grading, overlays, or A/V sync in a repeated segment. This allows you to watch the same content multiple times without manually restarting.'
    },
    {
      type: 'code',
      command: 'ffplay -loop 0 input.mp4',
      explanation: 'Loop forever. The value 0 means infinite loops - the video will restart automatically when it ends.',
      flagBreakdown: [
        {
          flag: '-loop 0',
          description: 'Loop infinitely (0 = infinite loops)'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffplay -loop 3 input.mp4',
      explanation: 'Loop 3 times. After the video plays 3 times, playback will stop.',
      flagBreakdown: [
        {
          flag: '-loop 3',
          description: 'Loop 3 times, then stop'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffplay -ss 00:01:00 -t 10 -loop 0 input.mp4',
      explanation: 'Loop a 10-second segment starting at 1 minute. Combine -ss, -t, and -loop to repeatedly test a specific section.',
      flagBreakdown: [
        {
          flag: '-ss 00:01:00',
          description: 'Start at 1 minute'
        },
        {
          flag: '-t 10',
          description: 'Play for 10 seconds'
        },
        {
          flag: '-loop 0',
          description: 'Loop infinitely'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Looping Use Cases',
      content: 'When to use looping:',
      bullets: [
        'Verifying color grading in a repeated segment',
        'Testing overlays or effects',
        'Checking A/V sync repeatedly',
        'Quality control for specific sections',
        'Demonstrating content in presentations'
      ]
    },
    {
      type: 'challenge',
      title: 'Loop a Segment',
      description: 'Create a command that loops a 5-second segment starting at 30 seconds, 5 times',
      requirements: [
        'Use -ss to start at 30 seconds',
        'Use -t to play for 5 seconds',
        'Use -loop to loop 5 times'
      ],
      hints: [
        'Start time: -ss 30',
        'Duration: -t 5',
        'Loop count: -loop 5'
      ],
      solution: 'ffplay -ss 30 -t 5 -loop 5 input.mp4',
      validation: {
        type: 'contains',
        value: '-loop 5'
      }
    },
    {
      type: 'quiz',
      question: 'What does -loop 0 do?',
      options: [
        { id: 'a', text: 'Plays once and stops', correct: false },
        { id: 'b', text: 'Loops forever', correct: true },
        { id: 'c', text: 'Plays at 0x speed', correct: false },
        { id: 'd', text: 'Disables looping', correct: false }
      ],
      explanation: 'The -loop flag with value 0 means infinite loops. The video will restart automatically when it ends, continuing indefinitely until you stop playback.'
    }
  ]
};
