import { Lesson } from '@/lib/tutorial/types';

export const audioBitrateControl: Lesson = {
  id: 'audio-bitrate-control',
  title: 'Audio Bitrate Control',
  module: 'Audio Processing',
  duration: 20,
  unlockAfter: 'converting-audio-formats',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Controlling audio bitrate allows you to balance quality and file size. This is crucial for streaming optimization, storage reduction, and quality control. FFmpeg supports both constant bitrate (CBR) and variable bitrate (VBR) encoding.'
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.wav -b:a 192k output.mp3',
      explanation: 'Set audio bitrate to 192 kbps. This controls the quality and file size of the output audio.',
      flagBreakdown: [
        {
          flag: '-b:a 192k',
          description: 'Set audio bitrate to 192 kilobits per second'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'bullets',
      heading: 'Typical Bitrates',
      content: 'Common audio bitrate values and their use cases:',
      bullets: [
        '96k → Low quality (voice recordings, podcasts)',
        '128k → Standard quality (acceptable for most uses)',
        '192k → High quality (music, high-quality podcasts)',
        '256k → Very high quality (music, professional use)',
        '320k → Maximum quality (highest quality MP3)'
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.wav -q:a 2 output.mp3',
      explanation: 'Use variable bitrate (VBR) for MP3. Lower -q:a values mean higher quality. Range is 0-9, where 0 is best quality.',
      flagBreakdown: [
        {
          flag: '-q:a 2',
          description: 'Set VBR quality to 2 (high quality, lower = better)'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'VBR vs CBR',
      content: 'Understanding bitrate modes:',
      bullets: [
        'CBR (Constant Bitrate): Fixed bitrate throughout, predictable file size',
        'VBR (Variable Bitrate): Bitrate varies based on complexity, better quality at same average bitrate',
        'VBR quality range: 0 (best) to 9 (lowest)',
        'VBR is generally preferred for music',
        'CBR is better for streaming where consistent bitrate is needed'
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.wav -b:a 128k -c:a aac output.m4a',
      explanation: 'Set bitrate for AAC codec. AAC typically provides better quality than MP3 at the same bitrate.',
      flagBreakdown: [
        {
          flag: '-b:a 128k',
          description: 'Set audio bitrate to 128 kbps'
        },
        {
          flag: '-c:a aac',
          description: 'Use AAC codec'
        }
      ]
    },
    {
      type: 'challenge',
      title: 'Set Audio Bitrate',
      description: 'Convert audio to MP3 with a bitrate of 192 kbps',
      requirements: [
        'Use -i for input file',
        'Use -b:a 192k for bitrate',
        'Output should be MP3 format'
      ],
      hints: [
        'Bitrate is specified with -b:a flag',
        '192k means 192 kilobits per second',
        'Output extension determines format'
      ],
      solution: 'ffmpeg -i input.wav -b:a 192k output.mp3',
      validation: {
        type: 'contains',
        value: '-b:a 192k'
      }
    },
    {
      type: 'quiz',
      question: 'What does -q:a 2 mean in VBR encoding?',
      options: [
        { id: 'a', text: 'Low quality (higher number = better)', correct: false },
        { id: 'b', text: 'High quality (lower number = better)', correct: true },
        { id: 'c', text: 'Fixed bitrate of 2 kbps', correct: false },
        { id: 'd', text: '2-channel audio', correct: false }
      ],
      explanation: 'In VBR encoding, -q:a uses a quality scale where lower values (0-9) mean higher quality. -q:a 2 is high quality.'
    }
  ]
};
