import { type Lesson } from '@/lib/tutorial/types';

export const extractingVideoSegments: Lesson = {
  id: 'extracting-video-segments',
  title: 'Extracting Video Segments',
  module: 'Common Use Cases',
  duration: 20,
  unlockAfter: 'batch-processing-multiple-files',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Cutting clips from longer videos is essential for creating highlights, sharing specific moments, and editing workflows. FFmpeg offers two methods: fast copy mode (requires keyframe alignment) or re-encoding (frame-accurate but slower).'
    },
    {
      type: 'code',
      command: 'ffmpeg -ss 00:01:00 -to 00:01:30 -i input.mp4 -c copy clip.mp4',
      explanation: 'Extract segment without re-encoding (fast). Copy mode requires keyframe alignment, so cuts may not be frame-accurate.',
      flagBreakdown: [
        {
          flag: '-ss 00:01:00',
          description: 'Start time: 1 minute (place before -i for faster seeking)'
        },
        {
          flag: '-to 00:01:30',
          description: 'End time: 1 minute 30 seconds'
        },
        {
          flag: '-c copy',
          description: 'Copy streams without re-encoding (fast, preserves quality)'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -ss 60 -t 30 clip.mp4',
      explanation: 'Accurate cut with re-encoding. Frame-accurate but slower. Use -ss after -i for frame accuracy.',
      flagBreakdown: [
        {
          flag: '-ss 60',
          description: 'Start at 60 seconds (after -i for frame accuracy)'
        },
        {
          flag: '-t 30',
          description: 'Duration: 30 seconds'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -ss 00:02:00 -i input.mp4 -t 00:00:15 -c copy clip.mp4',
      explanation: 'Extract 15-second clip starting at 2 minutes using copy mode. Fast but may start slightly before/after exact time.',
      flagBreakdown: [
        {
          flag: '-ss 00:02:00',
          description: 'Start at 2 minutes'
        },
        {
          flag: '-t 00:00:15',
          description: 'Duration: 15 seconds'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Copy Mode vs Re-encoding',
      content: 'Understanding the trade-offs:',
      bullets: [
        'Copy mode (-c copy): Fast, preserves quality, requires keyframe alignment',
        'Re-encoding: Frame-accurate cuts, slower, may reduce quality',
        'Place -ss before -i for faster seeking in copy mode',
        'Place -ss after -i for frame-accurate cuts',
        'Use copy mode when speed is priority, re-encode when accuracy is critical'
      ]
    },
    {
      type: 'bullets',
      heading: 'Use Cases',
      content: 'When to extract segments:',
      bullets: [
        'Highlights: Extract best moments from longer videos',
        'Sharing: Create short clips for social media',
        'Editing: Prepare clips for further editing',
        'Archiving: Save specific sections separately',
        'Testing: Extract test segments for processing'
      ]
    },
    {
      type: 'challenge',
      title: 'Extract Video Segment',
      description: 'Extract a 20-second clip starting at 3 minutes using copy mode',
      requirements: [
        'Use -ss for start time',
        'Use -t for duration',
        'Use -c copy to avoid re-encoding',
        'Place -ss before -i'
      ],
      hints: [
        'Start time: -ss 00:03:00',
        'Duration: -t 20',
        'Use -c copy for fast processing',
        'Place -ss before -i'
      ],
      solution: 'ffmpeg -ss 00:03:00 -i input.mp4 -t 20 -c copy clip.mp4',
      validation: {
        type: 'contains',
        value: '-c copy'
      }
    },
    {
      type: 'quiz',
      question: 'What is the main difference between copy mode and re-encoding when extracting segments?',
      options: [
        { id: 'a', text: 'Copy mode is slower but more accurate', correct: false },
        { id: 'b', text: 'Copy mode is faster but requires keyframe alignment, re-encoding is frame-accurate', correct: true },
        { id: 'c', text: 'There is no difference', correct: false },
        { id: 'd', text: 'Copy mode always produces larger files', correct: false }
      ],
      explanation: 'Copy mode is faster and preserves quality but requires keyframe alignment (cuts may not be frame-accurate). Re-encoding is slower but provides frame-accurate cuts at any point in the video.'
    }
  ]
};
