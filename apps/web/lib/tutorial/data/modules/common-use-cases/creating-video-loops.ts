import { type Lesson } from '@/lib/tutorial/types';

export const creatingVideoLoops: Lesson = {
  id: 'creating-video-loops',
  title: 'Creating Video Loops',
  module: 'Common Use Cases',
  duration: 15,
  unlockAfter: 'extracting-individual-audio-channels',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Looping a video for a set duration creates a seamless repeating video file. This is different from FFPlay playback looping - here we create a new video file that loops automatically when played.'
    },
    {
      type: 'code',
      command: 'ffmpeg -stream_loop 4 -i input.mp4 -c copy output.mp4',
      explanation: 'Loop video 5 times total (original + 4 loops). The -stream_loop flag must come before -i.',
      flagBreakdown: [
        {
          flag: '-stream_loop 4',
          description: 'Loop the input 4 times (total: original + 4 loops = 5 plays)'
        },
        {
          flag: '-c copy',
          description: 'Copy streams without re-encoding (faster, preserves quality)'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -stream_loop -1 -i input.mp4 output.mp4',
      explanation: 'Create infinite loop (until stopped). The value -1 means loop indefinitely.',
      flagBreakdown: [
        {
          flag: '-stream_loop -1',
          description: 'Loop infinitely (until manually stopped)'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -stream_loop 2 -i input.mp4 -c:v libx264 -c:a aac output.mp4',
      explanation: 'Loop with re-encoding. Useful when you need to ensure seamless looping or add effects.',
      flagBreakdown: [
        {
          flag: '-stream_loop 2',
          description: 'Loop 2 times (total: 3 plays)'
        },
        {
          flag: '-c:v libx264 -c:a aac',
          description: 'Re-encode video and audio (ensures seamless looping)'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Looping Notes',
      content: 'Important points about video looping:',
      bullets: [
        '-stream_loop must come before -i',
        'Copying streams (-c copy) avoids re-encoding and is faster',
        'Re-encoding ensures seamless looping at boundaries',
        'Useful for creating background videos, demos, and presentations',
        'Infinite loops (-1) create very large files'
      ]
    },
    {
      type: 'bullets',
      heading: 'Use Cases',
      content: 'When to create video loops:',
      bullets: [
        'Background videos: Seamless looping backgrounds',
        'Demos: Repeat demonstrations automatically',
        'Presentations: Continuous video loops',
        'Social media: Short looping videos',
        'Art installations: Continuous video art'
      ]
    },
    {
      type: 'challenge',
      title: 'Create Video Loop',
      description: 'Create a video that loops 3 times total (original + 2 loops)',
      requirements: [
        'Use -stream_loop flag',
        'Set to loop 2 times',
        'Use -c copy to avoid re-encoding'
      ],
      hints: [
        '-stream_loop 2 means loop 2 times (total 3 plays)',
        'Place -stream_loop before -i',
        'Use -c copy for faster processing'
      ],
      solution: 'ffmpeg -stream_loop 2 -i input.mp4 -c copy output.mp4',
      validation: {
        type: 'contains',
        value: '-stream_loop 2'
      }
    },
    {
      type: 'quiz',
      question: 'What does -stream_loop 4 do?',
      options: [
        { id: 'a', text: 'Loops the video 4 times total', correct: false },
        { id: 'b', text: 'Loops the video 4 additional times (5 total)', correct: true },
        { id: 'c', text: 'Loops at 4x speed', correct: false },
        { id: 'd', text: 'Creates 4 separate output files', correct: false }
      ],
      explanation: '-stream_loop 4 loops the input 4 additional times, resulting in 5 total plays (original + 4 loops). The number specifies additional loops, not total plays.'
    }
  ]
};
