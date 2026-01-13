import { Lesson } from '@/lib/tutorial/types';

export const frameRateManipulation: Lesson = {
  id: 'frame-rate-manipulation',
  title: 'Frame Rate Manipulation',
  module: 'Video Processing',
  duration: 20,
  unlockAfter: 'rotating-flipping',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'To change a video\'s frame rate, use the -r option for output. FFmpeg will duplicate or drop frames as needed to achieve the desired frame rate. This affects playback smoothness and file size.'
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.avi -r 24 output.mp4',
      explanation: 'Convert a video to 24 FPS. FFmpeg will duplicate or drop frames as needed.',
      flagBreakdown: [
        {
          flag: '-r 24',
          description: 'Set output frame rate to 24 frames per second'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -framerate 30 -i frame%03d.png -c:v libx264 output.mp4',
      explanation: 'For image sequences, use -framerate on input to tell FFmpeg the source frame rate. Each image is treated as 1/30th of a second.',
      flagBreakdown: [
        {
          flag: '-framerate 30',
          description: 'Set input frame rate to 30 fps for image sequence'
        },
        {
          flag: '-i frame%03d.png',
          description: 'Input pattern: frame001.png, frame002.png, etc.'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Frame Rate Effects',
      content: 'Understanding frame rate changes:',
      bullets: [
        'Increasing FPS: Extra frames are duplicated, making motion appear smoother',
        'Decreasing FPS: Frames are dropped, potentially making motion choppier',
        'Changing -r keeps playback duration the same by default',
        'Use setpts filter for duration changes (speed effects)'
      ]
    },
    {
      type: 'preview',
      heading: 'Try It: Change Frame Rate',
      content: 'Convert a video to 24 FPS',
      code: 'ffmpeg -i sample.mp4 -r 24 output.mp4',
      explanation: 'This converts the video to 24 fps by duplicating or dropping frames',
      previewType: 'filter',
      sampleVideoId: 'sample-fps-001'
    },
    {
      type: 'quiz',
      question: 'What happens when you increase the frame rate with -r?',
      options: [
        { id: 'a', text: 'Frames are dropped', correct: false },
        { id: 'b', text: 'Extra frames are duplicated', correct: true },
        { id: 'c', text: 'Video duration increases', correct: false },
        { id: 'd', text: 'Video quality decreases', correct: false }
      ],
      explanation: 'When increasing frame rate, FFmpeg duplicates frames to fill the gaps, making motion appear smoother.'
    }
  ]
};
