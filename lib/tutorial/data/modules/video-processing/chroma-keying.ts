import { Lesson } from '@/lib/tutorial/types';

export const chromaKeying: Lesson = {
  id: 'chroma-keying',
  title: 'Chroma Keying (Green Screen)',
  module: 'Video Processing',
  duration: 25,
  unlockAfter: 'picture-in-picture',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Chroma keying removes a specific color (typically green or blue) from a video so you can overlay it onto a new background. FFmpeg\'s colorkey filter is used in combination with overlay.'
    },
    {
      type: 'code',
      command: 'ffmpeg -i background.mp4 -i overlay.mp4 -filter_complex "[1:v]colorkey=0x00FF00:0.3:0.2[ckout]; [0:v][ckout]overlay[out]" -map "[out]" -c:a copy result.mp4',
      explanation: 'Key out green (0x00FF00) from overlay video with similarity 0.3 and blend 0.2, then overlay onto background.',
      flagBreakdown: [
        {
          flag: '[1:v]colorkey=0x00FF00:0.3:0.2[ckout]',
          description: 'Remove green color (0x00FF00) with similarity 0.3 and blend 0.2'
        },
        {
          flag: '[0:v][ckout]overlay[out]',
          description: 'Overlay the keyed video onto the background'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'bullets',
      heading: 'Colorkey Parameters',
      content: 'Understanding colorkey parameters:',
      bullets: [
        'Color (hex): The color to make transparent (e.g., 0x00FF00 for green)',
        'Similarity (0.0-1.0): Tolerance - higher means wider range of similar colors',
        'Blend (0.0-1.0): Softens edges - 0.0 means hard key, higher values blend'
      ]
    },
    {
      type: 'preview',
      heading: 'Try It: Remove Green Screen',
      content: 'Remove a green background and overlay on a new background',
      code: 'ffmpeg -i background.mp4 -i overlay.mp4 -filter_complex "[1:v]colorkey=0x00FF00:0.3:0.2[ckout]; [0:v][ckout]overlay[out]" -map "[out]" -c:a copy result.mp4',
      explanation: 'This removes the green background and composites the video onto a new background',
      previewType: 'filter',
      sampleVideoId: 'sample-chroma-001'
    },
    {
      type: 'quiz',
      question: 'What does the colorkey filter do?',
      options: [
        { id: 'a', text: 'Changes video colors', correct: false },
        { id: 'b', text: 'Removes a specific color to make it transparent', correct: true },
        { id: 'c', text: 'Adds color to black and white video', correct: false },
        { id: 'd', text: 'Adjusts color saturation', correct: false }
      ],
      explanation: 'The colorkey filter removes a specific color (like green screen) from a video, making those areas transparent so they can be composited onto another background.'
    }
  ]
};
