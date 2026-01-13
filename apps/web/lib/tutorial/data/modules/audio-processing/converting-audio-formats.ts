import { Lesson } from '@/lib/tutorial/types';

export const convertingAudioFormats: Lesson = {
  id: 'converting-audio-formats',
  title: 'Converting Audio Formats',
  module: 'Audio Processing',
  duration: 20,
  unlockAfter: 'extracting-audio-from-video',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Converting audio between formats like WAV, MP3, AAC, OGG, and FLAC is essential for compatibility with different devices, compression for web delivery, and lossless archiving. FFmpeg can automatically select a suitable codec based on the output extension, or you can explicitly specify the codec.'
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.wav output.mp3',
      explanation: 'Basic audio conversion. FFmpeg automatically selects a suitable codec based on the output extension (.mp3).',
      flagBreakdown: [
        {
          flag: '-i input.wav',
          description: 'Input WAV file'
        },
        {
          flag: 'output.mp3',
          description: 'Output file - extension determines format'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.wav -c:a libmp3lame output.mp3',
      explanation: 'Explicit codec selection. Specify libmp3lame for MP3 encoding to have more control over the encoding process.',
      flagBreakdown: [
        {
          flag: '-c:a libmp3lame',
          description: 'Explicitly set audio codec to libmp3lame (MP3 encoder)'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Common Audio Codecs',
      content: 'FFmpeg supports many audio codecs:',
      bullets: [
        'MP3 → libmp3lame (lossy, widely compatible)',
        'AAC → aac (lossy, good quality at lower bitrates)',
        'OGG → libvorbis (lossy, open format)',
        'FLAC → flac (lossless, preserves quality)',
        'WAV → pcm_s16le (uncompressed, large files)'
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp3 -c:a flac output.flac',
      explanation: 'Convert to FLAC (lossless format). FLAC preserves quality but results in larger files than lossy formats.',
      flagBreakdown: [
        {
          flag: '-c:a flac',
          description: 'Set audio codec to FLAC (lossless)'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Format Considerations',
      content: 'Important notes about audio format conversion:',
      bullets: [
        'WAV → MP3 is lossy (quality reduction)',
        'FLAC preserves quality (lossless compression)',
        'Choose codec based on use case: compatibility, quality, or file size',
        'Lossy formats (MP3, AAC) are smaller but reduce quality',
        'Lossless formats (FLAC, WAV) preserve quality but are larger'
      ]
    },
    {
      type: 'challenge',
      title: 'Convert Audio Format',
      description: 'Convert a WAV file to AAC format with explicit codec selection',
      requirements: [
        'Use -i for input WAV file',
        'Use -c:a aac for AAC codec',
        'Output should be .aac or .m4a file'
      ],
      hints: [
        'AAC codec is specified with -c:a aac',
        'Output extension can be .aac or .m4a',
        'AAC is commonly used in MP4 containers'
      ],
      solution: 'ffmpeg -i input.wav -c:a aac output.m4a',
      validation: {
        type: 'contains',
        value: '-c:a aac'
      }
    },
    {
      type: 'quiz',
      question: 'What is the main difference between lossy and lossless audio formats?',
      options: [
        { id: 'a', text: 'Lossy formats are always better quality', correct: false },
        { id: 'b', text: 'Lossless formats preserve quality but create larger files', correct: true },
        { id: 'c', text: 'Lossy formats cannot be converted', correct: false },
        { id: 'd', text: 'There is no difference', correct: false }
      ],
      explanation: 'Lossless formats like FLAC preserve the original audio quality but create larger files. Lossy formats like MP3 reduce quality to achieve smaller file sizes.'
    }
  ]
};
