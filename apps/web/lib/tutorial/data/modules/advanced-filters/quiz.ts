import { type ModuleQuiz } from '@/lib/tutorial/types/module-quiz';

export const advancedFiltersQuiz: ModuleQuiz = {
  id: 'advanced-filters-quiz',
  moduleId: 'advanced-filters',
  title: 'Advanced Filters Mastery Quiz',
  description: 'Test your understanding of advanced video filtering techniques including color grading, blur effects, sharpening, scaling algorithms, deinterlacing, and noise reduction.',
  passingScore: 70,
  questions: [
    // Multiple-choice questions from lessons
    {
      type: 'multiple-choice',
      id: 'mc-1',
      question: 'What does saturation=0.5 do in the eq filter?',
      options: [
        { id: 'a', text: 'Doubles the color intensity', correct: false },
        { id: 'b', text: 'Reduces color intensity by 50%', correct: true },
        { id: 'c', text: 'Inverts colors', correct: false },
        { id: 'd', text: 'Converts to grayscale', correct: false }
      ],
      explanation: 'saturation=0.5 reduces color intensity by 50%, creating a more muted, desaturated look. saturation=0.0 would be grayscale, and saturation=1.0 is normal.',
      weight: 1,
      source: 'color-grading'
    },
    {
      type: 'multiple-choice',
      id: 'mc-2',
      question: 'What is the main advantage of smartblur over gblur?',
      options: [
        { id: 'a', text: 'Faster processing', correct: false },
        { id: 'b', text: 'Preserves edges while blurring', correct: true },
        { id: 'c', text: 'Stronger blur effect', correct: false },
        { id: 'd', text: 'Smaller file size', correct: false }
      ],
      explanation: 'smartblur is an edge-preserving blur that maintains detail and edges while blurring other areas. This is useful for noise reduction without losing important details, unlike gblur which blurs everything uniformly.',
      weight: 1,
      source: 'blur-effects'
    },
    {
      type: 'multiple-choice',
      id: 'mc-3',
      question: 'What happens if you apply too much sharpening?',
      options: [
        { id: 'a', text: 'Video becomes blurrier', correct: false },
        { id: 'b', text: 'Noise and artifacts may increase', correct: true },
        { id: 'c', text: 'File size decreases', correct: false },
        { id: 'd', text: 'Colors become more vibrant', correct: false }
      ],
      explanation: 'Excessive sharpening can increase noise and create halos or artifacts around edges. It\'s best to use moderate sharpening and combine with noise reduction if needed.',
      weight: 1,
      source: 'sharpening'
    },
    {
      type: 'multiple-choice',
      id: 'mc-4',
      question: 'What is the main advantage of Lanczos scaling over bilinear?',
      options: [
        { id: 'a', text: 'Faster processing', correct: false },
        { id: 'b', text: 'Sharper results with better detail preservation', correct: true },
        { id: 'c', text: 'Smaller file size', correct: false },
        { id: 'd', text: 'Better color accuracy', correct: false }
      ],
      explanation: 'Lanczos scaling uses a more sophisticated algorithm that preserves detail and produces sharper results compared to bilinear scaling, which is faster but produces softer images.',
      weight: 1,
      source: 'advanced-scaling-options'
    },
    {
      type: 'multiple-choice',
      id: 'mc-5',
      question: 'What is the main purpose of deinterlacing?',
      options: [
        { id: 'a', text: 'Increase frame rate', correct: false },
        { id: 'b', text: 'Convert interlaced to progressive frames', correct: true },
        { id: 'c', text: 'Reduce file size', correct: false },
        { id: 'd', text: 'Add color grading', correct: false }
      ],
      explanation: 'Deinterlacing converts interlaced video (where each frame is split into two fields) into progressive frames (complete frames). This is necessary for modern displays and web playback, and removes comb artifacts.',
      weight: 1,
      source: 'deinterlacing'
    },
    {
      type: 'multiple-choice',
      id: 'mc-6',
      question: 'What is the trade-off when using higher denoising strength?',
      options: [
        { id: 'a', text: 'Faster processing', correct: false },
        { id: 'b', text: 'Softer look with less detail', correct: true },
        { id: 'c', text: 'Smaller file size', correct: false },
        { id: 'd', text: 'More noise', correct: false }
      ],
      explanation: 'Higher denoising strength removes more noise but also softens the image and reduces detail. It\'s important to find a balance between noise reduction and detail preservation.',
      weight: 1,
      source: 'noise-reduction'
    },
    // Command-builder questions
    {
      type: 'command-builder',
      id: 'cb-1',
      title: 'Apply Color Grading',
      description: 'Write an FFmpeg command to apply color grading to input.mp4: increase contrast by 20%, add brightness of 0.05, and increase saturation by 30%.',
      requirements: [
        'Use ffmpeg command',
        'Use -vf flag with eq filter',
        'Set contrast=1.2',
        'Set brightness=0.05',
        'Set saturation=1.3',
        'Output file is output.mp4'
      ],
      hints: [
        'Use eq filter for color adjustments',
        'contrast=1.2 increases contrast by 20%',
        'brightness=0.05 adds slight brightness',
        'saturation=1.3 increases saturation by 30%',
        'Combine parameters with colons'
      ],
      solution: 'ffmpeg -i input.mp4 -vf "eq=contrast=1.2:brightness=0.05:saturation=1.3" output.mp4',
      validation: {
        type: 'contains',
        value: 'contrast=1.2:brightness=0.05:saturation=1.3'
      },
      weight: 2,
      explanation: 'The eq filter allows you to adjust multiple color properties simultaneously. contrast=1.2 increases contrast, brightness=0.05 adds brightness, and saturation=1.3 makes colors more vibrant.',
      sampleVideoId: 'sample-1',
      previewType: 'filter'
    },
    {
      type: 'command-builder',
      id: 'cb-2',
      title: 'Apply Gaussian Blur',
      description: 'Write an FFmpeg command to apply Gaussian blur with sigma=10 to input.mp4.',
      requirements: [
        'Use ffmpeg command',
        'Use -vf flag with gblur filter',
        'Set sigma=10',
        'Output file is output.mp4'
      ],
      hints: [
        'Use gblur filter for Gaussian blur',
        'sigma controls blur strength',
        'sigma=10 creates moderate blur',
        'Higher sigma = stronger blur'
      ],
      solution: 'ffmpeg -i input.mp4 -vf "gblur=sigma=10" output.mp4',
      validation: {
        type: 'contains',
        value: 'gblur=sigma=10'
      },
      weight: 2,
      explanation: 'Gaussian blur (gblur) provides smooth, natural-looking blur. The sigma parameter controls the blur strength - higher values create stronger blur effects.',
      sampleVideoId: 'sample-1',
      previewType: 'filter'
    },
    {
      type: 'command-builder',
      id: 'cb-3',
      title: 'Apply Sharpening',
      description: 'Write an FFmpeg command to apply unsharp mask sharpening to input.mp4 with 5×5 matrix and luma strength of 1.0.',
      requirements: [
        'Use ffmpeg command',
        'Use -vf flag with unsharp filter',
        'Set matrix size to 5:5',
        'Set luma strength to 1.0',
        'Disable chroma sharpening (0.0)',
        'Output file is output.mp4'
      ],
      hints: [
        'Use unsharp filter for sharpening',
        'Format: unsharp=luma_w:luma_h:luma_amount:chroma_w:chroma_h:chroma_amount',
        '5:5 creates a 5×5 matrix',
        '1.0 is moderate sharpening strength',
        '0.0 disables chroma sharpening'
      ],
      solution: 'ffmpeg -i input.mp4 -vf "unsharp=5:5:1.0:5:5:0.0" output.mp4',
      validation: {
        type: 'contains',
        value: 'unsharp=5:5:1.0'
      },
      weight: 2,
      explanation: 'The unsharp mask filter enhances edge detail to make video appear sharper. The 5×5 matrix size provides good sharpening, and disabling chroma sharpening (0.0) avoids color artifacts.',
      sampleVideoId: 'sample-1',
      previewType: 'filter'
    },
    {
      type: 'command-builder',
      id: 'cb-4',
      title: 'Scale with Lanczos',
      description: 'Write an FFmpeg command to scale input.mp4 to 1920x1080 using Lanczos scaling algorithm.',
      requirements: [
        'Use ffmpeg command',
        'Use -vf flag with scale filter',
        'Set resolution to 1920:1080',
        'Use flags=lanczos',
        'Output file is output.mp4'
      ],
      hints: [
        'Use scale filter for resizing',
        '1920:1080 is Full HD resolution',
        'flags=lanczos enables Lanczos scaling',
        'Lanczos provides highest quality scaling'
      ],
      solution: 'ffmpeg -i input.mp4 -vf "scale=1920:1080:flags=lanczos" output.mp4',
      validation: {
        type: 'contains',
        value: 'flags=lanczos'
      },
      weight: 2,
      explanation: 'Lanczos scaling provides the highest quality scaling results, preserving detail better than default bilinear scaling. It\'s the recommended algorithm for professional video processing.',
      sampleVideoId: 'sample-1',
      previewType: 'filter'
    },
    {
      type: 'command-builder',
      id: 'cb-5',
      title: 'Apply Noise Reduction',
      description: 'Write an FFmpeg command to apply light noise reduction to input.mp4 using hqdn3d filter with luma spatial strength of 2.0.',
      requirements: [
        'Use ffmpeg command',
        'Use -vf flag with hqdn3d filter',
        'Set luma spatial strength to 2.0',
        'Output file is output.mp4'
      ],
      hints: [
        'Use hqdn3d filter for denoising',
        'Format: hqdn3d=luma_spatial:chroma_spatial:luma_temporal:chroma_temporal',
        '2.0 is a light denoising value',
        'Lower values preserve more detail'
      ],
      solution: 'ffmpeg -i input.mp4 -vf "hqdn3d=2.0:1.5:3.0:2.0" denoised.mp4',
      validation: {
        type: 'contains',
        value: 'hqdn3d=2.0'
      },
      weight: 2,
      explanation: 'The hqdn3d filter provides high-quality 3D denoising. Lower strength values (like 2.0) provide light denoising that preserves detail while reducing noise. Higher values remove more noise but soften the image.',
      sampleVideoId: 'sample-1',
      previewType: 'filter'
    }
  ]
};
