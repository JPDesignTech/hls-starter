import { type Lesson } from '@/lib/tutorial/types';

export const noiseReduction: Lesson = {
  id: 'noise-reduction',
  title: 'Noise Reduction',
  module: 'Advanced Filters',
  duration: 25,
  unlockAfter: 'sharpening',
  content: [
    {
      type: 'introduction',
      heading: 'What This Lesson Covers',
      content: 'Reducing grain/noise in video. Improves clarity in low-light or noisy footage.'
    },
    {
      type: 'bullets',
      heading: 'Why It Matters',
      content: 'Noise reduction enables:',
      bullets: [
        'Cleaning up low-light footage',
        'Removing digital noise and grain',
        'Improving video clarity',
        'Professional post-production workflows'
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i noisy.mp4 -vf "hqdn3d=4.0:3.0:6.0:4.5" denoised.mp4',
      explanation: 'High-quality 3D denoise filter. Parameters: luma_spatial, chroma_spatial, luma_temporal, chroma_temporal. Higher values = stronger denoising but softer look.',
      flagBreakdown: [
        {
          flag: 'hqdn3d=4.0:3.0:6.0:4.5',
          description: 'High-quality 3D denoise: luma_spatial:chroma_spatial:luma_temporal:chroma_temporal'
        },
        {
          flag: '4.0',
          description: 'Luma spatial strength (spatial noise reduction)'
        },
        {
          flag: '3.0',
          description: 'Chroma spatial strength'
        },
        {
          flag: '6.0',
          description: 'Luma temporal strength (temporal noise reduction)'
        },
        {
          flag: '4.5',
          description: 'Chroma temporal strength'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i noisy.mp4 -vf "nlmeans=s=3.0:p=7:pc=0" denoised.mp4',
      explanation: 'Non-local means denoising. More advanced algorithm, better quality but slower. Good for heavy noise.',
      flagBreakdown: [
        {
          flag: 'nlmeans=s=3.0',
          description: 'Non-local means denoise with strength 3.0'
        },
        {
          flag: 'p=7',
          description: 'Patch size (larger = better quality, slower)'
        },
        {
          flag: 'pc=0',
          description: 'Patch comparison method (0 = default)'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i noisy.mp4 -vf "hqdn3d=2.0:1.5:3.0:2.0" denoised.mp4',
      explanation: 'Light denoising for subtle noise. Lower values preserve more detail while still reducing noise.',
      flagBreakdown: [
        {
          flag: '2.0:1.5:3.0:2.0',
          description: 'Light denoising settings (lower values)'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Denoise Filter Options',
      content: 'Common denoise filters:',
      bullets: [
        'hqdn3d: High-quality 3D denoise - good balance of quality and speed',
        'nlmeans: Non-local means - best quality but slower',
        'owdenoise: Overcomplete wavelet denoise - alternative method',
        'Higher strength = more denoising but softer look',
        'Temporal denoising uses multiple frames for better results',
        'Start with lower values and increase if needed'
      ]
    },
    {
      type: 'preview',
      heading: 'Try It: Noise Reduction',
      content: 'See how noise reduction cleans up grainy footage',
      code: 'ffmpeg -i sample.mp4 -vf "hqdn3d=4.0:3.0:6.0:4.5" output.mp4',
      explanation: 'This applies moderate denoising to reduce noise while preserving detail',
      previewType: 'filter',
      sampleVideoId: 'sample-advanced-077'
    },
    {
      type: 'challenge',
      title: 'Apply Light Denoising',
      description: 'Create a command that applies light denoising to preserve detail',
      requirements: [
        'Use hqdn3d filter',
        'Use low strength values (2.0 or less)',
        'Preserve detail while reducing noise'
      ],
      hints: [
        'Lower values = lighter denoising',
        'Start with 2.0 for luma spatial',
        'Use similar or lower values for other parameters'
      ],
      solution: 'ffmpeg -i noisy.mp4 -vf "hqdn3d=2.0:1.5:3.0:2.0" denoised.mp4',
      validation: {
        type: 'contains',
        value: 'hqdn3d=2.0'
      }
    },
    {
      type: 'quiz',
      question: 'What is the trade-off when using higher denoising strength?',
      options: [
        { id: 'a', text: 'Faster processing', correct: false },
        { id: 'b', text: 'Softer look with less detail', correct: true },
        { id: 'c', text: 'Smaller file size', correct: false },
        { id: 'd', text: 'More noise', correct: false }
      ],
      explanation: 'Higher denoising strength removes more noise but also softens the image and reduces detail. It\'s important to find a balance between noise reduction and detail preservation.'
    }
  ]
};
