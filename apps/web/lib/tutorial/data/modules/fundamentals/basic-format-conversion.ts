import { type Lesson } from '@/lib/tutorial/types';

export const basicFormatConversion: Lesson = {
  id: 'basic-format-conversion',
  title: 'Basic Format Conversion',
  module: 'Fundamentals',
  duration: 20,
  unlockAfter: 'input-output',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'FFmpeg is commonly used to convert media files from one format to another. The simplest usage is to specify an input file with -i and an output filename with the desired extension – FFmpeg will auto-select appropriate codecs.'
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp3 output.ogg',
      explanation: 'Convert MP3 audio to OGG Vorbis format. FFmpeg automatically selects the appropriate codec for the output container.',
      flagBreakdown: [
        {
          flag: '-i input.mp3',
          description: 'Specify the input MP3 audio file'
        },
        {
          flag: 'output.ogg',
          description: 'Output filename with .ogg extension (FFmpeg auto-selects Vorbis codec)'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 output.webm',
      explanation: 'Convert MP4 video to WebM format. FFmpeg automatically uses VP8/VP9 for video and Vorbis/Opus for audio.',
      flagBreakdown: [
        {
          flag: '-i input.mp4',
          description: 'Specify the input MP4 video file'
        },
        {
          flag: 'output.webm',
          description: 'Output filename with .webm extension (FFmpeg auto-selects WebM codecs)'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -c:v libx264 output.webm',
      explanation: 'Override codec selection: force H.264 encoding even for WebM output (though VP8/VP9 is more typical for WebM).',
      flagBreakdown: [
        {
          flag: '-c:v libx264',
          description: 'Force H.264 video codec (overrides default)'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Auto-Codec Selection',
      content: 'In many cases you don\'t need to manually specify codecs because:',
      bullets: [
        'FFmpeg\'s defaults for the output container are usually appropriate',
        'The file extension determines the container format',
        'Each container has standard codec defaults (e.g., MP4 uses H.264/AAC)',
        'You can override codecs with the -c option if needed'
      ]
    },
    {
      type: 'quiz',
      question: 'What happens when you convert MP3 to OGG without specifying codecs?',
      options: [
        { id: 'a', text: 'FFmpeg fails because no codec is specified', correct: false },
        { id: 'b', text: 'FFmpeg automatically selects Vorbis codec for OGG', correct: true },
        { id: 'c', text: 'The file extension is ignored', correct: false },
        { id: 'd', text: 'FFmpeg copies the MP3 codec to OGG', correct: false }
      ],
      explanation: 'FFmpeg automatically selects appropriate codecs based on the output container format. For OGG, it defaults to Vorbis audio codec.'
    }
  ]
};
