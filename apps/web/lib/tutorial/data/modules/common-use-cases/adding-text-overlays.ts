import { Lesson } from '@/lib/tutorial/types';

export const addingTextOverlays: Lesson = {
  id: 'adding-text-overlays',
  title: 'Adding Text Overlays',
  module: 'Common Use Cases',
  duration: 20,
  unlockAfter: 'creating-square-portrait-videos',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Adding titles, captions, and labels to videos is essential for branding, information display, and accessibility. FFmpeg\'s drawtext filter provides powerful text overlay capabilities with extensive customization options.'
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "drawtext=text=\'Hello World\':x=50:y=50" output.mp4',
      explanation: 'Basic text overlay. Adds "Hello World" at coordinates (50, 50) - 50 pixels from left and top.',
      flagBreakdown: [
        {
          flag: '-vf "drawtext=text=\'Hello World\':x=50:y=50"',
          description: 'Video filter: draw text "Hello World" at position (50, 50)'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "drawtext=fontfile=font.ttf:text=\'Title\':fontsize=48:fontcolor=white:x=50:y=50" output.mp4',
      explanation: 'Styled text overlay. Uses custom font file, larger size, and white color.',
      flagBreakdown: [
        {
          flag: 'fontfile=font.ttf',
          description: 'Path to TrueType font file'
        },
        {
          flag: 'fontsize=48',
          description: 'Set font size to 48 pixels'
        },
        {
          flag: 'fontcolor=white',
          description: 'Set text color to white'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "drawtext=text=\'Title\':fontsize=36:fontcolor=white:x=(w-text_w)/2:y=50" output.mp4',
      explanation: 'Centered text overlay. Uses expressions to center text horizontally.',
      flagBreakdown: [
        {
          flag: 'x=(w-text_w)/2',
          description: 'Center horizontally: (video width - text width) / 2'
        },
        {
          flag: 'y=50',
          description: 'Position 50 pixels from top'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "drawtext=text=\'%{pts\\:hms}\':fontsize=24:fontcolor=white:x=10:y=h-th-10" output.mp4',
      explanation: 'Dynamic text with timestamp. Shows elapsed time, positioned at bottom-left.',
      flagBreakdown: [
        {
          flag: 'text=\'%{pts\\:hms}\'',
          description: 'Dynamic text: elapsed time (HH:MM:SS)'
        },
        {
          flag: 'y=h-th-10',
          description: 'Position at bottom: video height - text height - 10px margin'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Text Overlay Options',
      content: 'Common drawtext parameters:',
      bullets: [
        'text: Text content to display',
        'fontfile: Path to font file (requires libfreetype)',
        'fontsize: Font size in pixels',
        'fontcolor: Text color (white, black, #FFFFFF, etc.)',
        'x, y: Position coordinates',
        'box: Add background box (box=1)',
        'boxcolor: Background box color'
      ]
    },
    {
      type: 'bullets',
      heading: 'Positioning Expressions',
      content: 'Useful positioning expressions:',
      bullets: [
        'x=(w-text_w)/2: Center horizontally',
        'y=(h-text_h)/2: Center vertically',
        'x=10:y=10: Top-left corner',
        'x=w-text_w-10:y=h-th-10: Bottom-right corner',
        'Supports dynamic values and calculations'
      ]
    },
    {
      type: 'bullets',
      heading: 'Requirements',
      content: 'Important notes:',
      bullets: [
        'Requires FFmpeg compiled with libfreetype for custom fonts',
        'System fonts available without libfreetype',
        'Supports animations via expressions',
        'Can combine multiple drawtext filters',
        'Great for titles, captions, watermarks, and timestamps'
      ]
    },
    {
      type: 'challenge',
      title: 'Add Centered Text',
      description: 'Add centered text overlay "My Video" with white color and font size 36',
      requirements: [
        'Use drawtext filter',
        'Center text horizontally',
        'Set font color to white',
        'Set font size to 36'
      ],
      hints: [
        'Use x=(w-text_w)/2 for centering',
        'Set fontcolor=white',
        'Set fontsize=36',
        'Text: "My Video"'
      ],
      solution: 'ffmpeg -i input.mp4 -vf "drawtext=text=\'My Video\':fontsize=36:fontcolor=white:x=(w-text_w)/2:y=50" output.mp4',
      validation: {
        type: 'contains',
        value: 'drawtext'
      }
    },
    {
      type: 'quiz',
      question: 'What is required for custom fonts in drawtext?',
      options: [
        { id: 'a', text: 'Nothing special', correct: false },
        { id: 'b', text: 'FFmpeg compiled with libfreetype', correct: true },
        { id: 'c', text: 'Special video format', correct: false },
        { id: 'd', text: 'Custom FFmpeg build', correct: false }
      ],
      explanation: 'Using custom fonts with the fontfile parameter requires FFmpeg to be compiled with libfreetype support. System fonts may work without libfreetype, but custom font files require this library.'
    }
  ]
};
