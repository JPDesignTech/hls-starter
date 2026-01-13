import { type Lesson } from '@/lib/tutorial/types';

export const basicVideoPlayback: Lesson = {
  id: 'basic-video-playback',
  title: 'Basic Video Playback',
  module: 'FFPlay - Video Playback',
  duration: 15,
  unlockAfter: 'introduction-to-ffplay',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Playing local media files is the most basic use of FFplay. You can play video files, audio files, or control which streams are displayed.'
    },
    {
      type: 'code',
      command: 'ffplay video.mp4',
      explanation: 'Play a local video file. FFplay will open a window and start playback immediately.',
      flagBreakdown: [
        {
          flag: 'video.mp4',
          description: 'Local video file to play'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffplay -an video.mp4',
      explanation: 'Play video without audio. The -an flag disables audio output, useful for testing video-only playback.',
      flagBreakdown: [
        {
          flag: '-an',
          description: 'Disable audio output (audio no)'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffplay -vn audio.mp3',
      explanation: 'Play audio file without video display. The -vn flag disables video output, showing only audio playback controls.',
      flagBreakdown: [
        {
          flag: '-vn',
          description: 'Disable video display (video no)'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Stream Control Flags',
      content: 'Understanding stream control:',
      bullets: [
        '-an disables audio output (video-only playback)',
        '-vn disables video display (audio-only playback)',
        'Useful for testing individual streams',
        'Helpful when debugging A/V sync issues',
        'Can combine with other flags for advanced control'
      ]
    },
    {
      type: 'quiz',
      question: 'What does the -an flag do in FFplay?',
      options: [
        { id: 'a', text: 'Enables audio', correct: false },
        { id: 'b', text: 'Disables audio output', correct: true },
        { id: 'c', text: 'Normalizes audio', correct: false },
        { id: 'd', text: 'Adjusts audio volume', correct: false }
      ],
      explanation: 'The -an flag disables audio output, allowing you to play video without sound. This is useful for testing video-only playback.'
    }
  ]
};
