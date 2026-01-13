import { Lesson } from '@/lib/tutorial/types';

export const pictureInPicture: Lesson = {
  id: 'picture-in-picture',
  title: 'Picture-in-Picture Effects',
  module: 'Video Processing',
  duration: 25,
  unlockAfter: 'video-concatenation',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Picture-in-Picture (PiP) means overlaying one video on another as a small inset. This is achieved with the overlay filter by taking two video inputs and positioning one on top of the other.'
    },
    {
      type: 'diagram',
      title: 'Picture-in-Picture Composition Flow',
      diagram: '',
      explanation: 'PiP composition process: Main video and overlay video are processed separately. The overlay is scaled down, then positioned and composited onto the main video using the overlay filter.',
      diagramType: 'react-flow',
      reactFlowData: {
        nodes: [
          {
            id: 'main',
            label: 'Main Video\nmain.mp4',
            position: { x: 0, y: 0 },
            type: 'input'
          },
          {
            id: 'overlay',
            label: 'Overlay Video\ninsert.mp4',
            position: { x: 0, y: 150 },
            type: 'input'
          },
          {
            id: 'scale',
            label: 'scale Filter\nscale=iw/4:ih/4',
            position: { x: 200, y: 150 },
            type: 'default'
          },
          {
            id: 'overlay-filter',
            label: 'overlay Filter\nPosition: bottom-right',
            position: { x: 400, y: 75 },
            type: 'default'
          },
          {
            id: 'output',
            label: 'Output\noutput.mp4',
            position: { x: 600, y: 75 },
            type: 'output'
          }
        ],
        edges: [
          {
            id: 'e1',
            source: 'main',
            target: 'overlay-filter',
            label: '[0]'
          },
          {
            id: 'e2',
            source: 'overlay',
            target: 'scale',
            label: '[1]'
          },
          {
            id: 'e3',
            source: 'scale',
            target: 'overlay-filter',
            label: '[pip]'
          },
          {
            id: 'e4',
            source: 'overlay-filter',
            target: 'output'
          }
        ]
      }
    },
    {
      type: 'code',
      command: 'ffmpeg -i main.mp4 -i insert.mp4 -filter_complex "[1]scale=iw/4:ih/4[pip]; [0][pip] overlay=main_w-overlay_w-10:main_h-overlay_h-10" output.mp4',
      explanation: 'Overlay a second video on the bottom-right. First scale it to 1/4 size, then position it 10px from right and bottom.',
      flagBreakdown: [
        {
          flag: '[1]scale=iw/4:ih/4[pip]',
          description: 'Scale second video to 1/4 of its original size'
        },
        {
          flag: '[0][pip] overlay=main_w-overlay_w-10:main_h-overlay_h-10',
          description: 'Overlay pip video 10px from right and bottom of main video'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i main.mp4 -i insert.mp4 -filter_complex "[1]scale=320:240[pip]; [0][pip] overlay=10:10" output.mp4',
      explanation: 'Overlay with fixed size (320x240) at top-left corner (10,10).',
      flagBreakdown: [
        {
          flag: '[1]scale=320:240[pip]',
          description: 'Scale overlay to fixed 320x240 size'
        },
        {
          flag: 'overlay=10:10',
          description: 'Position overlay at coordinates (10, 10) - top-left'
        }
      ]
    },
    {
      type: 'preview',
      heading: 'Try It: Create Picture-in-Picture',
      content: 'Overlay a second video on the bottom-right of the main video',
      code: 'ffmpeg -i main.mp4 -i pip.mp4 -filter_complex "[1]scale=iw/4:ih/4[pip]; [0][pip] overlay=main_w-overlay_w-10:main_h-overlay_h-10" output.mp4',
      explanation: 'This creates a picture-in-picture effect with the second video scaled and positioned in the corner',
      previewType: 'filter',
      sampleVideoId: 'sample-pip-001'
    },
    {
      type: 'challenge',
      title: 'Create PiP Effect',
      description: 'Create a picture-in-picture effect with a video overlay',
      requirements: [
        'Use two input videos',
        'Scale the overlay video',
        'Position it in a corner'
      ],
      hints: [
        'Use -filter_complex with scale and overlay filters',
        'Scale syntax: scale=iw/4:ih/4',
        'Overlay positioning: overlay=W-w-10:H-h-10 for bottom-right'
      ],
      solution: 'ffmpeg -i main.mp4 -i pip.mp4 -filter_complex "[1]scale=iw/4:ih/4[pip]; [0][pip] overlay=main_w-overlay_w-10:main_h-overlay_h-10" output.mp4',
      validation: {
        type: 'contains',
        value: 'overlay'
      }
    },
    {
      type: 'quiz',
      question: 'What does the overlay filter do?',
      options: [
        { id: 'a', text: 'Merges two videos side by side', correct: false },
        { id: 'b', text: 'Places one video on top of another', correct: true },
        { id: 'c', text: 'Blends two videos together', correct: false },
        { id: 'd', text: 'Splits a video into two', correct: false }
      ],
      explanation: 'The overlay filter places one video (or image) on top of another at specified coordinates, creating picture-in-picture or watermark effects.'
    }
  ]
};
