import { type Lesson } from '@/lib/tutorial/types';

export const sharpening: Lesson = {
  id: 'sharpening',
  title: 'Sharpening',
  module: 'Advanced Filters',
  duration: 20,
  unlockAfter: 'blur-effects',
  content: [
    {
      type: 'introduction',
      heading: 'What This Lesson Covers',
      content: 'Increasing edge contrast to make video appear sharper. Improve focus on soft footage or enhance detail.'
    },
    {
      type: 'bullets',
      heading: 'Why It Matters',
      content: 'Sharpening enables:',
      bullets: [
        'Improving focus on soft footage',
        'Enhancing detail and clarity',
        'Compensating for lens softness',
        'Making videos appear more crisp and professional'
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "unsharp=5:5:1.0:5:5:0.0" output_sharp.mp4',
      explanation: 'Apply unsharp mask filter. Parameters: luma matrix size (5x5), luma strength (1.0), chroma matrix size (5x5), chroma strength (0.0 = disabled).',
      flagBreakdown: [
        {
          flag: 'unsharp=5:5:1.0:5:5:0.0',
          description: 'Unsharp mask: luma_w:luma_h:luma_amount:chroma_w:chroma_h:chroma_amount'
        },
        {
          flag: '5:5',
          description: 'Luma matrix size 5×5 pixels'
        },
        {
          flag: '1.0',
          description: 'Luma sharpening strength (higher = sharper)'
        },
        {
          flag: '0.0',
          description: 'Chroma sharpening disabled (0.0)'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "unsharp=5:5:2.0:5:5:0.5" output.mp4',
      explanation: 'Stronger sharpening with chroma enabled. Higher luma amount (2.0) and chroma amount (0.5) for more aggressive sharpening.',
      flagBreakdown: [
        {
          flag: 'luma_amount=2.0',
          description: 'Stronger luma sharpening'
        },
        {
          flag: 'chroma_amount=0.5',
          description: 'Moderate chroma sharpening'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "unsharp=3:3:0.5:3:3:0.0" output.mp4',
      explanation: 'Subtle sharpening with smaller matrix. 3×3 matrix with low strength (0.5) for gentle enhancement without artifacts.',
      flagBreakdown: [
        {
          flag: '3:3',
          description: 'Smaller 3×3 matrix for subtle effect'
        },
        {
          flag: '0.5',
          description: 'Low sharpening strength for subtle enhancement'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Sharpening Tips',
      content: 'Best practices:',
      bullets: [
        'Unsharp filter: Most common sharpening filter',
        'Higher strength = sharper but may increase noise',
        'Smaller matrix (3×3) = subtle, larger (5×5+) = stronger',
        'Sharpening can increase noise — follow up with denoise if needed',
        'Start with low values and increase gradually',
        'Disable chroma sharpening (0.0) to avoid color artifacts'
      ]
    },
    {
      type: 'preview',
      heading: 'Try It: Sharpening',
      content: 'See how sharpening enhances video detail and clarity',
      code: 'ffmpeg -i sample.mp4 -vf "unsharp=5:5:1.0:5:5:0.0" output.mp4',
      explanation: 'This applies moderate sharpening to enhance edge detail and make the video appear crisper',
      previewType: 'filter',
      sampleVideoId: 'sample-advanced-076'
    },
    {
      type: 'challenge',
      title: 'Apply Subtle Sharpening',
      description: 'Create a command that applies subtle sharpening with a small matrix',
      requirements: [
        'Use unsharp filter',
        'Use 3×3 matrix size',
        'Set luma strength to 0.5',
        'Disable chroma sharpening'
      ],
      hints: [
        'Matrix size is first two parameters',
        '3:3 creates a 3×3 matrix',
        '0.5 is a low strength value',
        '0.0 disables chroma'
      ],
      solution: 'ffmpeg -i input.mp4 -vf "unsharp=3:3:0.5:3:3:0.0" output.mp4',
      validation: {
        type: 'contains',
        value: 'unsharp=3:3:0.5'
      }
    },
    {
      type: 'quiz',
      question: 'What happens if you apply too much sharpening?',
      options: [
        { id: 'a', text: 'Video becomes blurrier', correct: false },
        { id: 'b', text: 'Noise and artifacts may increase', correct: true },
        { id: 'c', text: 'File size decreases', correct: false },
        { id: 'd', text: 'Colors become more vibrant', correct: false }
      ],
      explanation: 'Excessive sharpening can increase noise and create halos or artifacts around edges. It\'s best to use moderate sharpening and combine with noise reduction if needed.'
    }
  ]
};
