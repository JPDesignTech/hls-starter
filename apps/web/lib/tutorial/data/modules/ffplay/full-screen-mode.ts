import { type Lesson } from '@/lib/tutorial/types';

export const fullScreenMode: Lesson = {
  id: 'full-screen-mode',
  title: 'Full Screen Mode',
  module: 'FFPlay - Video Playback',
  duration: 15,
  unlockAfter: 'interactive-controls-keyboard-shortcuts',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Entering fullscreen mode from launch or during playback is useful for viewing scaling artifacts, subtitles, or letterboxing without distractions. Fullscreen mode maximizes the video display area.'
    },
    {
      type: 'code',
      command: 'ffplay -fs input.mp4',
      explanation: 'Start playback in fullscreen mode. The -fs flag launches FFplay in fullscreen immediately.',
      flagBreakdown: [
        {
          flag: '-fs',
          description: 'Start in fullscreen mode'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'bullets',
      heading: 'Toggle During Playback',
      content: 'To toggle fullscreen during playback:',
      bullets: [
        'Press f key to toggle fullscreen on/off',
        'Works at any time during playback',
        'Useful for checking video quality without UI distractions',
        'Great for presentations or demos'
      ]
    },
    {
      type: 'bullets',
      heading: 'Fullscreen Use Cases',
      content: 'When to use fullscreen:',
      bullets: [
        'Viewing scaling artifacts clearly',
        'Checking subtitle rendering and positioning',
        'Examining letterboxing or pillarboxing',
        'Presentations or demos',
        'Quality control without UI distractions'
      ]
    },
    {
      type: 'code',
      command: 'ffplay -fs -x 1920 -y 1080 input.mp4',
      explanation: 'Start in fullscreen with specific window size. Note: -x and -y may be ignored in fullscreen mode depending on your system.',
      flagBreakdown: [
        {
          flag: '-fs',
          description: 'Start in fullscreen mode'
        },
        {
          flag: '-x 1920 -y 1080',
          description: 'Set window size (may be overridden in fullscreen)'
        }
      ]
    },
    {
      type: 'challenge',
      title: 'Start in Fullscreen',
      description: 'Create a command to start a video in fullscreen mode',
      requirements: [
        'Use ffplay command',
        'Add -fs flag for fullscreen',
        'Specify an input file'
      ],
      hints: [
        'The -fs flag enables fullscreen',
        'Place flags before the input file',
        'You can also toggle with f key during playback'
      ],
      solution: 'ffplay -fs input.mp4',
      validation: {
        type: 'contains',
        value: '-fs'
      }
    },
    {
      type: 'quiz',
      question: 'How do you toggle fullscreen mode during playback?',
      options: [
        { id: 'a', text: 'Press F11', correct: false },
        { id: 'b', text: 'Press f key', correct: true },
        { id: 'c', text: 'Press Ctrl+F', correct: false },
        { id: 'd', text: 'Right-click and select fullscreen', correct: false }
      ],
      explanation: 'Press the f key to toggle fullscreen mode on and off during playback. You can also start in fullscreen using the -fs flag.'
    }
  ]
};
