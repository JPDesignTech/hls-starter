import { Lesson } from '@/lib/tutorial/types';

export const filteringBasics: Lesson = {
  id: 'filtering-basics',
  title: 'Filtering Basics',
  module: 'Video Processing',
  duration: 25,
  unlockAfter: 'quality-control',
  content: [
    {
      type: 'text',
      title: 'Video Filters',
      content: `FFMPEG filters allow you to modify video and audio streams. Filters are applied using the \`-vf\` (video filter) or \`-af\` (audio filter) flags.

## Common Video Filters

- **scale**: Resize video
- **crop**: Crop video to specific dimensions
- **rotate**: Rotate video
- **fade**: Add fade in/out effects
- **overlay**: Overlay one video on another

## Filter Syntax

Filters can be chained using commas. Each filter can have parameters.`
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf scale=1280:720 output.mp4',
      explanation: 'Resize video to 1280x720 resolution',
      flagBreakdown: [
        {
          flag: '-vf scale=1280:720',
          description: 'Apply video filter: scale to width 1280, height 720'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "scale=1920:1080,crop=1280:720" output.mp4',
      explanation: 'Scale then crop video',
      flagBreakdown: [
        {
          flag: '-vf "scale=1920:1080,crop=1280:720"',
          description: 'Chain filters: first scale to 1920x1080, then crop to 1280x720'
        }
      ]
    },
    {
      type: 'challenge',
      title: 'Resize Video',
      description: 'Create a command to resize input.mp4 to 1920x1080 (Full HD)',
      requirements: [
        'Use -vf flag',
        'Use scale filter',
        'Set dimensions to 1920x1080'
      ],
      hints: [
        'Filter syntax: scale=width:height',
        'Remember to use -vf before the filter'
      ],
      solution: 'ffmpeg -i input.mp4 -vf scale=1920:1080 output.mp4',
      validation: {
        type: 'contains',
        value: 'scale=1920:1080'
      }
    },
    {
      type: 'quiz',
      question: 'What flag is used to apply video filters?',
      options: [
        { id: 'a', text: '-filter', correct: false },
        { id: 'b', text: '-vf or -filter:v', correct: true },
        { id: 'c', text: '-video-filter', correct: false },
        { id: 'd', text: '-f', correct: false }
      ],
      explanation: 'The -vf (or -filter:v) flag is used to apply video filters in FFMPEG commands.'
    }
  ]
};
