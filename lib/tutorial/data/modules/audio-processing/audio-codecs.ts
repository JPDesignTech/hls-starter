import { Lesson } from '@/lib/tutorial/types';

export const audioCodecs: Lesson = {
  id: 'audio-codecs',
  title: 'Audio Codecs',
  module: 'Audio Processing',
  duration: 20,
  unlockAfter: 'video-codecs',
  content: [
    {
      type: 'text',
      title: 'Audio Codec Basics',
      content: `Just like video, audio also uses codecs to compress and decompress audio data. FFMPEG supports many audio codecs.

## Common Audio Codecs

- **AAC**: Advanced Audio Coding, widely supported, good quality
- **MP3**: Very common, good compatibility
- **Opus**: Excellent quality at low bitrates, great for streaming
- **FLAC**: Lossless compression, no quality loss

## Selecting an Audio Codec

Use the \`-c:a\` (or \`-acodec\`) flag to specify the audio codec.`
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -c:a aac output.mp4',
      explanation: 'Convert audio track to AAC codec',
      flagBreakdown: [
        {
          flag: '-c:a aac',
          description: 'Set the audio codec to AAC'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -c:v copy -c:a mp3 output.mp4',
      explanation: 'Copy video stream and convert audio to MP3',
      flagBreakdown: [
        {
          flag: '-c:v copy',
          description: 'Copy video stream without re-encoding (faster)'
        },
        {
          flag: '-c:a mp3',
          description: 'Convert audio to MP3 codec'
        }
      ]
    },
    {
      type: 'challenge',
      title: 'Extract Audio',
      description: 'Extract audio from a video file and save it as an MP3 file',
      requirements: [
        'Use -i for input',
        'Use -c:a mp3 for audio codec',
        'Output should be .mp3 file'
      ],
      hints: [
        'You can use -vn to disable video',
        'Or just specify an audio output format'
      ],
      solution: 'ffmpeg -i input.mp4 -c:a mp3 output.mp3',
      validation: {
        type: 'contains',
        value: '-c:a mp3'
      }
    },
    {
      type: 'quiz',
      question: 'What flag is used to specify the audio codec?',
      options: [
        { id: 'a', text: '-c:a or -acodec', correct: true },
        { id: 'b', text: '-audio', correct: false },
        { id: 'c', text: '-a', correct: false },
        { id: 'd', text: '-codec:a', correct: false }
      ],
      explanation: 'The -c:a (or -acodec) flag is used to specify the audio codec in FFMPEG commands.'
    }
  ]
};
