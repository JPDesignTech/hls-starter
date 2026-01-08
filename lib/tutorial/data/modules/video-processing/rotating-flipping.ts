import { Lesson } from '@/lib/tutorial/types';

export const rotatingFlipping: Lesson = {
  id: 'rotating-flipping',
  title: 'Rotating and Flipping Videos',
  module: 'Video Processing',
  duration: 20,
  unlockAfter: 'cropping-videos',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'FFmpeg can rotate videos by 90/180/270 degrees using the transpose filter, and flip videos using hflip and vflip filters. These operations are useful for correcting orientation or creating mirror effects.'
    },
    {
      type: 'bullets',
      heading: 'Transpose Values',
      content: 'Common transpose filter values:',
      bullets: [
        'transpose=1: Rotate 90° clockwise',
        'transpose=2: Rotate 90° counter-clockwise',
        'transpose=0: 90° counter-clockwise and vertical flip',
        'transpose=3: 90° clockwise and vertical flip'
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mov -vf "transpose=1" output.mov',
      explanation: 'Rotate the video 90° clockwise using transpose=1.',
      flagBreakdown: [
        {
          flag: '-vf "transpose=1"',
          description: 'Apply transpose filter: rotate 90° clockwise'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.avi -vf "vflip,hflip" output.avi',
      explanation: 'For a 180° rotation, apply both vertical and horizontal flips. This creates an upside-down flip.',
      flagBreakdown: [
        {
          flag: '-vf "vflip,hflip"',
          description: 'Chain filters: vertical flip then horizontal flip (180° rotation)'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.avi -vf "hflip" -c:a copy output.avi',
      explanation: 'Flip horizontally (mirror left/right) without rotation. Use vflip for vertical flip (upside-down).',
      flagBreakdown: [
        {
          flag: '-vf "hflip"',
          description: 'Horizontal flip: mirror left and right'
        },
        {
          flag: '-c:a copy',
          description: 'Copy audio since rotation doesn\'t affect audio'
        }
      ]
    },
    {
      type: 'preview',
      heading: 'Try It: Rotate Video',
      content: 'Rotate a video 90 degrees clockwise',
      code: 'ffmpeg -i sample.mp4 -vf "transpose=1" output.mp4',
      explanation: 'This rotates the video 90° clockwise',
      previewType: 'filter',
      sampleVideoId: 'sample-rotate-001'
    },
    {
      type: 'quiz',
      question: 'What filter value rotates a video 90° clockwise?',
      options: [
        { id: 'a', text: 'transpose=0', correct: false },
        { id: 'b', text: 'transpose=1', correct: true },
        { id: 'c', text: 'transpose=2', correct: false },
        { id: 'd', text: 'hflip', correct: false }
      ],
      explanation: 'transpose=1 rotates the video 90° clockwise. transpose=2 rotates counter-clockwise.'
    }
  ]
};
