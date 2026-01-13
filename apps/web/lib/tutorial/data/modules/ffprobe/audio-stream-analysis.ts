import { type Lesson } from '@/lib/tutorial/types';

export const audioStreamAnalysis: Lesson = {
  id: 'audio-stream-analysis',
  title: 'Audio Stream Analysis',
  module: 'FFProbe - Media Analysis',
  duration: 15,
  unlockAfter: 'resolution-and-frame-rate-detection',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Analyzing audio stream properties provides detailed information about audio codecs, channels, sample rates, and bitrates. This is essential for audio processing workflows and quality control.'
    },
    {
      type: 'code',
      command: 'ffprobe -select_streams a -show_streams input.mp4',
      explanation: 'Display detailed audio stream information. Shows codec, channels, sample rate, bitrate, and other audio properties.',
      flagBreakdown: [
        {
          flag: '-select_streams a',
          description: 'Select audio streams only'
        },
        {
          flag: '-show_streams',
          description: 'Show detailed stream information'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'bullets',
      heading: 'Useful Audio Fields',
      content: 'Key audio stream properties include:',
      bullets: [
        'channels: Number of audio channels (1=mono, 2=stereo)',
        'sample_rate: Sample rate in Hz (e.g., 44100, 48000)',
        'bit_rate: Audio bitrate in bits per second',
        'codec_name: Audio codec (aac, mp3, opus, etc.)',
        'channel_layout: Channel arrangement (mono, stereo, 5.1, etc.)'
      ]
    },
    {
      type: 'code',
      command: 'ffprobe -select_streams a -show_entries stream=channels,sample_rate,codec_name -v quiet input.mp4',
      explanation: 'Extract specific audio properties. Get channels, sample rate, and codec name in quiet mode for scripting.',
      flagBreakdown: [
        {
          flag: '-select_streams a',
          description: 'Select audio streams'
        },
        {
          flag: '-show_entries stream=channels,sample_rate,codec_name',
          description: 'Show channels, sample rate, and codec name'
        },
        {
          flag: '-v quiet',
          description: 'Quiet mode'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Audio Analysis Use Cases',
      content: 'When to analyze audio streams:',
      bullets: [
        'Quality control: Verify expected audio properties',
        'Compatibility checks: Check codec and sample rate support',
        'Processing preparation: Understand audio before transcoding',
        'Debugging: Identify audio-related issues',
        'Automation: Extract audio metadata for scripts'
      ]
    },
    {
      type: 'quiz',
      question: 'What does sample_rate represent?',
      options: [
        { id: 'a', text: 'Number of audio channels', correct: false },
        { id: 'b', text: 'Samples per second in Hz', correct: true },
        { id: 'c', text: 'Audio bitrate', correct: false },
        { id: 'd', text: 'Audio duration', correct: false }
      ],
      explanation: 'sample_rate represents the number of audio samples per second, measured in Hz. Common values are 44100 Hz (CD quality) and 48000 Hz (professional audio).'
    }
  ]
};
