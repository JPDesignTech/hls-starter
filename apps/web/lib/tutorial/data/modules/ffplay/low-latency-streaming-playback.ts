import { Lesson } from '@/lib/tutorial/types';

export const lowLatencyStreamingPlayback: Lesson = {
  id: 'low-latency-streaming-playback',
  title: 'Low Latency Streaming Playback',
  module: 'FFPlay - Video Playback',
  duration: 20,
  unlockAfter: 'subtitle-display',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Reducing buffering and latency is essential for live streams (RTSP/RTMP, etc.). FFplay provides flags to minimize delay, making it suitable for monitoring live feeds, though this may sacrifice perfect playback quality.'
    },
    {
      type: 'code',
      command: 'ffplay -fflags nobuffer -flags low_delay -framedrop -strict experimental rtsp://YOUR_STREAM',
      explanation: 'Low latency RTSP playback. These flags reduce buffering and delay for live streams.',
      flagBreakdown: [
        {
          flag: '-fflags nobuffer',
          description: 'Reduce internal buffering for lower latency'
        },
        {
          flag: '-flags low_delay',
          description: 'Enable low delay mode'
        },
        {
          flag: '-framedrop',
          description: 'Drop late frames to keep playback real-time'
        },
        {
          flag: '-strict experimental',
          description: 'Allow experimental codecs/features'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffplay -fflags nobuffer -framedrop rtmp://server/live/streamkey',
      explanation: 'Low latency RTMP playback. Essential flags for reducing delay in RTMP streams.',
      flagBreakdown: [
        {
          flag: '-fflags nobuffer',
          description: 'Minimize buffering'
        },
        {
          flag: '-framedrop',
          description: 'Drop frames that arrive too late'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Low Latency Flags',
      content: 'Understanding the flags:',
      bullets: [
        '-fflags nobuffer: Reduces internal buffering',
        '-framedrop: Helps keep playback real-time by dropping late frames',
        '-flags low_delay: Enables low delay mode',
        'Best for monitoring live feeds',
        'May sacrifice perfect playback quality for lower latency'
      ]
    },
    {
      type: 'bullets',
      heading: 'Use Cases',
      content: 'When to use low latency mode:',
      bullets: [
        'Monitoring live camera feeds',
        'Real-time stream validation',
        'Low-latency requirements',
        'Live event monitoring',
        'Security camera viewing'
      ]
    },
    {
      type: 'bullets',
      heading: 'Trade-offs',
      content: 'Important considerations:',
      bullets: [
        'Lower latency may cause frame drops',
        'Not ideal for perfect playback quality',
        'Best for monitoring, not production playback',
        'Network conditions affect latency',
        'May experience stuttering on unstable connections'
      ]
    },
    {
      type: 'challenge',
      title: 'Configure Low Latency Playback',
      description: 'Create a command for low latency RTSP stream playback',
      requirements: [
        'Use ffplay command',
        'Add -fflags nobuffer',
        'Add -framedrop flag',
        'Specify an RTSP URL'
      ],
      hints: [
        'Use -fflags nobuffer to reduce buffering',
        'Use -framedrop to drop late frames',
        'RTSP URLs start with rtsp://'
      ],
      solution: 'ffplay -fflags nobuffer -framedrop rtsp://server/stream',
      validation: {
        type: 'contains',
        value: '-fflags nobuffer'
      }
    },
    {
      type: 'quiz',
      question: 'What does -framedrop do in low latency streaming?',
      options: [
        { id: 'a', text: 'Increases frame rate', correct: false },
        { id: 'b', text: 'Drops late frames to keep playback real-time', correct: true },
        { id: 'c', text: 'Improves video quality', correct: false },
        { id: 'd', text: 'Reduces file size', correct: false }
      ],
      explanation: 'The -framedrop flag drops frames that arrive too late, helping to keep playback real-time and reduce latency. This is useful for live streams but may cause visible frame drops.'
    }
  ]
};
