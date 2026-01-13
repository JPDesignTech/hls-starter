import { Lesson } from '@/lib/tutorial/types';

export const extractingAudioFromVideo: Lesson = {
  id: 'extracting-audio-from-video',
  title: 'Extracting Audio from Video',
  module: 'Audio Processing',
  duration: 20,
  unlockAfter: 'audio-codecs',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Extracting the audio stream from a video file is a common operation. FFmpeg allows you to do this either by copying the audio stream (no re-encoding) or by re-encoding it to a different format. This is useful for podcast creation, audio editing workflows, transcription pipelines, and archiving audio separately.'
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vn -c:a copy output.aac',
      explanation: 'Extract audio using stream copy - no re-encoding, preserves original quality. The -vn flag disables video stream.',
      flagBreakdown: [
        {
          flag: '-i input.mp4',
          description: 'Specify the input video file'
        },
        {
          flag: '-vn',
          description: 'Disable video stream (video no)'
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
      command: 'ffmpeg -i input.mp4 -vn -c:a mp3 output.mp3',
      explanation: 'Extract and re-encode audio to MP3 format. This allows format conversion but may reduce quality.',
      flagBreakdown: [
        {
          flag: '-vn',
          description: 'Disable video stream'
        },
        {
          flag: '-c:a mp3',
          description: 'Re-encode audio to MP3 codec'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Key Points',
      content: 'Understanding the difference between stream copy and re-encoding:',
      bullets: [
        'Stream copy (-c:a copy) preserves original quality and is faster',
        'Re-encoding allows format change but may reduce quality',
        'Some containers (MP4) often use AAC by default',
        'Use stream copy when you want to preserve quality',
        'Use re-encoding when you need a different format'
      ]
    },
    {
      type: 'challenge',
      title: 'Extract Audio',
      description: 'Extract audio from a video file using stream copy to preserve quality',
      requirements: [
        'Use -i for input file',
        'Use -vn to disable video',
        'Use -c:a copy to copy audio stream',
        'Output should be an audio file'
      ],
      hints: [
        'The -vn flag removes video from the output',
        'Stream copy preserves original quality',
        'Output extension determines container format'
      ],
      solution: 'ffmpeg -i input.mp4 -vn -c:a copy output.aac',
      validation: {
        type: 'contains',
        value: '-c:a copy'
      }
    },
    {
      type: 'quiz',
      question: 'What is the advantage of using -c:a copy when extracting audio?',
      options: [
        { id: 'a', text: 'It converts to a better format', correct: false },
        { id: 'b', text: 'It preserves original quality and is faster', correct: true },
        { id: 'c', text: 'It reduces file size', correct: false },
        { id: 'd', text: 'It improves audio quality', correct: false }
      ],
      explanation: 'Using -c:a copy copies the audio stream without re-encoding, preserving the original quality and processing faster than re-encoding.'
    }
  ]
};
