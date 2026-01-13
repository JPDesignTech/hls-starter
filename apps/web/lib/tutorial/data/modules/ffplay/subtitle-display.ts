import { type Lesson } from '@/lib/tutorial/types';

export const subtitleDisplay: Lesson = {
  id: 'subtitle-display',
  title: 'Subtitle Display',
  module: 'FFPlay - Video Playback',
  duration: 20,
  unlockAfter: 'audio-channel-selection',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Playing videos with subtitles allows you to verify subtitle rendering, timing alignment, and font rendering. FFplay supports both embedded subtitles and external subtitle files.'
    },
    {
      type: 'code',
      command: 'ffplay input.mkv',
      explanation: 'Auto-load embedded subtitles. If the video file contains embedded subtitle tracks, FFplay will automatically display them.',
      flagBreakdown: [
        {
          flag: 'input.mkv',
          description: 'Video file with embedded subtitles'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffplay -vf "subtitles=subs.srt" input.mp4',
      explanation: 'Use external subtitle file (SRT format). The subtitles filter loads and displays subtitles from an external file.',
      flagBreakdown: [
        {
          flag: '-vf "subtitles=subs.srt"',
          description: 'Video filter: load and display subtitles from subs.srt file'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffplay -vf "subtitles=subs.srt:force_style=\'FontSize=24\'" input.mp4',
      explanation: 'Load subtitles with custom styling. You can override subtitle styles like font size, color, and position.',
      flagBreakdown: [
        {
          flag: '-vf "subtitles=subs.srt:force_style=\'FontSize=24\'"',
          description: 'Load subtitles and force font size to 24'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Subtitle Notes',
      content: 'Important points about subtitles:',
      bullets: [
        'Great for checking timing alignment',
        'Useful for verifying font rendering',
        'Subtitle rendering depends on FFplay build having subtitle filter support',
        'External subtitle files must be in supported format (SRT, ASS, etc.)',
        'You can cycle through subtitle tracks with the t key during playback'
      ]
    },
    {
      type: 'bullets',
      heading: 'Supported Subtitle Formats',
      content: 'Common subtitle formats:',
      bullets: [
        'SRT: Simple text-based format',
        'ASS/SSA: Advanced SubStation Alpha with styling',
        'VTT: WebVTT format',
        'Embedded: Subtitles embedded in video container'
      ]
    },
    {
      type: 'challenge',
      title: 'Load External Subtitles',
      description: 'Create a command to play a video with external subtitles from a file named subtitles.srt',
      requirements: [
        'Use ffplay command',
        'Use -vf flag with subtitles filter',
        'Specify subtitles.srt file'
      ],
      hints: [
        'The subtitles filter syntax is subtitles=filename',
        'Use -vf flag for video filters',
        'Quote the filter string'
      ],
      solution: 'ffplay -vf "subtitles=subtitles.srt" input.mp4',
      validation: {
        type: 'contains',
        value: 'subtitles=subtitles.srt'
      }
    },
    {
      type: 'quiz',
      question: 'How do you load external subtitles in FFplay?',
      options: [
        { id: 'a', text: 'Use -sub flag', correct: false },
        { id: 'b', text: 'Use -vf "subtitles=file.srt"', correct: true },
        { id: 'c', text: 'Use -srt flag', correct: false },
        { id: 'd', text: 'Subtitles load automatically', correct: false }
      ],
      explanation: 'External subtitles are loaded using the subtitles video filter with -vf flag. The syntax is -vf "subtitles=filename.srt".'
    }
  ]
};
