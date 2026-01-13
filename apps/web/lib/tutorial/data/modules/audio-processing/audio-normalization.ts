import { Lesson } from '@/lib/tutorial/types';

export const audioNormalization: Lesson = {
  id: 'audio-normalization',
  title: 'Audio Normalization',
  module: 'Audio Processing',
  duration: 25,
  unlockAfter: 'audio-channel-manipulation',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Audio normalization balances volume levels across audio files. This is essential for consistent loudness, avoiding clipping, and meeting podcast and broadcast standards. FFmpeg offers simple peak normalization and advanced loudness normalization.'
    },
    {
      type: 'diagram',
      title: 'Normalization Process',
      diagram: `flowchart LR
    Input[Input Audio] --> Analyze[Analyze Audio Levels]
    Analyze --> Method{Method}
    Method -->|Peak| Peak[Peak Normalization<br/>volume filter]
    Method -->|Loudness| Loudnorm[loudnorm Filter<br/>EBU R128]
    Peak --> Adjust[Adjust Volume]
    Loudnorm --> AnalyzeLoud[Analyze Perceived Loudness]
    AnalyzeLoud --> AdjustLoud[Adjust to Target LUFS]
    Adjust --> Output[Output Audio]
    AdjustLoud --> Output`,
      explanation: 'Normalization process: Input audio is analyzed, then normalized using either peak normalization (simple volume adjustment) or loudness normalization (perceived loudness based on EBU R128 standard). Loudness normalization is preferred for professional workflows.',
      diagramType: 'mermaid',
      diagramFormat: 'flowchart'
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.wav -af "volume=1.5" output.wav',
      explanation: 'Simple peak normalization by multiplying volume. This increases volume by 50% (1.5×). Use values less than 1.0 to decrease volume.',
      flagBreakdown: [
        {
          flag: '-af "volume=1.5"',
          description: 'Audio filter: multiply volume by 1.5 (50% increase)'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.wav -af loudnorm output.wav',
      explanation: 'Loudness normalization using the loudnorm filter. This is recommended for professional workflows as it normalizes perceived loudness, not just peak levels.',
      flagBreakdown: [
        {
          flag: '-af loudnorm',
          description: 'Apply loudness normalization filter (EBU R128 standard)'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.wav -af loudnorm=I=-16:TP=-1.5:LRA=11 output.wav',
      explanation: 'Advanced loudnorm with specific parameters. I is integrated loudness target, TP is true peak, LRA is loudness range.',
      flagBreakdown: [
        {
          flag: '-af loudnorm=I=-16:TP=-1.5:LRA=11',
          description: 'Loudness normalization: I=-16 LUFS (target), TP=-1.5 dB (true peak), LRA=11 (loudness range)'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Normalization Methods',
      content: 'Understanding different normalization approaches:',
      bullets: [
        'Peak normalization (volume filter): Simple volume adjustment based on peak levels',
        'Loudness normalization (loudnorm): Normalizes perceived loudness, preferred for professional use',
        'EBU R128: Broadcast standard for loudness normalization',
        'loudnorm is used heavily in streaming and broadcast',
        'Peak normalization can cause clipping if not careful'
      ]
    },
    {
      type: 'bullets',
      heading: 'Loudnorm Parameters',
      content: 'Key loudnorm parameters:',
      bullets: [
        'I (Integrated Loudness): Target loudness in LUFS (typically -16 to -23)',
        'TP (True Peak): Maximum peak level in dB (typically -1.5 to -2.0)',
        'LRA (Loudness Range): Dynamic range in LU (typically 7-20)',
        'Lower I values = louder output',
        'TP prevents clipping by limiting peak levels'
      ]
    },
    {
      type: 'challenge',
      title: 'Normalize Audio',
      description: 'Apply loudness normalization to an audio file',
      requirements: [
        'Use -i for input file',
        'Use -af loudnorm for normalization',
        'Output should be normalized audio'
      ],
      hints: [
        'The loudnorm filter is applied with -af',
        'loudnorm normalizes perceived loudness',
        'This is preferred over simple volume adjustment'
      ],
      solution: 'ffmpeg -i input.wav -af loudnorm output.wav',
      validation: {
        type: 'contains',
        value: 'loudnorm'
      }
    },
    {
      type: 'quiz',
      question: 'What is the advantage of loudnorm over simple volume adjustment?',
      options: [
        { id: 'a', text: 'It\'s faster', correct: false },
        { id: 'b', text: 'It normalizes perceived loudness, not just peak levels', correct: true },
        { id: 'c', text: 'It reduces file size', correct: false },
        { id: 'd', text: 'It changes the audio format', correct: false }
      ],
      explanation: 'loudnorm normalizes perceived loudness based on how humans hear, not just peak levels. This provides more consistent results across different audio content and is preferred for professional workflows.'
    }
  ]
};
