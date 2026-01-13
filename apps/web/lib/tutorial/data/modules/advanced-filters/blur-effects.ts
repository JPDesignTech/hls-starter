import { type Lesson } from '@/lib/tutorial/types';

export const blurEffects: Lesson = {
  id: 'blur-effects',
  title: 'Blur Effects',
  module: 'Advanced Filters',
  duration: 25,
  unlockAfter: 'color-grading',
  content: [
    {
      type: 'introduction',
      heading: 'What This Lesson Covers',
      content: 'Applying blur to video for backgrounds, glam looks, or masks. Useful for privacy (faces), creative backgrounds, depth-of-field aesthetics.'
    },
    {
      type: 'bullets',
      heading: 'Why It Matters',
      content: 'Blur effects enable:',
      bullets: [
        'Privacy protection (blurring faces)',
        'Creative background blur (bokeh effect)',
        'Glamour/beauty effects',
        'Depth-of-field simulation',
        'Focusing attention on specific areas'
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "gblur=sigma=10" output.mp4',
      explanation: 'Apply Gaussian blur with sigma=10. Higher sigma values create stronger blur. Gaussian blur provides smooth, natural-looking blur.',
      flagBreakdown: [
        {
          flag: 'gblur=sigma=10',
          description: 'Gaussian blur with sigma value of 10 (blur strength)'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "boxblur=luma_radius=10:luma_power=1" output.mp4',
      explanation: 'Simple box blur. Faster than Gaussian but less smooth. Good for quick previews or when performance matters.',
      flagBreakdown: [
        {
          flag: 'boxblur=luma_radius=10',
          description: 'Box blur with radius of 10 pixels on luma channel'
        },
        {
          flag: 'luma_power=1',
          description: 'Number of box blur iterations'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "smartblur=luma_radius=5:luma_threshold=50:chroma_radius=5:chroma_threshold=50" output.mp4',
      explanation: 'Edge-preserving blur. Blurs areas while preserving edges, useful for noise reduction without losing detail.',
      flagBreakdown: [
        {
          flag: 'luma_radius=5',
          description: 'Blur radius for luminance channel'
        },
        {
          flag: 'luma_threshold=50',
          description: 'Threshold for edge detection (higher = more edges preserved)'
        },
        {
          flag: 'chroma_radius=5',
          description: 'Blur radius for chrominance (color) channel'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Blur Filter Types',
      content: 'Common blur filters:',
      bullets: [
        'gblur: Gaussian blur - smooth, natural, most common',
        'boxblur: Simple box blur - faster but less smooth',
        'smartblur: Edge-preserving blur - maintains detail while blurring',
        'Higher sigma/radius = stronger blur',
        'Can be limited to regions via overlay/filter_complex',
        'Gaussian blur is most commonly used for professional results'
      ]
    },
    {
      type: 'preview',
      heading: 'Try It: Blur Effect',
      content: 'See how blur transforms the video appearance',
      code: 'ffmpeg -i sample.mp4 -vf "gblur=sigma=10" output.mp4',
      explanation: 'This applies Gaussian blur with moderate strength for a soft, dreamy effect',
      previewType: 'filter',
      sampleVideoId: 'sample-advanced-075'
    },
    {
      type: 'challenge',
      title: 'Apply Strong Blur',
      description: 'Create a command that applies a strong Gaussian blur effect',
      requirements: [
        'Use gblur filter',
        'Set sigma to 20 or higher',
        'Apply to entire video'
      ],
      hints: [
        'sigma controls blur strength',
        'Higher sigma = stronger blur',
        'sigma=20 creates very strong blur'
      ],
      solution: 'ffmpeg -i input.mp4 -vf "gblur=sigma=20" output.mp4',
      validation: {
        type: 'contains',
        value: 'sigma=20'
      }
    },
    {
      type: 'quiz',
      question: 'What is the main advantage of smartblur over gblur?',
      options: [
        { id: 'a', text: 'Faster processing', correct: false },
        { id: 'b', text: 'Preserves edges while blurring', correct: true },
        { id: 'c', text: 'Stronger blur effect', correct: false },
        { id: 'd', text: 'Smaller file size', correct: false }
      ],
      explanation: 'smartblur is an edge-preserving blur that maintains detail and edges while blurring other areas. This is useful for noise reduction without losing important details, unlike gblur which blurs everything uniformly.'
    }
  ]
};
