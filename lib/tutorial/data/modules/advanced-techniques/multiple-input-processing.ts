import { Lesson } from '@/lib/tutorial/types';

export const multipleInputProcessing: Lesson = {
  id: 'multiple-input-processing',
  title: 'Multiple Input Processing',
  module: 'Advanced Techniques',
  duration: 30,
  unlockAfter: 'complex-filter-graphs',
  content: [
    {
      type: 'introduction',
      heading: 'What This Lesson Covers',
      content: 'Handling several inputs (video/audio/images) and orchestrating them together. Essential for multi-angle editing, picture-in-picture, and audio mixing from external tracks.'
    },
    {
      type: 'bullets',
      heading: 'Why It Matters',
      content: 'Multiple input processing enables:',
      bullets: [
        'Multi-angle video editing',
        'Picture-in-picture effects',
        'Audio mixing from external tracks',
        'Complex compositing workflows',
        'Professional video production techniques'
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i left.mp4 -i right.mp4 -i music.mp3 -filter_complex "[0:v]scale=640:360[left]; [1:v]scale=640:360[right]; [left][right]hstack=inputs=2[vid]; [0:a][2:a]amix=inputs=2[a]" -map "[vid]" -map "[a]" output.mp4',
      explanation: 'Combines two videos horizontally and mixes external music track. Scales both videos, stacks them side-by-side, then mixes audio from first video with music track.',
      flagBreakdown: [
        {
          flag: '[0:v]scale=640:360[left]',
          description: 'Scale first video input to 640×360, label as [left]'
        },
        {
          flag: '[1:v]scale=640:360[right]',
          description: 'Scale second video input to 640×360, label as [right]'
        },
        {
          flag: '[left][right]hstack=inputs=2[vid]',
          description: 'Stack two video streams horizontally, label as [vid]'
        },
        {
          flag: '[0:a][2:a]amix=inputs=2[a]',
          description: 'Mix audio from input 0 and input 2 (music), label as [a]'
        },
        {
          flag: '-map "[vid]" -map "[a]"',
          description: 'Map the labeled video and audio streams to output'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i main.mp4 -i pip.mp4 -filter_complex "[1:v]scale=iw/4:ih/4[pip]; [0:v][pip]overlay=W-w-10:H-h-10" output.mp4',
      explanation: 'Picture-in-picture: Scale second video to 1/4 size, overlay on bottom-right of main video.',
      flagBreakdown: [
        {
          flag: '[1:v]scale=iw/4:ih/4[pip]',
          description: 'Scale second input to 1/4 size, label as [pip]'
        },
        {
          flag: '[0:v][pip]overlay=W-w-10:H-h-10',
          description: 'Overlay pip video at bottom-right (10px margin)'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i video1.mp4 -i video2.mp4 -i video3.mp4 -filter_complex "[0:v][1:v][2:v]hstack=inputs=3[v]" -map "[v]" -map 0:a output.mp4',
      explanation: 'Combine three videos side-by-side. Uses hstack with inputs=3 to stack all three video streams horizontally.',
      flagBreakdown: [
        {
          flag: '[0:v][1:v][2:v]hstack=inputs=3[v]',
          description: 'Stack three video inputs horizontally'
        },
        {
          flag: '-map 0:a',
          description: 'Map audio from first input'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Input Reference Guide',
      content: 'Understanding input references:',
      bullets: [
        '[0:v] = video from first input (-i)',
        '[1:a] = audio from second input',
        '[2:v] = video from third input',
        'Inputs are numbered starting from 0',
        'Use -map "[label]" to map labeled streams to output',
        'Multiple inputs enable complex multi-source workflows'
      ]
    },
    {
      type: 'bullets',
      heading: 'Common Multi-Input Patterns',
      content: 'Useful patterns:',
      bullets: [
        'Side-by-side: hstack for horizontal combination',
        'Stacked: vstack for vertical combination',
        'Picture-in-picture: overlay with scaled second input',
        'Audio mixing: amix to combine multiple audio tracks',
        'Multi-angle: switch or overlay for angle switching',
        'Green screen: chromakey with background input'
      ]
    },
    {
      type: 'preview',
      heading: 'Try It: Multiple Input Processing',
      content: 'See how multiple inputs are combined into a single output',
      code: 'ffmpeg -i sample1.mp4 -i sample2.mp4 -filter_complex "[0:v]scale=640:360[left]; [1:v]scale=640:360[right]; [left][right]hstack=inputs=2[vid]" -map "[vid]" -map 0:a output.mp4',
      explanation: 'This combines two video inputs side-by-side. Multiple inputs allow complex compositing and multi-source workflows.',
      previewType: 'filter',
      sampleVideoId: 'sample-advanced-091'
    },
    {
      type: 'challenge',
      title: 'Create Picture-in-Picture',
      description: 'Create a command that overlays a second video as picture-in-picture',
      requirements: [
        'Use two video inputs',
        'Scale second video to 1/3 size',
        'Overlay at top-right corner',
        'Map both video and audio'
      ],
      hints: [
        'Scale second input: [1:v]scale=iw/3:ih/3',
        'Overlay at top-right: overlay=W-w-10:10',
        'Use -map to include audio from main video'
      ],
      solution: 'ffmpeg -i main.mp4 -i pip.mp4 -filter_complex "[1:v]scale=iw/3:ih/3[pip]; [0:v][pip]overlay=W-w-10:10" -map "[v]" -map 0:a output.mp4',
      validation: {
        type: 'contains',
        value: 'overlay'
      }
    },
    {
      type: 'quiz',
      question: 'How do you reference the video stream from the second input file?',
      options: [
        { id: 'a', text: '[1:v]', correct: true },
        { id: 'b', text: '[2:v]', correct: false },
        { id: 'c', text: '[v:1]', correct: false },
        { id: 'd', text: '[input2:v]', correct: false }
      ],
      explanation: 'Inputs are numbered starting from 0. [1:v] refers to the video stream from the second input file (the second -i flag). [0:v] is the first input, [1:v] is the second, [2:v] is the third, and so on.'
    }
  ]
};
