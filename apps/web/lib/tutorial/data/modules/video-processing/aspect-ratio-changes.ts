import { Lesson } from '@/lib/tutorial/types';

export const aspectRatioChanges: Lesson = {
  id: 'aspect-ratio-changes',
  title: 'Aspect Ratio Changes',
  module: 'Video Processing',
  duration: 20,
  unlockAfter: 'frame-rate-manipulation',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Aspect ratio can refer to display aspect ratio (DAR) - how the image is viewed - or pixel/sample aspect ratio (SAR) - the shape of each pixel. FFmpeg lets you change aspect ratio by rescaling or changing metadata.'
    },
    {
      type: 'bullets',
      heading: 'Two Methods',
      content: 'Methods for changing aspect ratio:',
      bullets: [
        'Rescaling: Actually resize the video pixels (re-encodes)',
        'Metadata: Change the aspect flag without altering pixels (stream copy possible)'
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "scale=1280:720" output.mp4',
      explanation: 'Rescale the video to 1280x720 (16:9). This actually changes the pixels and re-encodes.',
      flagBreakdown: [
        {
          flag: '-vf "scale=1280:720"',
          description: 'Scale video to 1280x720 pixels (16:9 aspect ratio)'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -c copy -aspect 16:9 output.mp4',
      explanation: 'Change the aspect ratio metadata without re-encoding. This sets the display aspect ratio flag.',
      flagBreakdown: [
        {
          flag: '-c copy',
          description: 'Copy streams without re-encoding'
        },
        {
          flag: '-aspect 16:9',
          description: 'Set display aspect ratio to 16:9 in metadata'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "setdar=16/9" -c:a copy output.mp4',
      explanation: 'Use the setdar filter to instruct players to treat the frame as 16:9 without altering pixel data.',
      flagBreakdown: [
        {
          flag: '-vf "setdar=16/9"',
          description: 'Set display aspect ratio to 16:9 via filter'
        }
      ]
    },
    {
      type: 'preview',
      heading: 'Try It: Change Aspect Ratio',
      content: 'Convert a video to 16:9 aspect ratio',
      code: 'ffmpeg -i sample.mp4 -vf "scale=1280:720" output.mp4',
      explanation: 'This rescales the video to 16:9 (1280x720)',
      previewType: 'resize',
      sampleVideoId: 'sample-aspect-001'
    },
    {
      type: 'quiz',
      question: 'What is the difference between rescaling and changing aspect metadata?',
      options: [
        { id: 'a', text: 'Rescaling changes pixels, metadata only changes how it\'s displayed', correct: true },
        { id: 'b', text: 'Both methods re-encode the video', correct: false },
        { id: 'c', text: 'Metadata changes pixels, rescaling only changes display', correct: false },
        { id: 'd', text: 'There is no difference', correct: false }
      ],
      explanation: 'Rescaling actually changes the pixel dimensions (requires re-encoding), while metadata only changes how players display the video (can use stream copy).'
    }
  ]
};
