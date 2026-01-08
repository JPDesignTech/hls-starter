import { Lesson } from '@/lib/tutorial/types';

export const timelapseCreation: Lesson = {
  id: 'timelapse-creation',
  title: 'Time-lapse Creation',
  module: 'Video Processing',
  duration: 25,
  unlockAfter: 'video-stabilization',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Time-lapse videos are created either by compiling a sequence of still images or by speeding up an existing video dramatically. FFmpeg can do both methods effectively.'
    },
    {
      type: 'bullets',
      heading: 'Two Approaches',
      content: 'Methods for creating time-lapse:',
      bullets: [
        'From still images: Stitch photos taken at intervals into a video',
        'From video: Speed up an existing long video using filters'
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -framerate 30 -i timelapse_%04d.jpg -c:v libx264 -crf 18 output.mp4',
      explanation: 'Create time-lapse from image sequence. Images should be sequentially named (timelapse_0001.jpg, timelapse_0002.jpg, etc.).',
      flagBreakdown: [
        {
          flag: '-framerate 30',
          description: 'Set input frame rate to 30 fps'
        },
        {
          flag: '-i timelapse_%04d.jpg',
          description: 'Input pattern for sequentially named images'
        },
        {
          flag: '-crf 18',
          description: 'High quality encoding'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "setpts=0.1*PTS" -an fast.mp4',
      explanation: 'Speed up a video 10× by making each frame\'s timestamp 1/10th. The -an flag drops audio.',
      flagBreakdown: [
        {
          flag: '-vf "setpts=0.1*PTS"',
          description: 'Set presentation timestamps to 0.1× (10× speed)'
        },
        {
          flag: '-an',
          description: 'Disable audio output'
        }
      ]
    },
    {
      type: 'preview',
      heading: 'Try It: Create Time-lapse',
      content: 'Speed up a video to create a time-lapse effect',
      code: 'ffmpeg -i sample.mp4 -vf "setpts=0.1*PTS" -an output.mp4',
      explanation: 'This speeds up the video 10× to create a time-lapse effect',
      previewType: 'filter',
      sampleVideoId: 'sample-timelapse-001'
    },
    {
      type: 'challenge',
      title: 'Create Time-lapse',
      description: 'Create a command to speed up a video 5× for a time-lapse effect',
      requirements: [
        'Use setpts filter',
        'Speed up by 5×',
        'Remove audio with -an'
      ],
      hints: [
        'setpts multiplier for 5× speed is 0.2',
        'Use -an to disable audio',
        'The filter syntax is setpts=0.2*PTS'
      ],
      solution: 'ffmpeg -i input.mp4 -vf "setpts=0.2*PTS" -an output.mp4',
      validation: {
        type: 'contains',
        value: 'setpts=0.2*PTS'
      }
    },
    {
      type: 'quiz',
      question: 'What does setpts=0.1*PTS do?',
      options: [
        { id: 'a', text: 'Slows down video 10×', correct: false },
        { id: 'b', text: 'Speeds up video 10×', correct: true },
        { id: 'c', text: 'Changes frame rate to 10 fps', correct: false },
        { id: 'd', text: 'Crops 10% of the video', correct: false }
      ],
      explanation: 'setpts=0.1*PTS makes each frame\'s timestamp 1/10th of the original, effectively speeding up playback 10×.'
    }
  ]
};
