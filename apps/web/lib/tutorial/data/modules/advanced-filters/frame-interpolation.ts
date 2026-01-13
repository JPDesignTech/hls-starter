import { Lesson } from '@/lib/tutorial/types';

export const frameInterpolation: Lesson = {
  id: 'frame-interpolation',
  title: 'Frame Interpolation (Increase Smoothness & FPS)',
  module: 'Advanced Filters',
  duration: 25,
  unlockAfter: 'speed-ramping',
  content: [
    {
      type: 'introduction',
      heading: 'What This Lesson Covers',
      content: 'Generating intermediate frames to smooth motion or change FPS. Used to create 60fps/120fps effects from 24/30fps footage.'
    },
    {
      type: 'bullets',
      heading: 'Why It Matters',
      content: 'Frame interpolation enables:',
      bullets: [
        'Smoother motion in low FPS footage',
        'Converting 24/30fps to 60/120fps',
        'Creating cinematic slow-motion effects',
        'Improving perceived video quality'
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "minterpolate=fps=60" output.mp4',
      explanation: 'Basic interpolation to 60fps. minterpolate uses motion-based interpolation for smoother results than simple frame duplication.',
      flagBreakdown: [
        {
          flag: 'minterpolate=fps=60',
          description: 'Motion-based interpolation to 60 frames per second'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1" output.mp4',
      explanation: 'Advanced interpolation with high-quality settings. Uses motion compensation and bidirectional motion estimation for best results.',
      flagBreakdown: [
        {
          flag: 'mi_mode=mci',
          description: 'Motion-compensated interpolation mode'
        },
        {
          flag: 'mc_mode=aobmc',
          description: 'Adaptive overlapped block motion compensation'
        },
        {
          flag: 'me_mode=bidir',
          description: 'Bidirectional motion estimation'
        },
        {
          flag: 'vsbmc=1',
          description: 'Variable-size block motion compensation enabled'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "tblend=all_mode=average" output.mp4',
      explanation: 'Simple blending between frames using tblend. Faster but blurrier than minterpolate. Good for quick previews.',
      flagBreakdown: [
        {
          flag: 'tblend=all_mode=average',
          description: 'Temporal blend using average mode between frames'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Interpolation Methods',
      content: 'Comparison of interpolation approaches:',
      bullets: [
        'tblend: Fast but blurrier, simple frame averaging',
        'minterpolate: Slower but smoother, motion-based interpolation',
        'minterpolate with advanced options: Best quality but compute-intensive',
        'Higher target FPS = more processing time required',
        'Motion-based methods work best with consistent motion'
      ]
    },
    {
      type: 'preview',
      heading: 'Try It: Frame Interpolation',
      content: 'Watch smooth motion interpolation increase the frame rate',
      code: 'ffmpeg -i sample.mp4 -vf "minterpolate=fps=60" output.mp4',
      explanation: 'This interpolates frames to create smoother 60fps motion from lower FPS source',
      previewType: 'filter',
      sampleVideoId: 'sample-advanced-073'
    },
    {
      type: 'challenge',
      title: 'Interpolate to 120fps',
      description: 'Create a command that interpolates video to 120fps using high-quality settings',
      requirements: [
        'Use minterpolate filter',
        'Set target FPS to 120',
        'Use motion-compensated interpolation mode'
      ],
      hints: [
        'fps=120 sets the target frame rate',
        'mi_mode=mci enables motion compensation',
        'Higher FPS requires more processing time'
      ],
      solution: 'ffmpeg -i input.mp4 -vf "minterpolate=fps=120:mi_mode=mci" output.mp4',
      validation: {
        type: 'contains',
        value: 'fps=120'
      }
    },
    {
      type: 'quiz',
      question: 'What is the main advantage of minterpolate over tblend for frame interpolation?',
      options: [
        { id: 'a', text: 'Faster processing', correct: false },
        { id: 'b', text: 'Smoother motion-based interpolation', correct: true },
        { id: 'c', text: 'Smaller file size', correct: false },
        { id: 'd', text: 'Better color accuracy', correct: false }
      ],
      explanation: 'minterpolate uses motion-based interpolation which analyzes motion between frames to create more accurate intermediate frames, resulting in smoother motion compared to tblend\'s simple frame averaging.'
    }
  ]
};
