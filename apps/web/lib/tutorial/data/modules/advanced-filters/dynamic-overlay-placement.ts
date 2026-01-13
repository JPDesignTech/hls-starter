import { type Lesson } from '@/lib/tutorial/types';

export const dynamicOverlayPlacement: Lesson = {
  id: 'dynamic-overlay-placement',
  title: 'Dynamic Overlay Placement',
  module: 'Advanced Filters',
  duration: 25,
  unlockAfter: 'adding-watermarks',
  content: [
    {
      type: 'introduction',
      heading: 'What This Lesson Covers',
      content: 'Placing an overlay (image/video) dynamically — e.g., moving position over time. Perfect for lower-thirds, animated logos, or UI elements that transition on/off screen.'
    },
    {
      type: 'bullets',
      heading: 'Why It Matters',
      content: 'Dynamic overlays enable:',
      bullets: [
        'Animated lower-thirds that slide in/out',
        'Moving logos or watermarks',
        'UI elements that transition on/off screen',
        'Motion graphics without a full video editor'
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i video.mp4 -i logo.png -filter_complex "[1:v]scale=100:-1[logo]; [0:v][logo]overlay=x=\'if(gte(t,2),(W-w)/2,(W-w)/t)\':y=10" output.mp4',
      explanation: 'The overlay\'s x value changes over time (t), moving when t > 2s. The filter uses an expression to control position dynamically.',
      flagBreakdown: [
        {
          flag: '[1:v]scale=100:-1[logo]',
          description: 'Scale logo to 100px width, maintain aspect ratio'
        },
        {
          flag: 'overlay=x=\'if(gte(t,2),(W-w)/2,(W-w)/t)\':y=10',
          description: 'Dynamic x position: if time >= 2s, center horizontally; otherwise move based on time. y fixed at 10px from top'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i video.mp4 -i logo.png -filter_complex "[1:v]scale=150:-1[logo]; [0:v][logo]overlay=x=\'W-w-10-t*50\':y=\'H-h-10\'" output.mp4',
      explanation: 'Logo moves horizontally from right to left over time. x decreases by 50 pixels per second, creating a sliding effect.',
      flagBreakdown: [
        {
          flag: 'x=\'W-w-10-t*50\'',
          description: 'X position starts at right edge minus 10px, decreases by 50px per second'
        },
        {
          flag: 'y=\'H-h-10\'',
          description: 'Y position fixed at bottom minus 10px'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Overlay Expression Variables',
      content: 'Key variables you can use in overlay expressions:',
      bullets: [
        't: Current time in seconds',
        'W, H: Base video width and height',
        'w, h: Overlay width and height',
        'n: Current frame number',
        'if(condition, true_value, false_value): Conditional expressions'
      ]
    },
    {
      type: 'preview',
      heading: 'Try It: Dynamic Overlay',
      content: 'Watch a logo move dynamically across the video over time',
      code: 'ffmpeg -i sample.mp4 -i logo.png -filter_complex "[1:v]scale=100:-1[logo]; [0:v][logo]overlay=x=\'if(gte(t,2),(W-w)/2,(W-w)/t)\':y=10" output.mp4',
      explanation: 'This demonstrates a logo that moves horizontally, centering after 2 seconds',
      previewType: 'filter',
      sampleVideoId: 'sample-advanced-071'
    },
    {
      type: 'challenge',
      title: 'Create Sliding Overlay',
      description: 'Create a command that slides an overlay from left to right over 5 seconds',
      requirements: [
        'Use overlay filter with dynamic x position',
        'Overlay should start at x=0 and move to x=W-w',
        'Movement should complete in 5 seconds'
      ],
      hints: [
        'Use t (time) in your expression',
        'x position formula: t/5*(W-w) will move from 0 to W-w over 5 seconds',
        'Remember to scale the overlay first'
      ],
      solution: 'ffmpeg -i video.mp4 -i logo.png -filter_complex "[1:v]scale=100:-1[logo]; [0:v][logo]overlay=x=\'t/5*(W-w)\':y=10" output.mp4',
      validation: {
        type: 'contains',
        value: 'overlay=x='
      }
    },
    {
      type: 'quiz',
      question: 'What does the expression W-w-10 calculate in an overlay filter?',
      options: [
        { id: 'a', text: 'Position 10 pixels from the left edge', correct: false },
        { id: 'b', text: 'Position 10 pixels from the right edge', correct: true },
        { id: 'c', text: 'Position 10 pixels from the top', correct: false },
        { id: 'd', text: 'Position 10 pixels from the bottom', correct: false }
      ],
      explanation: 'W-w-10 calculates the x position 10 pixels from the right edge. W is the video width, w is the overlay width, so W-w is the right edge, and subtracting 10 gives 10px margin.'
    }
  ]
};
