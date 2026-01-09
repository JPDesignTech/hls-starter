import { Lesson } from '@/lib/tutorial/types';

export const histogramAnalysis: Lesson = {
  id: 'histogram-analysis',
  title: 'Histogram Analysis',
  module: 'Advanced Filters',
  duration: 20,
  unlockAfter: 'advanced-scaling-options',
  content: [
    {
      type: 'introduction',
      heading: 'What This Lesson Covers',
      content: 'Visualizing color/brightness distribution. Used for exposure analysis, color correction, broadcast validation.'
    },
    {
      type: 'bullets',
      heading: 'Why It Matters',
      content: 'Histogram analysis enables:',
      bullets: [
        'Exposure analysis and correction',
        'Color distribution visualization',
        'Broadcast compliance checking',
        'QA tools and visual feedback'
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "histogram" -frames:v 1 histogram.png',
      explanation: 'Generate a histogram image from the first frame. Creates a visual representation of color and brightness distribution.',
      flagBreakdown: [
        {
          flag: 'histogram',
          description: 'Generate histogram visualization'
        },
        {
          flag: '-frames:v 1',
          description: 'Process only 1 video frame'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "histogram=display_mode=2" -frames:v 1 histogram.png',
      explanation: 'Histogram with display mode 2 (overlay on video). Shows histogram overlaid on the frame for context.',
      flagBreakdown: [
        {
          flag: 'display_mode=2',
          description: 'Overlay histogram on video frame'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "histogram=level_height=200" -frames:v 1 histogram.png',
      explanation: 'Customize histogram height. level_height controls the height of the histogram bars.',
      flagBreakdown: [
        {
          flag: 'level_height=200',
          description: 'Set histogram bar height to 200 pixels'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "histogram=scale=2" -frames:v 1 histogram.png',
      explanation: 'Scale histogram for better visibility. scale parameter increases histogram size.',
      flagBreakdown: [
        {
          flag: 'scale=2',
          description: 'Scale histogram by factor of 2'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Histogram Analysis Tips',
      content: 'Using histograms effectively:',
      bullets: [
        'Histogram shows distribution of brightness values',
        'Left side = shadows/dark areas',
        'Right side = highlights/bright areas',
        'Peaks indicate dominant brightness levels',
        'Good for exposure analysis and color correction',
        'Useful for QA tools and visual feedback in your app',
        'Can be generated per-frame or as overlay'
      ]
    },
    {
      type: 'challenge',
      title: 'Generate Histogram Overlay',
      description: 'Create a command that generates a histogram overlaid on the video frame',
      requirements: [
        'Use histogram filter',
        'Set display_mode to overlay',
        'Output as image file'
      ],
      hints: [
        'display_mode=2 creates overlay',
        'Use -frames:v 1 to process one frame',
        'Output to PNG format'
      ],
      solution: 'ffmpeg -i input.mp4 -vf "histogram=display_mode=2" -frames:v 1 histogram.png',
      validation: {
        type: 'contains',
        value: 'display_mode=2'
      }
    },
    {
      type: 'quiz',
      question: 'What does a histogram show in video analysis?',
      options: [
        { id: 'a', text: 'Frame rate information', correct: false },
        { id: 'b', text: 'Color and brightness distribution', correct: true },
        { id: 'c', text: 'File size', correct: false },
        { id: 'd', text: 'Audio levels', correct: false }
      ],
      explanation: 'A histogram visualizes the distribution of brightness and color values in a video frame. It shows how many pixels have each brightness level, which is useful for exposure analysis and color correction.'
    }
  ]
};
