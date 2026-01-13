import { type Lesson } from '@/lib/tutorial/types';

export const deinterlacing: Lesson = {
  id: 'deinterlacing',
  title: 'Deinterlacing',
  module: 'Advanced Filters',
  duration: 20,
  unlockAfter: 'noise-reduction',
  content: [
    {
      type: 'introduction',
      heading: 'What This Lesson Covers',
      content: 'Converting interlaced footage (TV/camcorder) into progressive frames. Required for web, social, and modern displays.'
    },
    {
      type: 'bullets',
      heading: 'Why It Matters',
      content: 'Deinterlacing enables:',
      bullets: [
        'Converting old TV/camcorder footage for modern use',
        'Preparing video for web and social media',
        'Eliminating comb artifacts',
        'Compatibility with modern displays and players'
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i interlaced.mp4 -vf "yadif" deinterlaced.mp4',
      explanation: 'YADIF (Yet Another Deinterlacing Filter) - most common deinterlacing filter. Good quality and performance balance.',
      flagBreakdown: [
        {
          flag: 'yadif',
          description: 'YADIF deinterlacing filter (default mode)'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i interlaced.mp4 -vf "yadif=1" deinterlaced.mp4',
      explanation: 'YADIF with mode=1 (spatial check only). Faster but may miss some motion. Use when performance is critical.',
      flagBreakdown: [
        {
          flag: 'yadif=1',
          description: 'YADIF mode 1: spatial check only (faster)'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i interlaced.mp4 -vf "yadif=0:-1:0" deinterlaced.mp4',
      explanation: 'YADIF with full parameters: mode=0 (spatial+temporal), parity=-1 (auto-detect), deint=0 (deinterlace all frames).',
      flagBreakdown: [
        {
          flag: 'mode=0',
          description: 'Spatial and temporal check (best quality)'
        },
        {
          flag: 'parity=-1',
          description: 'Auto-detect field parity'
        },
        {
          flag: 'deint=0',
          description: 'Deinterlace all frames'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i interlaced.mp4 -vf "w3fdif" deinterlaced.mp4',
      explanation: 'W3FDIF (Weston 3 Field Deinterlacing Filter) - alternative method, sometimes better for certain content.',
      flagBreakdown: [
        {
          flag: 'w3fdif',
          description: 'Weston 3 Field Deinterlacing Filter'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Deinterlacing Filters',
      content: 'Available deinterlacing options:',
      bullets: [
        'yadif: Most common, good quality and performance',
        'w3fdif: Alternative method, sometimes better results',
        'nnedi: Neural network-based, highest quality but slowest',
        'Quality varies by use case and source material',
        'YADIF is the default choice for most scenarios',
        'Modern footage is usually progressive, deinterlacing mainly for legacy content'
      ]
    },
    {
      type: 'preview',
      heading: 'Try It: Deinterlacing',
      content: 'See how deinterlacing removes comb artifacts from interlaced video',
      code: 'ffmpeg -i sample.mp4 -vf "yadif" output.mp4',
      explanation: 'This converts interlaced video to progressive format, removing comb artifacts',
      previewType: 'filter',
      sampleVideoId: 'sample-advanced-078'
    },
    {
      type: 'challenge',
      title: 'Deinterlace with Best Quality',
      description: 'Create a command that uses YADIF with spatial and temporal checking',
      requirements: [
        'Use yadif filter',
        'Set mode to 0 (spatial+temporal)',
        'Auto-detect parity'
      ],
      hints: [
        'mode=0 enables both spatial and temporal checks',
        'parity=-1 auto-detects field order',
        'Full parameter format: yadif=mode:parity:deint'
      ],
      solution: 'ffmpeg -i interlaced.mp4 -vf "yadif=0:-1:0" deinterlaced.mp4',
      validation: {
        type: 'contains',
        value: 'yadif=0'
      }
    },
    {
      type: 'quiz',
      question: 'What is the main purpose of deinterlacing?',
      options: [
        { id: 'a', text: 'Increase frame rate', correct: false },
        { id: 'b', text: 'Convert interlaced to progressive frames', correct: true },
        { id: 'c', text: 'Reduce file size', correct: false },
        { id: 'd', text: 'Add color grading', correct: false }
      ],
      explanation: 'Deinterlacing converts interlaced video (where each frame is split into two fields) into progressive frames (complete frames). This is necessary for modern displays and web playback, and removes comb artifacts.'
    }
  ]
};
