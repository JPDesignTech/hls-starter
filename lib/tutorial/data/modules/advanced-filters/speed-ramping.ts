import { Lesson } from '@/lib/tutorial/types';

export const speedRamping: Lesson = {
  id: 'speed-ramping',
  title: 'Speed Ramping',
  module: 'Advanced Filters',
  duration: 30,
  unlockAfter: 'dynamic-overlay-placement',
  content: [
    {
      type: 'introduction',
      heading: 'What This Lesson Covers',
      content: 'Changing video playback speed smoothly over time (not just static speed change). Used for dramatic slow motion → speed up transitions — common in action editing and highlights.'
    },
    {
      type: 'bullets',
      heading: 'Why It Matters',
      content: 'Speed ramping enables:',
      bullets: [
        'Dramatic slow motion transitions',
        'Action highlight reels',
        'Smooth speed changes within a single clip',
        'Professional editing effects without external software'
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -filter_complex "[0:v]trim=0:3,setpts=PTS/1.0[v0]; [0:v]trim=3:6,setpts=PTS/4.0[v1]; [v0][v1]concat=n=2:v=1[out]" -map "[out]" output.mp4',
      explanation: 'First 3s normal speed, next 3s plays 4× slower. Requires manual segmentation using trim and setpts filters, then concatenating segments.',
      flagBreakdown: [
        {
          flag: 'trim=0:3',
          description: 'Extract frames from 0 to 3 seconds'
        },
        {
          flag: 'setpts=PTS/1.0',
          description: 'Normal speed (divide presentation timestamp by 1.0)'
        },
        {
          flag: 'trim=3:6,setpts=PTS/4.0',
          description: 'Extract 3-6 seconds and slow down 4× (divide PTS by 4)'
        },
        {
          flag: 'concat=n=2:v=1',
          description: 'Concatenate 2 video segments'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -filter_complex "[0:v]trim=0:2,setpts=PTS/0.5[v0]; [0:v]trim=2:5,setpts=PTS/2.0[v1]; [0:v]trim=5:7,setpts=PTS/0.5[v2]; [v0][v1][v2]concat=n=3:v=1[out]" -map "[out]" output.mp4',
      explanation: 'Speed ramp: 2s fast (2×), 3s slow (0.5×), 2s fast (2×). Creates a dramatic slow-motion middle section.',
      flagBreakdown: [
        {
          flag: 'setpts=PTS/0.5',
          description: 'Speed up 2× (smaller divisor = faster playback)'
        },
        {
          flag: 'setpts=PTS/2.0',
          description: 'Slow down 2× (larger divisor = slower playback)'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Speed Ramping Concepts',
      content: 'Understanding speed changes:',
      bullets: [
        'setpts=PTS/0.5: 2× faster (half the time)',
        'setpts=PTS/2.0: 2× slower (double the time)',
        'setpts=PTS/4.0: 4× slower (quadruple the time)',
        'Lower divisor = faster playback',
        'Higher divisor = slower playback',
        'Requires segmenting with trim, then concatenating'
      ]
    },
    {
      type: 'preview',
      heading: 'Try It: Speed Ramp',
      content: 'Watch a video transition from normal speed to slow motion',
      code: 'ffmpeg -i sample.mp4 -filter_complex "[0:v]trim=0:2,setpts=PTS/1.0[v0]; [0:v]trim=2:5,setpts=PTS/3.0[v1]; [v0][v1]concat=n=2:v=1[out]" -map "[out]" output.mp4',
      explanation: 'This creates a speed ramp: normal speed for 2 seconds, then 3× slower for the next 3 seconds',
      previewType: 'filter',
      sampleVideoId: 'sample-advanced-072'
    },
    {
      type: 'challenge',
      title: 'Create Speed Ramp',
      description: 'Create a speed ramp that starts slow (2× slower) for 3 seconds, then speeds up to normal',
      requirements: [
        'Use trim to segment the video',
        'First segment: 2× slower',
        'Second segment: normal speed',
        'Concatenate the segments'
      ],
      hints: [
        'setpts=PTS/2.0 slows down 2×',
        'setpts=PTS/1.0 is normal speed',
        'Use trim=0:3 for first segment, trim=3:end for second'
      ],
      solution: 'ffmpeg -i input.mp4 -filter_complex "[0:v]trim=0:3,setpts=PTS/2.0[v0]; [0:v]trim=3,setpts=PTS/1.0[v1]; [v0][v1]concat=n=2:v=1[out]" -map "[out]" output.mp4',
      validation: {
        type: 'contains',
        value: 'setpts=PTS/2.0'
      }
    },
    {
      type: 'quiz',
      question: 'What does setpts=PTS/0.5 do to video playback speed?',
      options: [
        { id: 'a', text: 'Plays at half speed (2× slower)', correct: false },
        { id: 'b', text: 'Plays at double speed (2× faster)', correct: true },
        { id: 'c', text: 'Plays at normal speed', correct: false },
        { id: 'd', text: 'Reverses the video', correct: false }
      ],
      explanation: 'setpts=PTS/0.5 divides the presentation timestamp by 0.5, effectively doubling the speed. Smaller divisors result in faster playback.'
    }
  ]
};
