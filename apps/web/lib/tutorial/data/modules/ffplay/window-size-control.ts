import { type Lesson } from '@/lib/tutorial/types';

export const windowSizeControl: Lesson = {
  id: 'window-size-control',
  title: 'Window Size Control',
  module: 'FFPlay - Video Playback',
  duration: 15,
  unlockAfter: 'basic-video-playback',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Controlling FFplay\'s playback window dimensions allows you to set a consistent window size for demos, screen recording, and tutorials. This sets the window size, not the video\'s encoded resolution.'
    },
    {
      type: 'code',
      command: 'ffplay -x 1280 -y 720 input.mp4',
      explanation: 'Set window size to 1280x720 pixels. The window will be this size regardless of the video\'s actual resolution.',
      flagBreakdown: [
        {
          flag: '-x 1280',
          description: 'Set window width to 1280 pixels'
        },
        {
          flag: '-y 720',
          description: 'Set window height to 720 pixels'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffplay -x 1920 -y 1080 input.mp4',
      explanation: 'Set window to full HD size (1920x1080). Useful for testing how content looks at specific resolutions.',
      flagBreakdown: [
        {
          flag: '-x 1920',
          description: 'Set window width to 1920 pixels (Full HD width)'
        },
        {
          flag: '-y 1080',
          description: 'Set window height to 1080 pixels (Full HD height)'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Window Size Notes',
      content: 'Important points about window sizing:',
      bullets: [
        'Window size is independent of video resolution',
        'Video will be scaled to fit the window',
        'Useful for demos and screen recording',
        'Helps maintain consistent UI in tutorials',
        'Can be combined with other playback flags'
      ]
    },
    {
      type: 'challenge',
      title: 'Set Window Size',
      description: 'Play a video file with a window size of 800x600 pixels',
      requirements: [
        'Use ffplay command',
        'Set window width to 800',
        'Set window height to 600',
        'Specify an input file'
      ],
      hints: [
        'Use -x flag for width',
        'Use -y flag for height',
        'Width and height are specified in pixels'
      ],
      solution: 'ffplay -x 800 -y 600 input.mp4',
      validation: {
        type: 'contains',
        value: '-x 800 -y 600'
      }
    },
    {
      type: 'quiz',
      question: 'What does -x 1280 -y 720 do?',
      options: [
        { id: 'a', text: 'Changes video resolution to 1280x720', correct: false },
        { id: 'b', text: 'Sets the playback window size to 1280x720', correct: true },
        { id: 'c', text: 'Crops the video to 1280x720', correct: false },
        { id: 'd', text: 'Scales the video file size', correct: false }
      ],
      explanation: 'The -x and -y flags set the playback window dimensions, not the video resolution. The video will be scaled to fit within this window size.'
    }
  ]
};
