import { Lesson } from '@/lib/tutorial/types';

export const audioMixingAndMerging: Lesson = {
  id: 'audio-mixing-and-merging',
  title: 'Audio Mixing and Merging',
  module: 'Audio Processing',
  duration: 25,
  unlockAfter: 'audio-normalization',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Combining multiple audio tracks is essential for music production, podcast creation, and sound design. FFmpeg\'s amix filter allows you to merge multiple audio streams, and you can control the volume balance of each track before mixing.'
    },
    {
      type: 'diagram',
      title: 'Audio Mixing Flow',
      diagram: '',
      explanation: 'Audio mixing process: Multiple input streams flow through volume adjustment filters, then combine in the amix filter to create a single mixed output stream.',
      diagramType: 'react-flow',
      reactFlowData: {
        nodes: [
          {
            id: 'input1',
            label: 'Input 1\nvoice.wav',
            position: { x: 0, y: 0 },
            type: 'input'
          },
          {
            id: 'input2',
            label: 'Input 2\nmusic.wav',
            position: { x: 0, y: 150 },
            type: 'input'
          },
          {
            id: 'volume1',
            label: 'Volume Filter\nvolume=1.0',
            position: { x: 200, y: 0 },
            type: 'default'
          },
          {
            id: 'volume2',
            label: 'Volume Filter\nvolume=0.4',
            position: { x: 200, y: 150 },
            type: 'default'
          },
          {
            id: 'amix',
            label: 'amix Filter\ninputs=2',
            position: { x: 400, y: 75 },
            type: 'default'
          },
          {
            id: 'output',
            label: 'Output\nmixed.wav',
            position: { x: 600, y: 75 },
            type: 'output'
          }
        ],
        edges: [
          {
            id: 'e1',
            source: 'input1',
            target: 'volume1',
            label: '[0:a]'
          },
          {
            id: 'e2',
            source: 'input2',
            target: 'volume2',
            label: '[1:a]'
          },
          {
            id: 'e3',
            source: 'volume1',
            target: 'amix',
            label: '[a0]'
          },
          {
            id: 'e4',
            source: 'volume2',
            target: 'amix',
            label: '[a1]'
          },
          {
            id: 'e5',
            source: 'amix',
            target: 'output'
          }
        ]
      }
    },
    {
      type: 'code',
      command: 'ffmpeg -i voice.wav -i music.wav -filter_complex amix=inputs=2 output.wav',
      explanation: 'Mix two audio files together. The amix filter combines multiple audio inputs into a single output.',
      flagBreakdown: [
        {
          flag: '-i voice.wav',
          description: 'First input: voice audio'
        },
        {
          flag: '-i music.wav',
          description: 'Second input: music audio'
        },
        {
          flag: '-filter_complex amix=inputs=2',
          description: 'Mix filter: combine 2 input streams'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i voice.wav -i music.wav -filter_complex "[0:a]volume=1[a0];[1:a]volume=0.4[a1];[a0][a1]amix=2" output.wav',
      explanation: 'Control volume balance before mixing. Set voice to full volume (1.0) and music to 40% volume (0.4) so voice remains clear.',
      flagBreakdown: [
        {
          flag: '[0:a]volume=1[a0]',
          description: 'Set first audio stream volume to 1.0 (100%)'
        },
        {
          flag: '[1:a]volume=0.4[a1]',
          description: 'Set second audio stream volume to 0.4 (40%)'
        },
        {
          flag: '[a0][a1]amix=2',
          description: 'Mix the two volume-adjusted audio streams'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i track1.wav -i track2.wav -i track3.wav -filter_complex amix=inputs=3 output.wav',
      explanation: 'Mix three or more audio files. Increase the inputs parameter to match the number of audio files.',
      flagBreakdown: [
        {
          flag: 'amix=inputs=3',
          description: 'Mix 3 input audio streams together'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Mixing Best Practices',
      content: 'Tips for effective audio mixing:',
      bullets: [
        'Adjust volumes before mixing for clarity',
        'Voice typically should be louder than background music',
        'Use volume values between 0.0 and 1.0 (or higher for amplification)',
        'amix merges streams - useful for music + voice, multi-language tracks, sound effects',
        'Test the mix to ensure all elements are audible'
      ]
    },
    {
      type: 'preview',
      heading: 'Try It: Mix Audio Tracks',
      content: 'Mix voice and background music with volume control',
      code: 'ffmpeg -i voice.wav -i music.wav -filter_complex "[0:a]volume=1[a0];[1:a]volume=0.4[a1];[a0][a1]amix=2" output.wav',
      explanation: 'This mixes voice at full volume with music at 40% volume',
      previewType: 'filter',
      sampleVideoId: 'sample-audio-mix-001'
    },
    {
      type: 'challenge',
      title: 'Mix Audio with Volume Control',
      description: 'Mix two audio files with voice at full volume and music at 50% volume',
      requirements: [
        'Use two input files',
        'Set voice volume to 1.0',
        'Set music volume to 0.5',
        'Use amix to combine them'
      ],
      hints: [
        'Use -filter_complex with volume filters first',
        'Then use amix to combine the adjusted streams',
        'Volume syntax: [0:a]volume=1.0[a0]'
      ],
      solution: 'ffmpeg -i voice.wav -i music.wav -filter_complex "[0:a]volume=1[a0];[1:a]volume=0.5[a1];[a0][a1]amix=2" output.wav',
      validation: {
        type: 'contains',
        value: 'amix'
      }
    },
    {
      type: 'quiz',
      question: 'What does the amix filter do?',
      options: [
        { id: 'a', text: 'Converts audio format', correct: false },
        { id: 'b', text: 'Merges multiple audio streams into one', correct: true },
        { id: 'c', text: 'Extracts audio from video', correct: false },
        { id: 'd', text: 'Normalizes audio volume', correct: false }
      ],
      explanation: 'The amix filter merges multiple audio input streams into a single output stream, allowing you to combine music, voice, and other audio tracks.'
    }
  ]
};
