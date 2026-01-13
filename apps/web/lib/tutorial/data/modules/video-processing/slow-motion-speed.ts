import { Lesson } from '@/lib/tutorial/types';

export const slowMotionSpeed: Lesson = {
  id: 'slow-motion-speed',
  title: 'Slow Motion and Speed Effects',
  module: 'Video Processing',
  duration: 25,
  unlockAfter: 'timelapse-creation',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Slow-motion or speed-up effects are achieved by altering frame timestamps and audio tempo. FFmpeg\'s setpts video filter and atempo audio filter are key for this.'
    },
    {
      type: 'code',
      command: 'ffmpeg -i clip.mp4 -vf "setpts=2.0*PTS" -c:a copy slow.mp4',
      explanation: 'Slow down video to half speed (2× slower). Each frame\'s timestamp is doubled. Note: audio will be out of sync since we copied it.',
      flagBreakdown: [
        {
          flag: '-vf "setpts=2.0*PTS"',
          description: 'Double presentation timestamps (half speed)'
        },
        {
          flag: '-c:a copy',
          description: 'Copy audio (will be out of sync)'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i clip.mp4 -vf "setpts=0.5*PTS" -c:a copy fast.mp4',
      explanation: 'Speed up video 2× (double speed). Each frame\'s timestamp is halved.',
      flagBreakdown: [
        {
          flag: '-vf "setpts=0.5*PTS"',
          description: 'Halve presentation timestamps (double speed)'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i clip.mp4 -filter_complex "[0:v]setpts=0.5*PTS[v];[0:a]atempo=2.0[a]" -map "[v]" -map "[a]" output.mp4',
      explanation: 'Speed up both video and audio together. atempo supports 0.5× to 2.0× per instance. Chain multiple atempo filters for larger changes.',
      flagBreakdown: [
        {
          flag: '-filter_complex "[0:v]setpts=0.5*PTS[v];[0:a]atempo=2.0[a]"',
          description: 'Speed up video 2× and audio 2× to keep them in sync'
        },
        {
          flag: '-map "[v]" -map "[a]"',
          description: 'Map the processed video and audio streams'
        }
      ]
    },
    {
      type: 'preview',
      heading: 'Try It: Slow Motion Effect',
      content: 'Create a slow-motion effect by slowing down the video',
      code: 'ffmpeg -i sample.mp4 -vf "setpts=2.0*PTS" -an output.mp4',
      explanation: 'This slows down the video to half speed (2× slower)',
      previewType: 'filter',
      sampleVideoId: 'sample-speed-001'
    },
    {
      type: 'quiz',
      question: 'What does setpts=2.0*PTS do to video playback?',
      options: [
        { id: 'a', text: 'Speeds up 2×', correct: false },
        { id: 'b', text: 'Slows down 2×', correct: true },
        { id: 'c', text: 'Changes to 2 fps', correct: false },
        { id: 'd', text: 'Doubles the resolution', correct: false }
      ],
      explanation: 'setpts=2.0*PTS doubles each frame\'s timestamp, making the video take twice as long to play (half speed/slow motion).'
    }
  ]
};
