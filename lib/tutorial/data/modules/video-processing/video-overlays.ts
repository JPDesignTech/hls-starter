import { Lesson } from '@/lib/tutorial/types';

export const videoOverlays: Lesson = {
  id: 'video-overlays',
  title: 'Video Overlays',
  module: 'Video Processing',
  duration: 25,
  unlockAfter: 'motion-detection',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Video overlay in FFmpeg is accomplished with the overlay filter. Overlays aren\'t limited to videos: you can overlay images on video, or even generate text or shapes to overlay.'
    },
    {
      type: 'bullets',
      heading: 'Overlay Types',
      content: 'Common overlay scenarios:',
      bullets: [
        'Image on Video: Add logos, graphics, or background images',
        'Text on Video: Use drawtext filter for captions, timecodes, or labels',
        'Multiple Overlays: Chain overlays for complex compositions'
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i video.mp4 -i image.png -filter_complex "overlay=x:y" output.mp4',
      explanation: 'Overlay an image (second input) onto video. Specify x,y position (default 0,0 if not specified). PNGs with transparency are supported.',
      flagBreakdown: [
        {
          flag: '-filter_complex "overlay=x:y"',
          description: 'Overlay image at coordinates (x, y)'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "drawtext=text=\'Hello\':x=100:y=50:fontcolor=white:fontsize=24" -c:a copy output.mp4',
      explanation: 'Add text overlay using drawtext filter. Draws "Hello" at coordinates (100,50) in white, font size 24.',
      flagBreakdown: [
        {
          flag: '-vf "drawtext=text=\'Hello\':x=100:y=50:fontcolor=white:fontsize=24"',
          description: 'Draw text "Hello" at position (100,50) with white color and size 24'
        }
      ]
    },
    {
      type: 'preview',
      heading: 'Try It: Add Overlay',
      content: 'Overlay an image or text on a video',
      code: 'ffmpeg -i sample.mp4 -i overlay.png -filter_complex "overlay=10:10" output.mp4',
      explanation: 'This overlays an image at the top-left corner (10,10)',
      previewType: 'filter',
      sampleVideoId: 'sample-overlay-001'
    },
    {
      type: 'quiz',
      question: 'What filter is used to add text to a video?',
      options: [
        { id: 'a', text: 'textoverlay', correct: false },
        { id: 'b', text: 'drawtext', correct: true },
        { id: 'c', text: 'addtext', correct: false },
        { id: 'd', text: 'textfilter', correct: false }
      ],
      explanation: 'The drawtext filter is used to add text overlays to videos. It supports many options for font, size, color, position, and even dynamic text like timestamps.'
    }
  ]
};
