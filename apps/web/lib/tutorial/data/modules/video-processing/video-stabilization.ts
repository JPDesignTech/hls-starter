import { type Lesson } from '@/lib/tutorial/types';

export const videoStabilization: Lesson = {
  id: 'video-stabilization',
  title: 'Video Stabilization',
  module: 'Video Processing',
  duration: 25,
  unlockAfter: 'aspect-ratio-changes',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Shaky footage can be stabilized with FFmpeg using filtering. There are two approaches: basic deshake filter (one-pass) or vid.stab library (two-pass) for better results.'
    },
    {
      type: 'bullets',
      heading: 'Stabilization Methods',
      content: 'Two approaches to stabilization:',
      bullets: [
        'Deshake: One-pass method, quick and simple',
        'Vid.stab: Two-pass method, more effective but requires analysis first'
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i shaky.mp4 -vf deshake stabilized.mp4',
      explanation: 'Basic one-pass stabilization using the deshake filter. Quick and simple, but may show black borders if shake is large.',
      flagBreakdown: [
        {
          flag: '-vf deshake',
          description: 'Apply deshake filter to remove camera shake'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i shaky.mp4 -vf vidstabdetect=shakiness=5:accuracy=15 -f null -',
      explanation: 'First pass: Detect motion and write transforms.trf file with camera movement data.',
      flagBreakdown: [
        {
          flag: '-vf vidstabdetect=shakiness=5:accuracy=15',
          description: 'Detect camera shake with shakiness level 5 and accuracy 15'
        },
        {
          flag: '-f null -',
          description: 'No output file needed for analysis pass'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i shaky.mp4 -vf vidstabtransform=input=transforms.trf -c:v libx264 stabilized.mp4',
      explanation: 'Second pass: Apply the stabilization transforms using the data file from the first pass.',
      flagBreakdown: [
        {
          flag: '-vf vidstabtransform=input=transforms.trf',
          description: 'Apply stabilization using the transforms file'
        }
      ]
    },
    {
      type: 'preview',
      heading: 'Try It: Stabilize Video',
      content: 'Stabilize shaky footage using the deshake filter',
      code: 'ffmpeg -i sample.mp4 -vf deshake output.mp4',
      explanation: 'This applies basic stabilization to remove camera shake',
      previewType: 'filter',
      sampleVideoId: 'sample-stabilize-001'
    },
    {
      type: 'quiz',
      question: 'What is the advantage of vid.stab over deshake?',
      options: [
        { id: 'a', text: 'It\'s faster', correct: false },
        { id: 'b', text: 'It provides better results through two-pass analysis', correct: true },
        { id: 'c', text: 'It doesn\'t require re-encoding', correct: false },
        { id: 'd', text: 'It works on all video formats', correct: false }
      ],
      explanation: 'Vid.stab uses a two-pass method that analyzes the video first, then applies stabilization, resulting in better quality but requiring more processing time.'
    }
  ]
};
