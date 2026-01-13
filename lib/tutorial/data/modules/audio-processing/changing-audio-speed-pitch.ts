import { Lesson } from '@/lib/tutorial/types';

export const changingAudioSpeedPitch: Lesson = {
  id: 'changing-audio-speed-pitch',
  title: 'Changing Audio Speed / Pitch',
  module: 'Audio Processing',
  duration: 25,
  unlockAfter: 'audio-fade-in-fade-out',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Speeding up or slowing down audio is useful for podcasts, accessibility, and syncing with video. FFmpeg provides filters to change speed while preserving pitch (atempo) or change both speed and pitch (asetrate).'
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.wav -filter:a "atempo=1.25" output.wav',
      explanation: 'Speed up audio by 25% without changing pitch. atempo preserves pitch while changing speed. Range is 0.5 to 2.0 per filter instance.',
      flagBreakdown: [
        {
          flag: '-filter:a "atempo=1.25"',
          description: 'Audio filter: speed up by 25% (1.25×) while preserving pitch'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.wav -filter:a "atempo=0.75" output.wav',
      explanation: 'Slow down audio to 75% speed (25% slower) without changing pitch. Values less than 1.0 slow down, values greater than 1.0 speed up.',
      flagBreakdown: [
        {
          flag: '-filter:a "atempo=0.75"',
          description: 'Audio filter: slow down to 75% speed (0.75×) while preserving pitch'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.wav -filter:a "atempo=1.5,atempo=1.5" output.wav',
      explanation: 'Chain multiple atempo filters for larger speed changes. This speeds up 2.25× (1.5 × 1.5). Chain filters to exceed the 0.5-2.0 range.',
      flagBreakdown: [
        {
          flag: '-filter:a "atempo=1.5,atempo=1.5"',
          description: 'Chain two atempo filters: 1.5× × 1.5× = 2.25× speed'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.wav -filter:a "asetrate=44100*1.2,aresample=44100" output.wav',
      explanation: 'Change both speed and pitch. This speeds up 20% and raises pitch. asetrate changes sample rate, aresample resamples back to original rate.',
      flagBreakdown: [
        {
          flag: '-filter:a "asetrate=44100*1.2,aresample=44100"',
          description: 'Change sample rate to 1.2× (20% faster + higher pitch), then resample to 44100 Hz'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Speed vs Pitch',
      content: 'Understanding the difference:',
      bullets: [
        'atempo: Changes speed while preserving pitch (sounds natural)',
        'asetrate: Changes both speed and pitch (chipmunk effect when faster)',
        'atempo range: 0.5 to 2.0 per filter (chain for larger changes)',
        'Use atempo for podcasts and accessibility (speed up without pitch change)',
        'Use asetrate when you want pitch changes (special effects)'
      ]
    },
    {
      type: 'bullets',
      heading: 'Common Use Cases',
      content: 'When to change audio speed:',
      bullets: [
        'Podcasts: Speed up playback for faster consumption',
        'Accessibility: Adjust speed for different listening preferences',
        'Video sync: Match audio speed to video playback speed',
        'Time constraints: Fit content into specific time limits',
        'Special effects: Create slow-motion or fast-forward audio effects'
      ]
    },
    {
      type: 'challenge',
      title: 'Speed Up Audio',
      description: 'Speed up audio by 50% while preserving pitch',
      requirements: [
        'Use -i for input file',
        'Use -filter:a with atempo',
        'Set speed to 1.5× (50% faster)',
        'Preserve pitch'
      ],
      hints: [
        'atempo preserves pitch while changing speed',
        '1.5 means 1.5× speed (50% faster)',
        'Use -filter:a flag for audio filters'
      ],
      solution: 'ffmpeg -i input.wav -filter:a "atempo=1.5" output.wav',
      validation: {
        type: 'contains',
        value: 'atempo=1.5'
      }
    },
    {
      type: 'quiz',
      question: 'What is the difference between atempo and asetrate?',
      options: [
        { id: 'a', text: 'atempo changes speed and pitch, asetrate only changes speed', correct: false },
        { id: 'b', text: 'atempo preserves pitch while changing speed, asetrate changes both', correct: true },
        { id: 'c', text: 'There is no difference', correct: false },
        { id: 'd', text: 'atempo is faster', correct: false }
      ],
      explanation: 'atempo changes playback speed while preserving pitch (sounds natural), while asetrate changes both speed and pitch (creates chipmunk effect when sped up).'
    }
  ]
};
