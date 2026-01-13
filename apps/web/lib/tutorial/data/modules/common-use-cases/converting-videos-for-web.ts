import { Lesson } from '@/lib/tutorial/types';

export const convertingVideosForWeb: Lesson = {
  id: 'converting-videos-for-web',
  title: 'Converting Videos for Web',
  module: 'Common Use Cases',
  duration: 20,
  unlockAfter: 'creating-gifs-from-video',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Creating web-friendly video formats ensures fast loading and smooth playback across different browsers and devices. Web-optimized videos use specific codecs and container settings for maximum compatibility.'
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -movflags +faststart -c:v libx264 -crf 23 output.mp4',
      explanation: 'Web-optimized MP4. The +faststart flag enables progressive download (video can start playing before fully downloaded).',
      flagBreakdown: [
        {
          flag: '-movflags +faststart',
          description: 'Move metadata to beginning of file (enables progressive download)'
        },
        {
          flag: '-c:v libx264',
          description: 'Use H.264 video codec (widely supported)'
        },
        {
          flag: '-crf 23',
          description: 'Constant Rate Factor 23 (good quality)'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -movflags +faststart -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k output.mp4',
      explanation: 'Complete web optimization. Includes video codec, audio codec, and bitrate settings for web delivery.',
      flagBreakdown: [
        {
          flag: '-movflags +faststart',
          description: 'Enable progressive download'
        },
        {
          flag: '-preset medium',
          description: 'Encoding speed vs compression trade-off'
        },
        {
          flag: '-c:a aac',
          description: 'Use AAC audio codec (widely supported)'
        },
        {
          flag: '-b:a 128k',
          description: 'Set audio bitrate to 128 kbps'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Web Video Requirements',
      content: 'Key considerations for web video:',
      bullets: [
        '+faststart enables progressive download (video starts before fully loaded)',
        'H.264 + AAC is the most widely supported combination',
        'Lower bitrates = faster loading but lower quality',
        'Consider multiple quality levels for adaptive streaming',
        'Test across different browsers and devices'
      ]
    },
    {
      type: 'bullets',
      heading: 'Use Cases',
      content: 'When to optimize for web:',
      bullets: [
        'Website embedding: Videos on web pages',
        'Video hosting: Preparing content for platforms',
        'Streaming: Web-based video delivery',
        'Mobile: Optimizing for mobile data usage',
        'CDN delivery: Content delivery networks'
      ]
    },
    {
      type: 'challenge',
      title: 'Create Web-Optimized Video',
      description: 'Convert a video for web with faststart enabled and H.264 codec',
      requirements: [
        'Use -movflags +faststart',
        'Use -c:v libx264',
        'Set CRF to 23',
        'Output should be MP4'
      ],
      hints: [
        '+faststart moves metadata to beginning',
        'libx264 is the H.264 encoder',
        'CRF 23 provides good quality'
      ],
      solution: 'ffmpeg -i input.mp4 -movflags +faststart -c:v libx264 -crf 23 output.mp4',
      validation: {
        type: 'contains',
        value: '+faststart'
      }
    },
    {
      type: 'quiz',
      question: 'What does +faststart do in web video optimization?',
      options: [
        { id: 'a', text: 'Speeds up encoding', correct: false },
        { id: 'b', text: 'Enables progressive download (video can start before fully loaded)', correct: true },
        { id: 'c', text: 'Reduces file size', correct: false },
        { id: 'd', text: 'Improves video quality', correct: false }
      ],
      explanation: 'The +faststart flag moves metadata to the beginning of the file, enabling progressive download. This allows the video to start playing before it\'s fully downloaded, improving user experience on web pages.'
    }
  ]
};
