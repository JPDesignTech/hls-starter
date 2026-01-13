import { Lesson } from '@/lib/tutorial/types';

export const preProcessingOptimization: Lesson = {
  id: 'pre-processing-optimization',
  title: 'Pre-processing Optimization',
  module: 'Optimization & Performance',
  duration: 25,
  unlockAfter: 'encoding-speed-vs-quality',
  content: [
    {
      type: 'introduction',
      heading: 'What This Lesson Covers',
      content: 'Preparing video before encoding to maximize compression efficiency. Pre-processing techniques like resizing, cropping, and denoising improve codec efficiency and reduce file sizes.'
    },
    {
      type: 'bullets',
      heading: 'Why It Matters',
      content: 'Pre-processing optimization enables:',
      bullets: [
        'Better compression efficiency',
        'Reduced file sizes',
        'Faster encoding',
        'Improved codec performance',
        'Removal of unnecessary pixels before encoding'
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "scale=1280:720" optimized.mp4',
      explanation: 'Resize to target resolution before encoding. Removing unnecessary pixels improves compression efficiency and reduces file size.',
      flagBreakdown: [
        {
          flag: 'scale=1280:720',
          description: 'Resize to 1280×720 (HD) resolution'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "crop=1920:1080:0:0" optimized.mp4',
      explanation: 'Crop to remove unused pixels (Area of Interest). Cropping removes black bars or unwanted areas, reducing pixels to encode.',
      flagBreakdown: [
        {
          flag: 'crop=1920:1080:0:0',
          description: 'Crop to 1920×1080 starting at (0,0) - removes unused areas'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "hqdn3d=4.0:3.0:6.0:4.5" optimized.mp4',
      explanation: 'Denoise before encoding. Removing noise improves compression efficiency as codecs struggle with random noise patterns.',
      flagBreakdown: [
        {
          flag: 'hqdn3d=4.0:3.0:6.0:4.5',
          description: 'High-quality 3D denoise filter (reduces noise before encoding)'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "scale=1280:720,hqdn3d=3.0:2.0:5.0:3.0" -c:v libx264 -crf 23 optimized.mp4',
      explanation: 'Combine multiple pre-processing steps. Resize and denoise before encoding for maximum compression efficiency.',
      flagBreakdown: [
        {
          flag: 'scale=1280:720,hqdn3d=3.0:2.0:5.0:3.0',
          description: 'Chain filters: resize then denoise (comma-separated)'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Pre-processing Techniques',
      content: 'Key optimization methods:',
      bullets: [
        'Resize to target resolution: Avoid encoding unnecessary large frames',
        'Crop/AOI: Remove unused pixels (black bars, unwanted areas)',
        'Denoise: Reduce noise before encoding (improves compression)',
        'Pre-processing reduces downstream encoding load',
        'Removing noise/unused pixels improves codec efficiency',
        'Combine multiple filters for best results'
      ]
    },
    {
      type: 'bullets',
      heading: 'Best Practices',
      content: 'Optimization tips:',
      bullets: [
        'Resize to target delivery resolution before encoding',
        'Crop black bars and unused areas',
        'Denoise noisy footage before encoding',
        'Pre-process once, encode multiple times',
        'Test different pre-processing combinations',
        'Balance pre-processing time vs encoding efficiency gains'
      ]
    },
    {
      type: 'preview',
      heading: 'Try It: Pre-processing Optimization',
      content: 'See how pre-processing improves compression efficiency and reduces file size',
      code: 'ffmpeg -i sample.mp4 -vf "scale=1280:720" -c:v libx264 -crf 23 output.mp4',
      explanation: 'This resizes the video to 1280×720 before encoding. Pre-processing reduces the number of pixels to encode, improving compression efficiency and reducing file size.',
      previewType: 'filter',
      sampleVideoId: 'sample-optimization-087'
    },
    {
      type: 'challenge',
      title: 'Combine Pre-processing Steps',
      description: 'Create a command that resizes and denoises before encoding',
      requirements: [
        'Resize to 1920×1080',
        'Apply denoising filter',
        'Use libx264 with CRF 23'
      ],
      hints: [
        'Chain filters with comma: scale=1920:1080,hqdn3d=...',
        'Use hqdn3d for denoising',
        'Apply filters before encoding codec'
      ],
      solution: 'ffmpeg -i input.mp4 -vf "scale=1920:1080,hqdn3d=4.0:3.0:6.0:4.5" -c:v libx264 -crf 23 output.mp4',
      validation: {
        type: 'contains',
        value: 'scale=1920:1080'
      }
    },
    {
      type: 'quiz',
      question: 'Why is pre-processing (resizing, denoising) beneficial before encoding?',
      options: [
        { id: 'a', text: 'It makes encoding faster only', correct: false },
        { id: 'b', text: 'It improves compression efficiency and reduces file size', correct: true },
        { id: 'c', text: 'It improves audio quality', correct: false },
        { id: 'd', text: 'It increases video resolution', correct: false }
      ],
      explanation: 'Pre-processing improves compression efficiency by removing unnecessary pixels (resize/crop) and reducing noise patterns that codecs struggle with. This results in smaller file sizes and better compression ratios.'
    }
  ]
};
