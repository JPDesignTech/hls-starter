import { type Lesson } from '@/lib/tutorial/types';

export const addingWatermarks: Lesson = {
  id: 'adding-watermarks',
  title: 'Adding Watermarks',
  module: 'Video Processing',
  duration: 20,
  unlockAfter: 'video-overlays',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Watermarks are typically small logos or text placed on video frames. With FFmpeg, adding an image watermark is straightforward using the overlay filter.'
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -i logo.png -filter_complex "overlay=10:10" -codec:a copy output.mp4',
      explanation: 'Put a logo.png at the top-left of a video at coordinates (10,10) - 10px from left and top. Audio is copied without re-encode.',
      flagBreakdown: [
        {
          flag: '-filter_complex "overlay=10:10"',
          description: 'Overlay logo at coordinates (10, 10)'
        },
        {
          flag: '-codec:a copy',
          description: 'Copy audio without re-encoding'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -i logo.png -filter_complex "overlay=W-w-10:H-h-10" output.mp4',
      explanation: 'Position watermark at bottom-right. W/H are main video\'s width/height, w/h are overlay\'s, placing it 10px from right and bottom.',
      flagBreakdown: [
        {
          flag: 'overlay=W-w-10:H-h-10',
          description: 'Position overlay 10px from right and bottom'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -i logo.png -filter_complex "[1][0]scale2ref=oh*mdar:ih*0.2[wm][base]; [base][wm]overlay=5:5" output.mp4',
      explanation: 'Scale watermark to 20% of video height using scale2ref filter, preserving aspect ratio, then overlay at (5,5).',
      flagBreakdown: [
        {
          flag: '[1][0]scale2ref=oh*mdar:ih*0.2[wm][base]',
          description: 'Scale watermark to 20% of video height relative to base video'
        }
      ]
    },
    {
      type: 'preview',
      heading: 'Try It: Add Watermark',
      content: 'Add a watermark logo to the bottom-right corner of a video',
      code: 'ffmpeg -i sample.mp4 -i logo.png -filter_complex "overlay=W-w-10:H-h-10" output.mp4',
      explanation: 'This adds a watermark 10 pixels from the right and bottom edges',
      previewType: 'filter',
      sampleVideoId: 'sample-watermark-001'
    },
    {
      type: 'challenge',
      title: 'Add Watermark',
      description: 'Create a command to add a watermark at the top-right corner',
      requirements: [
        'Use overlay filter',
        'Position at top-right',
        'Use appropriate coordinates'
      ],
      hints: [
        'Top-right formula: overlay=W-w-10:10',
        'W-w-10 positions from right, :10 positions from top',
        'Use -filter_complex for overlay'
      ],
      solution: 'ffmpeg -i input.mp4 -i logo.png -filter_complex "overlay=W-w-10:10" output.mp4',
      validation: {
        type: 'contains',
        value: 'overlay=W-w-10:10'
      }
    },
    {
      type: 'quiz',
      question: 'What formula positions a watermark at the bottom-right corner?',
      options: [
        { id: 'a', text: 'overlay=10:10', correct: false },
        { id: 'b', text: 'overlay=W-w-10:H-h-10', correct: true },
        { id: 'c', text: 'overlay=W:H', correct: false },
        { id: 'd', text: 'overlay=w:h', correct: false }
      ],
      explanation: 'overlay=W-w-10:H-h-10 positions the overlay 10 pixels from the right (W-w-10) and 10 pixels from the bottom (H-h-10) of the main video.'
    }
  ]
};
