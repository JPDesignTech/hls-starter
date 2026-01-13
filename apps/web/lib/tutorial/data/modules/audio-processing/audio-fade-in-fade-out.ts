import { type Lesson } from '@/lib/tutorial/types';

export const audioFadeInFadeOut: Lesson = {
  id: 'audio-fade-in-fade-out',
  title: 'Audio Fade In / Fade Out',
  module: 'Audio Processing',
  duration: 20,
  unlockAfter: 'removing-audio-from-video',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Smooth transitions at the start or end of audio add professional polish and avoid abrupt starts or stops. FFmpeg\'s afade filter provides easy control over fade in and fade out effects.'
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.wav -af "afade=t=in:ss=0:d=3" output.wav',
      explanation: 'Fade in over the first 3 seconds. The fade starts at 0 seconds (ss=0) and lasts 3 seconds (d=3).',
      flagBreakdown: [
        {
          flag: '-af "afade=t=in:ss=0:d=3"',
          description: 'Audio filter: fade in (t=in), start at 0s (ss=0), duration 3s (d=3)'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.wav -af "afade=t=out:st=27:d=3" output.wav',
      explanation: 'Fade out over the last 3 seconds. The fade starts at 27 seconds (st=27) and lasts 3 seconds. Adjust st based on your audio duration.',
      flagBreakdown: [
        {
          flag: '-af "afade=t=out:st=27:d=3"',
          description: 'Audio filter: fade out (t=out), start at 27s (st=27), duration 3s (d=3)'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.wav -af "afade=t=in:ss=0:d=2,afade=t=out:st=28:d=2" output.wav',
      explanation: 'Apply both fade in and fade out. Chain multiple afade filters separated by commas.',
      flagBreakdown: [
        {
          flag: '-af "afade=t=in:ss=0:d=2,afade=t=out:st=28:d=2"',
          description: 'Chain two filters: fade in 2s, then fade out starting at 28s for 2s'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Fade Parameters',
      content: 'Understanding afade filter parameters:',
      bullets: [
        't=in: Fade in effect',
        't=out: Fade out effect',
        'ss: Start time for fade in (seconds)',
        'st: Start time for fade out (seconds)',
        'd: Duration of fade (seconds)',
        'Common for intros/outros, transitions, and professional polish'
      ]
    },
    {
      type: 'bullets',
      heading: 'Common Use Cases',
      content: 'When to use fade effects:',
      bullets: [
        'Podcast intros: Smooth start to avoid abrupt beginning',
        'Music tracks: Professional fade out at end',
        'Video transitions: Smooth audio transitions between clips',
        'Background music: Fade in/out for background tracks',
        'Audio editing: Creating polished, professional audio'
      ]
    },
    {
      type: 'challenge',
      title: 'Create Fade Effects',
      description: 'Apply a 2-second fade in to the beginning of an audio file',
      requirements: [
        'Use -i for input file',
        'Use -af with afade filter',
        'Set fade type to in',
        'Set duration to 2 seconds'
      ],
      hints: [
        'Fade type is t=in',
        'Start time is ss=0 for beginning',
        'Duration is d=2 for 2 seconds'
      ],
      solution: 'ffmpeg -i input.wav -af "afade=t=in:ss=0:d=2" output.wav',
      validation: {
        type: 'contains',
        value: 'afade=t=in'
      }
    },
    {
      type: 'quiz',
      question: 'What does afade=t=in:ss=0:d=3 do?',
      options: [
        { id: 'a', text: 'Fades out over 3 seconds', correct: false },
        { id: 'b', text: 'Fades in over the first 3 seconds', correct: true },
        { id: 'c', text: 'Fades at 3 seconds', correct: false },
        { id: 'd', text: 'Fades to 3% volume', correct: false }
      ],
      explanation: 'afade=t=in creates a fade in effect, ss=0 starts at the beginning, and d=3 makes it last 3 seconds.'
    }
  ]
};
