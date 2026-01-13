import { type Lesson } from '@/lib/tutorial/types';

export const removingAudioFromVideo: Lesson = {
  id: 'removing-audio-from-video',
  title: 'Removing Audio from Video',
  module: 'Audio Processing',
  duration: 15,
  unlockAfter: 'audio-mixing-and-merging',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Creating silent videos by removing audio is useful for background footage, privacy concerns, or when you plan to add new audio later. FFmpeg makes this simple with the -an flag.'
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -an output.mp4',
      explanation: 'Remove all audio streams from a video. The -an flag disables all audio output.',
      flagBreakdown: [
        {
          flag: '-an',
          description: 'Disable audio output (audio no)'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -an -c:v copy output.mp4',
      explanation: 'Remove audio while copying video stream without re-encoding. This is faster and preserves video quality.',
      flagBreakdown: [
        {
          flag: '-an',
          description: 'Disable audio output'
        },
        {
          flag: '-c:v copy',
          description: 'Copy video stream without re-encoding'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Use Cases',
      content: 'Common scenarios for removing audio:',
      bullets: [
        'Background footage: Silent video for overlaying new audio',
        'Privacy: Removing audio that contains sensitive information',
        'Re-editing: Preparing video for new audio tracks',
        'File size: Reducing file size by removing audio',
        'Testing: Creating test videos without audio'
      ]
    },
    {
      type: 'bullets',
      heading: 'Important Notes',
      content: 'Things to remember when removing audio:',
      bullets: [
        '-an disables all audio streams',
        'Video is re-encoded unless -c:v copy is used',
        'Using -c:v copy preserves video quality and is faster',
        'Output file will have no audio track',
        'You can add new audio later using -i for audio input'
      ]
    },
    {
      type: 'challenge',
      title: 'Remove Audio',
      description: 'Remove audio from a video file while preserving video quality',
      requirements: [
        'Use -i for input video',
        'Use -an to disable audio',
        'Use -c:v copy to preserve video quality',
        'Output should be silent video'
      ],
      hints: [
        'The -an flag removes audio',
        'Use -c:v copy to avoid re-encoding video',
        'This preserves original video quality'
      ],
      solution: 'ffmpeg -i input.mp4 -an -c:v copy output.mp4',
      validation: {
        type: 'contains',
        value: '-an'
      }
    },
    {
      type: 'quiz',
      question: 'What does the -an flag do?',
      options: [
        { id: 'a', text: 'Adds audio to video', correct: false },
        { id: 'b', text: 'Disables all audio streams', correct: true },
        { id: 'c', text: 'Normalizes audio', correct: false },
        { id: 'd', text: 'Extracts audio from video', correct: false }
      ],
      explanation: 'The -an flag disables all audio output, effectively removing audio from the video file.'
    }
  ]
};
