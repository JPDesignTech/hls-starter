import { type Lesson } from '@/lib/tutorial/types';

export const croppingVideos: Lesson = {
  id: 'cropping-videos',
  title: 'Cropping Videos',
  module: 'Video Processing',
  duration: 20,
  unlockAfter: 'filtering-basics',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'FFmpeg\'s crop filter allows cutting out a rectangular region from the video frame. This is useful for removing unwanted edges, focusing on specific areas, or changing aspect ratios.'
    },
    {
      type: 'code',
      command: 'ffmpeg -i in.mp4 -vf "crop=640:480:100:50" -c:a copy out.mp4',
      explanation: 'Crop a 640×480 section from the input, starting at 100px from the left and 50px from the top. The -c:a copy copies audio without re-encoding.',
      flagBreakdown: [
        {
          flag: '-vf "crop=640:480:100:50"',
          description: 'Video filter: crop width=640, height=480, x-offset=100, y-offset=50'
        },
        {
          flag: '-c:a copy',
          description: 'Copy audio stream without re-encoding'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i in.mp4 -vf "crop=640:480" -c:a copy out.mp4',
      explanation: 'If you omit x and y offsets, the filter will center the crop by default.',
      flagBreakdown: [
        {
          flag: '-vf "crop=640:480"',
          description: 'Crop to 640x480, centered automatically'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i in.mp4 -vf "crop=in_w/2:in_h/2:in_w/2:in_h/2" -c:a copy out.mp4',
      explanation: 'Use expressions to crop the bottom-right quarter: width/height as half of input, starting at halfway points.',
      flagBreakdown: [
        {
          flag: '-vf "crop=in_w/2:in_h/2:in_w/2:in_h/2"',
          description: 'Crop bottom-right quarter using input dimensions'
        }
      ]
    },
    {
      type: 'preview',
      heading: 'Try It: Crop a Video',
      content: 'Use the crop filter to extract a specific region from the video',
      code: 'ffmpeg -i sample.mp4 -vf "crop=640:480:100:50" -c:a copy output.mp4',
      explanation: 'This crops a 640x480 section starting at coordinates (100, 50)',
      previewType: 'crop',
      sampleVideoId: 'sample-crop-001'
    },
    {
      type: 'quiz',
      question: 'What does the crop filter syntax crop=w:h:x:y mean?',
      options: [
        { id: 'a', text: 'Width, height, x-offset, y-offset', correct: true },
        { id: 'b', text: 'Width, height, x-scale, y-scale', correct: false },
        { id: 'c', text: 'Width, height, x-rotation, y-rotation', correct: false },
        { id: 'd', text: 'Width, height, x-speed, y-speed', correct: false }
      ],
      explanation: 'The crop filter uses width, height, x-offset (distance from left), and y-offset (distance from top) to define the crop rectangle.'
    }
  ]
};
