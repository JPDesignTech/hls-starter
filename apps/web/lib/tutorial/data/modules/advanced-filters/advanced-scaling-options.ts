import { type Lesson } from '@/lib/tutorial/types';

export const advancedScalingOptions: Lesson = {
  id: 'advanced-scaling-options',
  title: 'Advanced Scaling Options',
  module: 'Advanced Filters',
  duration: 20,
  unlockAfter: 'transitions-between-clips',
  content: [
    {
      type: 'introduction',
      heading: 'What This Lesson Covers',
      content: 'High-quality scaling with filter flags. Better quality than default scaling (e.g., for upscaling/downscaling).'
    },
    {
      type: 'bullets',
      heading: 'Why It Matters',
      content: 'Advanced scaling enables:',
      bullets: [
        'Higher quality upscaling/downscaling',
        'Better preservation of detail',
        'Professional video processing',
        'Optimal quality for different output resolutions'
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "scale=1920:1080:flags=lanczos" output.mp4',
      explanation: 'High-quality Lanczos scaling to 1920x1080. Lanczos is sharper than default but slower. Best quality for most use cases.',
      flagBreakdown: [
        {
          flag: 'scale=1920:1080',
          description: 'Scale to 1920×1080 resolution'
        },
        {
          flag: 'flags=lanczos',
          description: 'Use Lanczos scaling algorithm (high quality)'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "scale=1280:720:flags=bicubic" output.mp4',
      explanation: 'Bicubic scaling - good balance between quality and speed. Smoother than bilinear, faster than Lanczos.',
      flagBreakdown: [
        {
          flag: 'flags=bicubic',
          description: 'Use bicubic scaling algorithm'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "scale=3840:2160:flags=lanczos" output.mp4',
      explanation: 'Upscale to 4K using Lanczos. High-quality upscaling preserves detail better than default scaling.',
      flagBreakdown: [
        {
          flag: 'scale=3840:2160',
          description: 'Upscale to 4K UHD (3840×2160)'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Scaling Algorithms',
      content: 'Available scaling flags:',
      bullets: [
        'lanczos: Sharpest, best quality, slower (recommended)',
        'bicubic: Good balance, smoother than Lanczos',
        'bilinear: Fastest, softer results',
        'Lanczos is best for most professional use cases',
        'Higher quality = slower processing',
        'Use Lanczos for upscaling to preserve detail'
      ]
    },
    {
      type: 'preview',
      heading: 'Try It: Advanced Scaling',
      content: 'See how Lanczos scaling preserves detail better than default scaling',
      code: 'ffmpeg -i sample.mp4 -vf "scale=1920:1080:flags=lanczos" output.mp4',
      explanation: 'This uses Lanczos scaling for high-quality upscaling/downscaling',
      previewType: 'filter',
      sampleVideoId: 'sample-advanced-080'
    },
    {
      type: 'challenge',
      title: 'Upscale with Lanczos',
      description: 'Create a command that upscales video to 4K using Lanczos scaling',
      requirements: [
        'Use scale filter',
        'Set resolution to 3840:2160',
        'Use Lanczos algorithm'
      ],
      hints: [
        '3840:2160 is 4K resolution',
        'flags=lanczos enables Lanczos scaling',
        'Lanczos provides best quality for upscaling'
      ],
      solution: 'ffmpeg -i input.mp4 -vf "scale=3840:2160:flags=lanczos" output.mp4',
      validation: {
        type: 'contains',
        value: 'flags=lanczos'
      }
    },
    {
      type: 'quiz',
      question: 'What is the main advantage of Lanczos scaling over bilinear?',
      options: [
        { id: 'a', text: 'Faster processing', correct: false },
        { id: 'b', text: 'Sharper results with better detail preservation', correct: true },
        { id: 'c', text: 'Smaller file size', correct: false },
        { id: 'd', text: 'Better color accuracy', correct: false }
      ],
      explanation: 'Lanczos scaling uses a more sophisticated algorithm that preserves detail and produces sharper results compared to bilinear scaling, which is faster but produces softer images.'
    }
  ]
};
