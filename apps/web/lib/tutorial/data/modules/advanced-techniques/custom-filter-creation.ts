import { Lesson } from '@/lib/tutorial/types';

export const customFilterCreation: Lesson = {
  id: 'custom-filter-creation',
  title: 'Custom Filter Creation',
  module: 'Advanced Techniques',
  duration: 30,
  unlockAfter: 'advanced-video-filtering',
  content: [
    {
      type: 'introduction',
      heading: 'What This Lesson Covers',
      content: 'Writing or defining custom filter graphs and using advanced expression syntax. When static filters aren\'t enough, you want dynamic parameters driven by time (t) or frame number (n), with behavior that changes over time.'
    },
    {
      type: 'bullets',
      heading: 'Why It Matters',
      content: 'Custom filter creation enables:',
      bullets: [
        'Dynamic parameters that change over time',
        'Time-based effects and animations',
        'Frame-number-based behavior',
        'Complex expressions for advanced control',
        'Custom workflows not possible with static filters'
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "drawtext=text=\'Moving\':x=\'(w-text_w)*(t/5)\':y=50:fontsize=24:fontcolor=white" output.mp4',
      explanation: 'Text moves smoothly from left to right over 5 seconds. Expression (w-text_w)*(t/5) calculates x position based on time.',
      flagBreakdown: [
        {
          flag: 'text=\'Moving\'',
          description: 'Text content to display'
        },
        {
          flag: 'x=\'(w-text_w)*(t/5)\'',
          description: 'X position: moves from 0 to (width-text_width) over 5 seconds'
        },
        {
          flag: 'y=50',
          description: 'Y position fixed at 50 pixels'
        },
        {
          flag: 't',
          description: 'Time variable (seconds) in expressions'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "drawtext=text=\'Frame %{n}\':x=10:y=10:fontsize=20:fontcolor=white" output.mp4',
      explanation: 'Display frame number dynamically. %{n} is replaced with current frame number, updating each frame.',
      flagBreakdown: [
        {
          flag: 'text=\'Frame %{n}\'',
          description: 'Text with frame number variable %{n}'
        },
        {
          flag: '%{n}',
          description: 'Frame number variable (0, 1, 2, ...)'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "overlay=x=\'if(gte(t,2),W-w-10,10)\':y=10" output.mp4',
      explanation: 'Conditional overlay position: stays at left (x=10) for first 2 seconds, then moves to right (x=W-w-10) after 2 seconds.',
      flagBreakdown: [
        {
          flag: 'x=\'if(gte(t,2),W-w-10,10)\'',
          description: 'Conditional: if time >= 2s, use right position, else left position'
        },
        {
          flag: 'if(condition, true_value, false_value)',
          description: 'Conditional expression syntax'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "scale=w=\'if(gt(iw,1920),1920,iw)\':h=\'if(gt(ih,1080),1080,ih)\'" output.mp4',
      explanation: 'Conditional scaling: only scale if dimensions exceed 1920×1080, otherwise keep original size.',
      flagBreakdown: [
        {
          flag: 'w=\'if(gt(iw,1920),1920,iw)\'',
          description: 'Width: if input width > 1920, use 1920, else use input width'
        },
        {
          flag: 'gt(a,b)',
          description: 'Greater than comparison: returns 1 if a > b, else 0'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Expression Variables',
      content: 'Common variables in filter expressions:',
      bullets: [
        't: Current time in seconds',
        'n: Current frame number (starting from 0)',
        'w, h: Output width and height',
        'iw, ih: Input width and height',
        'W, H: Main video width and height',
        'X, Y: Position coordinates',
        'PI: Mathematical constant π'
      ]
    },
    {
      type: 'bullets',
      heading: 'Expression Functions',
      content: 'Useful expression functions:',
      bullets: [
        'if(condition, true, false): Conditional logic',
        'gte(a,b): Greater than or equal (returns 1 or 0)',
        'gt(a,b): Greater than',
        'lte(a,b): Less than or equal',
        'sin(x), cos(x): Trigonometric functions',
        'min(a,b), max(a,b): Minimum/maximum',
        'abs(x): Absolute value'
      ]
    },
    {
      type: 'preview',
      heading: 'Try It: Custom Filter Creation',
      content: 'See how custom expressions create dynamic, time-based effects',
      code: 'ffmpeg -i sample.mp4 -vf "drawtext=text=\'Moving Text\':x=\'(w-text_w)*(t/5)\':y=50:fontsize=24:fontcolor=white" output.mp4',
      explanation: 'This demonstrates custom filter expressions: text moves across screen over time. Custom expressions enable dynamic, animated effects.',
      previewType: 'filter',
      sampleVideoId: 'sample-advanced-094'
    },
    {
      type: 'challenge',
      title: 'Create Pulsing Text',
      description: 'Create a command that makes text pulse (grow/shrink) using expressions',
      requirements: [
        'Use drawtext filter',
        'Make fontsize change over time',
        'Use sin() function for smooth pulsing',
        'Text should pulse continuously'
      ],
      hints: [
        'sin() creates smooth oscillation',
        'fontsize expression: base_size + amplitude * sin(frequency * t)',
        'Try: fontsize=\'30+10*sin(2*PI*t)\''
      ],
      solution: 'ffmpeg -i input.mp4 -vf "drawtext=text=\'Pulsing\':x=10:y=10:fontsize=\'30+10*sin(2*PI*t)\':fontcolor=white" output.mp4',
      validation: {
        type: 'contains',
        value: 'sin'
      }
    },
    {
      type: 'quiz',
      question: 'What does the variable "t" represent in filter expressions?',
      options: [
        { id: 'a', text: 'Frame number', correct: false },
        { id: 'b', text: 'Current time in seconds', correct: true },
        { id: 'c', text: 'Text content', correct: false },
        { id: 'd', text: 'Total duration', correct: false }
      ],
      explanation: 'The variable "t" represents the current time in seconds. It starts at 0 and increases continuously, allowing you to create time-based animations and effects. Use "n" for frame number instead.'
    }
  ]
};
