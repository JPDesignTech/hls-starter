import { Lesson } from '@/lib/tutorial/types';

export const advancedVideoFiltering: Lesson = {
  id: 'advanced-video-filtering',
  title: 'Advanced Video Filtering',
  module: 'Advanced Techniques',
  duration: 30,
  unlockAfter: 'advanced-audio-filtering',
  content: [
    {
      type: 'introduction',
      heading: 'What This Lesson Covers',
      content: 'Using multi-stage video filters for professional effects like motion blur, tilt-shift, and lens correction. Ideal for cinematic workflows without a full NLE (Non-Linear Editor).'
    },
    {
      type: 'bullets',
      heading: 'Why It Matters',
      content: 'Advanced video filtering enables:',
      bullets: [
        'Cinematic effects without full video editors',
        'Motion blur and time-based effects',
        'Tilt-shift and depth-of-field simulation',
        'Lens correction and distortion fixes',
        'Professional post-production workflows'
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "tblend=all_mode=\'average\',framestep=2" output.mp4',
      explanation: 'Motion blur effect: tblend blends successive frames to simulate blur, combined with frame skipping for stronger effect.',
      flagBreakdown: [
        {
          flag: 'tblend=all_mode=\'average\'',
          description: 'Temporal blend using average mode between frames'
        },
        {
          flag: 'framestep=2',
          description: 'Process every 2nd frame (increases blur effect)'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "tiltandshift=x=0:y=0:radius=200:blur=5" output.mp4',
      explanation: 'Tilt-shift effect: Creates miniature effect by blurring top and bottom while keeping center sharp. Simulates shallow depth of field.',
      flagBreakdown: [
        {
          flag: 'tiltandshift=x=0:y=0:radius=200:blur=5',
          description: 'Tilt-shift: center at (0,0), radius 200px, blur strength 5'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "lenscorrection=k1=-0.15:k2=0.05" output.mp4',
      explanation: 'Lens correction: Fixes barrel/pincushion distortion. k1 and k2 control radial distortion correction.',
      flagBreakdown: [
        {
          flag: 'lenscorrection=k1=-0.15:k2=0.05',
          description: 'Lens correction: k1 radial distortion, k2 tangential distortion'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "curves=preset=lighter,eq=contrast=1.2:saturation=1.1" output.mp4',
      explanation: 'Multi-stage color grading: Apply curves for brightness adjustment, then EQ for contrast and saturation boost.',
      flagBreakdown: [
        {
          flag: 'curves=preset=lighter',
          description: 'Apply lighter curves preset (brightens image)'
        },
        {
          flag: 'eq=contrast=1.2:saturation=1.1',
          description: 'Increase contrast 20% and saturation 10%'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Advanced Video Filter Types',
      content: 'Professional video filters:',
      bullets: [
        'tblend: Motion blur through temporal blending',
        'tiltandshift: Miniature/shallow depth-of-field effect',
        'lenscorrection: Fix lens distortion',
        'curves: Advanced color grading',
        'vignette: Add darkening around edges',
        'deshake: Advanced video stabilization',
        'yadif: Deinterlacing for professional workflows'
      ]
    },
    {
      type: 'bullets',
      heading: 'Multi-Stage Filtering',
      content: 'Chaining filters for complex effects:',
      bullets: [
        'Chain filters with commas for sequential processing',
        'Each filter processes output of previous filter',
        'Order matters: process in logical sequence',
        'Combine color, blur, and distortion filters',
        'Test each stage to understand effect',
        'Use -filter_complex for parallel processing'
      ]
    },
    {
      type: 'preview',
      heading: 'Try It: Advanced Video Filtering',
      content: 'See how advanced video filters create cinematic effects',
      code: 'ffmpeg -i sample.mp4 -vf "tblend=all_mode=\'average\',framestep=2" output.mp4',
      explanation: 'This applies motion blur through temporal blending. Advanced video filters enable professional effects without full video editing software.',
      previewType: 'filter',
      sampleVideoId: 'sample-advanced-093'
    },
    {
      type: 'challenge',
      title: 'Create Tilt-Shift Effect',
      description: 'Create a command that applies tilt-shift effect to video',
      requirements: [
        'Use tiltandshift filter',
        'Set blur radius to 300',
        'Set blur strength to 8',
        'Center effect at middle of frame'
      ],
      hints: [
        'tiltandshift requires x, y, radius, and blur parameters',
        'Center coordinates: x=W/2, y=H/2',
        'Higher blur value = stronger effect'
      ],
      solution: 'ffmpeg -i input.mp4 -vf "tiltandshift=x=iw/2:y=ih/2:radius=300:blur=8" output.mp4',
      validation: {
        type: 'contains',
        value: 'tiltandshift'
      }
    },
    {
      type: 'quiz',
      question: 'What does the tblend filter do?',
      options: [
        { id: 'a', text: 'Blends colors between frames', correct: false },
        { id: 'b', text: 'Blends successive frames to create motion blur', correct: true },
        { id: 'c', text: 'Blends multiple video inputs', correct: false },
        { id: 'd', text: 'Blends audio tracks', correct: false }
      ],
      explanation: 'tblend (temporal blend) blends successive frames together to simulate motion blur. This creates a smooth, cinematic effect by averaging frames over time, making fast motion appear blurred.'
    }
  ]
};
