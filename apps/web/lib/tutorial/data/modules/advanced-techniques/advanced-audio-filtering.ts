import { Lesson } from '@/lib/tutorial/types';

export const advancedAudioFiltering: Lesson = {
  id: 'advanced-audio-filtering',
  title: 'Advanced Audio Filtering',
  module: 'Advanced Techniques',
  duration: 30,
  unlockAfter: 'multiple-input-processing',
  content: [
    {
      type: 'introduction',
      heading: 'What This Lesson Covers',
      content: 'Sophisticated audio effects using -filter_complex and advanced audio filters. Better control over dynamic range, echo/reverb, and frequency shaping.'
    },
    {
      type: 'bullets',
      heading: 'Why It Matters',
      content: 'Advanced audio filtering enables:',
      bullets: [
        'Professional audio processing',
        'Dynamic range compression',
        'Echo and reverb effects',
        'Frequency shaping and EQ',
        'Audio mastering workflows'
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.wav -filter_complex "acompressor=threshold=-20dB:ratio=4:attack=5:release=100, equalizer=f=1000:t=q:w=1:g=3" output.wav',
      explanation: 'Dynamic range compression followed by EQ. Compression smooths levels, then equalizer boosts mid range (1000Hz) by 3dB.',
      flagBreakdown: [
        {
          flag: 'acompressor=threshold=-20dB:ratio=4:attack=5:release=100',
          description: 'Compressor: threshold -20dB, ratio 4:1, attack 5ms, release 100ms'
        },
        {
          flag: 'equalizer=f=1000:t=q:w=1:g=3',
          description: 'EQ: frequency 1000Hz, Q factor 1, gain +3dB'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.wav -af "aecho=0.8:0.88:60:0.4" output.wav',
      explanation: 'Echo effect: delay 60ms, decay 0.4, creates spatial depth. Parameters: in_gain, out_gain, delays, decays.',
      flagBreakdown: [
        {
          flag: 'aecho=0.8:0.88:60:0.4',
          description: 'Echo: input gain 0.8, output 0.88, delay 60ms, decay 0.4'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.wav -af "areverb=reverberance=50:room_scale=100:stereo_width=100" output.wav',
      explanation: 'Reverb effect: adds room ambience. High reverberance (50) and room scale (100) create spacious sound.',
      flagBreakdown: [
        {
          flag: 'areverb=reverberance=50:room_scale=100:stereo_width=100',
          description: 'Reverb: reverberance 50%, room scale 100%, stereo width 100%'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.wav -af "highpass=f=200,lowpass=f=8000" output.wav',
      explanation: 'Bandpass filtering: highpass removes frequencies below 200Hz, lowpass removes above 8kHz. Creates telephone-like effect.',
      flagBreakdown: [
        {
          flag: 'highpass=f=200',
          description: 'Highpass filter: remove frequencies below 200Hz'
        },
        {
          flag: 'lowpass=f=8000',
          description: 'Lowpass filter: remove frequencies above 8kHz'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Advanced Audio Filters',
      content: 'Common advanced audio filters:',
      bullets: [
        'acompressor: Dynamic range compression',
        'aecho: Echo/delay effects',
        'areverb: Reverb/room ambience',
        'equalizer: Frequency boosting/cutting',
        'highpass/lowpass: Frequency filtering',
        'anlmdn: Non-linear noise reduction',
        'alimiter: Peak limiting and normalization'
      ]
    },
    {
      type: 'bullets',
      heading: 'Audio Processing Tips',
      content: 'Best practices:',
      bullets: [
        'Chain filters with commas for sequential processing',
        'Use -af for simple chains, -filter_complex for complex graphs',
        'Test filter parameters to find optimal settings',
        'Monitor audio levels to avoid clipping',
        'Combine multiple effects for professional sound',
        'Use high-quality source audio for best results'
      ]
    },
    {
      type: 'preview',
      heading: 'Try It: Advanced Audio Filtering',
      content: 'Hear how advanced audio filters transform sound',
      code: 'ffmpeg -i sample.mp4 -af "acompressor=threshold=-20dB:ratio=4:attack=5:release=100" output.mp4',
      explanation: 'This applies dynamic range compression to smooth audio levels. Advanced audio filtering enables professional sound processing.',
      previewType: 'filter',
      sampleVideoId: 'sample-advanced-092'
    },
    {
      type: 'challenge',
      title: 'Apply Echo Effect',
      description: 'Create a command that adds echo to audio',
      requirements: [
        'Use aecho filter',
        'Set delay to 100ms',
        'Set decay to 0.5',
        'Apply to video with audio'
      ],
      hints: [
        'aecho format: in_gain:out_gain:delay:decay',
        'Delay in milliseconds',
        'Decay controls echo strength (0-1)'
      ],
      solution: 'ffmpeg -i input.mp4 -af "aecho=0.8:0.88:100:0.5" output.mp4',
      validation: {
        type: 'contains',
        value: 'aecho'
      }
    },
    {
      type: 'quiz',
      question: 'What does acompressor do in audio processing?',
      options: [
        { id: 'a', text: 'Increases dynamic range', correct: false },
        { id: 'b', text: 'Reduces dynamic range by compressing loud sounds', correct: true },
        { id: 'c', text: 'Adds reverb', correct: false },
        { id: 'd', text: 'Removes noise', correct: false }
      ],
      explanation: 'acompressor reduces dynamic range by compressing audio signals that exceed a threshold. This smooths out volume variations, making quiet parts louder and loud parts quieter, resulting in more consistent audio levels.'
    }
  ]
};
