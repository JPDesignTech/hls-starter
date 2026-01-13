import { Lesson } from '@/lib/tutorial/types';

export const addingSubtitlesToVideos: Lesson = {
  id: 'adding-subtitles-to-videos',
  title: 'Adding Subtitles to Videos',
  module: 'Common Use Cases',
  duration: 20,
  unlockAfter: 'creating-video-thumbnails',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Adding subtitles to videos can be done in two ways: burning them into the video (permanent) or attaching them as selectable streams. Each method has different use cases and requirements.'
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf subtitles=subs.srt output.mp4',
      explanation: 'Burn-in subtitles (permanent). Subtitles become part of the video and cannot be turned off.',
      flagBreakdown: [
        {
          flag: '-vf subtitles=subs.srt',
          description: 'Video filter: burn subtitles from SRT file into video'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -i subs.srt -c copy -c:s mov_text output.mp4',
      explanation: 'Attach subtitles as selectable stream. Subtitles can be turned on/off in players that support them.',
      flagBreakdown: [
        {
          flag: '-i subs.srt',
          description: 'Second input: subtitle file'
        },
        {
          flag: '-c copy',
          description: 'Copy video and audio streams without re-encoding'
        },
        {
          flag: '-c:s mov_text',
          description: 'Encode subtitle stream as mov_text (MP4 subtitle format)'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "subtitles=subs.srt:force_style=\'FontSize=24,PrimaryColour=&Hffffff\'" output.mp4',
      explanation: 'Burn-in subtitles with custom styling. Control font size, color, and other subtitle properties.',
      flagBreakdown: [
        {
          flag: '-vf "subtitles=subs.srt:force_style=\'FontSize=24,PrimaryColour=&Hffffff\'"',
          description: 'Burn subtitles with custom font size (24) and white color'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Burn-in vs Embedded',
      content: 'Understanding the difference:',
      bullets: [
        'Burned subtitles: Permanent part of video, cannot be turned off',
        'Embedded subtitles: Selectable stream, can be toggled in supported players',
        'Burned subtitles: Good for platforms without subtitle support',
        'Embedded subtitles: Better for accessibility and multilingual content',
        'Burned subtitles: Require re-encoding (slower)',
        'Embedded subtitles: Can use stream copy (faster)'
      ]
    },
    {
      type: 'bullets',
      heading: 'Use Cases',
      content: 'When to use each method:',
      bullets: [
        'Burn-in: Social media platforms, simple players, permanent display',
        'Embedded: Professional video, streaming platforms, accessibility',
        'Burn-in: When subtitle support is uncertain',
        'Embedded: When you want user control over subtitles'
      ]
    },
    {
      type: 'challenge',
      title: 'Add Embedded Subtitles',
      description: 'Attach an SRT subtitle file to a video as a selectable stream',
      requirements: [
        'Use two -i flags (video and subtitle)',
        'Use -c copy for video/audio',
        'Use -c:s mov_text for subtitle encoding'
      ],
      hints: [
        'First -i for video, second -i for subtitle file',
        'Use -c copy to avoid re-encoding',
        'Use -c:s mov_text for MP4 subtitle format'
      ],
      solution: 'ffmpeg -i input.mp4 -i subs.srt -c copy -c:s mov_text output.mp4',
      validation: {
        type: 'contains',
        value: '-c:s mov_text'
      }
    },
    {
      type: 'quiz',
      question: 'What is the main difference between burned-in and embedded subtitles?',
      options: [
        { id: 'a', text: 'Burned-in can be turned off, embedded cannot', correct: false },
        { id: 'b', text: 'Burned-in are permanent, embedded are selectable', correct: true },
        { id: 'c', text: 'Embedded require re-encoding, burned-in do not', correct: false },
        { id: 'd', text: 'There is no difference', correct: false }
      ],
      explanation: 'Burned-in subtitles are permanently part of the video and cannot be turned off. Embedded subtitles are attached as a separate stream that can be toggled on/off in players that support them.'
    }
  ]
};
