import { Lesson } from '@/lib/tutorial/types';

export const colorGrading: Lesson = {
  id: 'color-grading',
  title: 'Color Grading',
  module: 'Advanced Filters',
  duration: 30,
  unlockAfter: 'frame-interpolation',
  content: [
    {
      type: 'introduction',
      heading: 'What This Lesson Covers',
      content: 'Adjusting the look/color of footage (contrast, brightness, saturation, LUTs). Used in post-production to create mood, consistency, or stylistic tone.'
    },
    {
      type: 'bullets',
      heading: 'Why It Matters',
      content: 'Color grading enables:',
      bullets: [
        'Creating mood and atmosphere',
        'Consistent color across shots',
        'Stylistic looks (vintage, cinematic, etc.)',
        'Professional post-production workflows'
      ]
    },
    {
      type: 'diagram',
      title: 'Color Grading Pipeline',
      diagram: `flowchart LR
    Input[Input Video] --> Analyze[Color Analysis]
    Analyze --> Method{Method}
    Method -->|Basic| EQ[eq Filter<br/>contrast/brightness<br/>saturation/gamma]
    Method -->|Professional| LUT[lut3d Filter<br/>3D Look-Up Table]
    EQ --> Output[Output Video]
    LUT --> Output`,
      explanation: 'Color grading pipeline: Input video is analyzed, then color adjustments are applied using either the eq filter for basic adjustments (contrast, brightness, saturation, gamma) or the lut3d filter for professional LUT-based looks.',
      diagramType: 'mermaid',
      diagramFormat: 'flowchart'
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "eq=contrast=1.2:brightness=0.05:saturation=1.3" output.mp4',
      explanation: 'Basic color adjustments: increase contrast by 20%, add slight brightness boost, increase saturation by 30%.',
      flagBreakdown: [
        {
          flag: 'contrast=1.2',
          description: 'Increase contrast by 20% (1.0 = no change, >1.0 = more contrast)'
        },
        {
          flag: 'brightness=0.05',
          description: 'Increase brightness by 0.05 (-1.0 to 1.0 range)'
        },
        {
          flag: 'saturation=1.3',
          description: 'Increase saturation by 30% (0.0 = grayscale, 1.0 = normal, >1.0 = more vibrant)'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "eq=gamma=1.1:gamma_r=1.05:gamma_g=1.0:gamma_b=1.1" output.mp4',
      explanation: 'Adjust gamma per channel for color balance. Slightly increase red and blue gamma for warmer tones.',
      flagBreakdown: [
        {
          flag: 'gamma=1.1',
          description: 'Overall gamma adjustment (brightness curve)'
        },
        {
          flag: 'gamma_r=1.05',
          description: 'Red channel gamma adjustment'
        },
        {
          flag: 'gamma_g=1.0',
          description: 'Green channel gamma (no change)'
        },
        {
          flag: 'gamma_b=1.1',
          description: 'Blue channel gamma adjustment'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "lut3d=file.cube" output.mp4',
      explanation: 'Apply a professional LUT (Look-Up Table) file. LUTs are used in After Effects, DaVinci Resolve, and other professional tools.',
      flagBreakdown: [
        {
          flag: 'lut3d=file.cube',
          description: 'Apply 3D LUT from .cube file (common LUT format)'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Color Grading Tips',
      content: 'Best practices:',
      bullets: [
        'eq filter: Basic adjustments (contrast, brightness, saturation, gamma)',
        'lut3d: Professional LUTs for cinematic looks',
        'Start with subtle adjustments and build up',
        'Monitor on calibrated displays for accurate results',
        'LUTs can be downloaded from professional color grading resources',
        'Combine multiple filters for complex looks'
      ]
    },
    {
      type: 'preview',
      heading: 'Try It: Color Grading',
      content: 'See how color adjustments transform the look of your video',
      code: 'ffmpeg -i sample.mp4 -vf "eq=contrast=1.2:brightness=0.05:saturation=1.3" output.mp4',
      explanation: 'This applies basic color grading: increased contrast, brightness, and saturation for a more vibrant look',
      previewType: 'filter',
      sampleVideoId: 'sample-advanced-074'
    },
    {
      type: 'challenge',
      title: 'Create Vintage Look',
      description: 'Create a command that applies a vintage look: reduce saturation and adjust gamma',
      requirements: [
        'Use eq filter',
        'Reduce saturation below 1.0',
        'Adjust gamma for vintage feel'
      ],
      hints: [
        'saturation=0.7 creates desaturated look',
        'gamma=0.9 darkens midtones for vintage feel',
        'Combine saturation and gamma in eq filter'
      ],
      solution: 'ffmpeg -i input.mp4 -vf "eq=saturation=0.7:gamma=0.9" output.mp4',
      validation: {
        type: 'contains',
        value: 'saturation=0.7'
      }
    },
    {
      type: 'quiz',
      question: 'What does saturation=0.5 do in the eq filter?',
      options: [
        { id: 'a', text: 'Doubles the color intensity', correct: false },
        { id: 'b', text: 'Reduces color intensity by 50%', correct: true },
        { id: 'c', text: 'Inverts colors', correct: false },
        { id: 'd', text: 'Converts to grayscale', correct: false }
      ],
      explanation: 'saturation=0.5 reduces color intensity by 50%, creating a more muted, desaturated look. saturation=0.0 would be grayscale, and saturation=1.0 is normal.'
    }
  ]
};
