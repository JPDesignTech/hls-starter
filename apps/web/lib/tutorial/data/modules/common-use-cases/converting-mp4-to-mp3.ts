import { type Lesson } from '@/lib/tutorial/types';

export const convertingMp4ToMp3: Lesson = {
  id: 'converting-mp4-to-mp3',
  title: 'Converting MP4 to MP3',
  module: 'Common Use Cases',
  duration: 15,
  unlockAfter: 'command-structure-flags',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Extracting and converting audio from a video into MP3 format is one of the most common FFmpeg tasks. This is essential for podcast extraction, music/audio reuse, and transcription workflows.'
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 output.mp3',
      explanation: 'Basic MP4 to MP3 conversion. FFmpeg automatically extracts the audio and converts it to MP3 format.',
      flagBreakdown: [
        {
          flag: '-i input.mp4',
          description: 'Input video file'
        },
        {
          flag: 'output.mp3',
          description: 'Output MP3 audio file'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -b:a 192k output.mp3',
      explanation: 'Control audio quality by setting bitrate. 192k provides high quality while keeping file size reasonable.',
      flagBreakdown: [
        {
          flag: '-b:a 192k',
          description: 'Set audio bitrate to 192 kilobits per second'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -q:a 2 output.mp3',
      explanation: 'Use variable bitrate (VBR) for better quality at similar file sizes. Lower values mean higher quality.',
      flagBreakdown: [
        {
          flag: '-q:a 2',
          description: 'Set VBR quality to 2 (high quality, range 0-9)'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Important Notes',
      content: 'Things to remember about MP4 to MP3 conversion:',
      bullets: [
        'MP3 conversion always re-encodes (cannot stream copy)',
        'AAC → MP3 introduces quality loss (lossy → lossy conversion)',
        'Use -b:a for constant bitrate (CBR) control',
        'Use -q:a for variable bitrate (VBR) - better quality',
        'Higher bitrate = better quality but larger file size'
      ]
    },
    {
      type: 'bullets',
      heading: 'Use Cases',
      content: 'Common scenarios:',
      bullets: [
        'Podcast extraction: Get audio from video podcasts',
        'Music/audio reuse: Extract background music or sound effects',
        'Transcription workflows: Convert video to audio for transcription',
        'Audio archiving: Store audio separately from video',
        'Mobile compatibility: MP3 works on all devices'
      ]
    },
    {
      type: 'challenge',
      title: 'Convert with Quality Control',
      description: 'Convert an MP4 video to MP3 with a bitrate of 256k',
      requirements: [
        'Use -i for input file',
        'Use -b:a 256k for bitrate',
        'Output should be MP3 format'
      ],
      hints: [
        'Bitrate is specified with -b:a flag',
        '256k means 256 kilobits per second',
        'Output extension determines format'
      ],
      solution: 'ffmpeg -i input.mp4 -b:a 256k output.mp3',
      validation: {
        type: 'contains',
        value: '-b:a 256k'
      }
    },
    {
      type: 'quiz',
      question: 'What happens when converting AAC audio (from MP4) to MP3?',
      options: [
        { id: 'a', text: 'No quality loss occurs', correct: false },
        { id: 'b', text: 'Quality loss occurs (lossy → lossy conversion)', correct: true },
        { id: 'c', text: 'File size increases significantly', correct: false },
        { id: 'd', text: 'Conversion is not possible', correct: false }
      ],
      explanation: 'Converting AAC to MP3 involves lossy to lossy conversion, which introduces quality loss. Both formats are compressed, so re-encoding from one lossy format to another reduces quality.'
    }
  ]
};
