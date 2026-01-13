import { type Lesson } from '@/lib/tutorial/types';

export const introductionToFFplay: Lesson = {
  id: 'introduction-to-ffplay',
  title: 'Introduction to FFPlay',
  module: 'FFPlay - Video Playback',
  duration: 15,
  unlockAfter: 'command-structure-flags',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'FFplay is FFmpeg\'s lightweight media player for quick playback and debugging. It\'s designed for developers and media workflows—not a full UI player. FFplay uses FFmpeg decoders, so it can play a wide variety of formats.'
    },
    {
      type: 'code',
      command: 'ffplay input.mp4',
      explanation: 'Basic FFplay usage. This opens a playback window and starts playing the media file immediately.',
      flagBreakdown: [
        {
          flag: 'input.mp4',
          description: 'Input media file to play'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'bullets',
      heading: 'Why FFplay Matters',
      content: 'FFplay is useful for:',
      bullets: [
        'Fast preview of files without opening a full editor',
        'Great for testing encoding results',
        'Useful for validating streams (RTMP/RTSP/HLS)',
        'Debugging A/V sync issues',
        'Automated or terminal workflows'
      ]
    },
    {
      type: 'bullets',
      heading: 'Key Features',
      content: 'What makes FFplay special:',
      bullets: [
        'Uses FFmpeg decoders, so it can play many formats',
        'Lightweight and fast to launch',
        'Command-line driven, perfect for automation',
        'Supports keyboard shortcuts for playback control',
        'Can play local files, network streams, and live feeds'
      ]
    },
    {
      type: 'quiz',
      question: 'What is FFplay primarily designed for?',
      options: [
        { id: 'a', text: 'Full-featured media editing', correct: false },
        { id: 'b', text: 'Quick playback and debugging for developers', correct: true },
        { id: 'c', text: 'Professional video production', correct: false },
        { id: 'd', text: 'Streaming to large audiences', correct: false }
      ],
      explanation: 'FFplay is a lightweight media player designed for developers and media workflows, providing quick playback and debugging capabilities rather than full editing features.'
    }
  ]
};
