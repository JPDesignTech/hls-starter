import { type Lesson } from '@/lib/tutorial/types';

export const videoStreamAnalysis: Lesson = {
  id: 'video-stream-analysis',
  title: 'Video Stream Analysis',
  module: 'FFProbe - Media Analysis',
  duration: 15,
  unlockAfter: 'audio-stream-analysis',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Analyzing video stream properties provides comprehensive information about video codecs, resolution, frame rates, pixel formats, and codec profiles. This is essential for video processing workflows.'
    },
    {
      type: 'code',
      command: 'ffprobe -select_streams v -show_streams input.mp4',
      explanation: 'Display detailed video stream information. Shows codec, resolution, frame rate, pixel format, codec profile, and other video properties.',
      flagBreakdown: [
        {
          flag: '-select_streams v',
          description: 'Select video streams only'
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
      heading: 'Useful Video Fields',
      content: 'Key video stream properties include:',
      bullets: [
        'width, height: Video resolution in pixels',
        'r_frame_rate: Frame rate as fraction',
        'pix_fmt: Pixel format (yuv420p, yuv422p, etc.)',
        'codec_name: Video codec (h264, hevc, vp9, etc.)',
        'profile: Codec profile (baseline, main, high, etc.)',
        'bit_rate: Video bitrate in bits per second'
      ]
    },
    {
      type: 'code',
      command: 'ffprobe -select_streams v -show_entries stream=codec_name,width,height,r_frame_rate -v quiet input.mp4',
      explanation: 'Extract key video properties. Get codec, resolution, and frame rate in quiet mode for automation.',
      flagBreakdown: [
        {
          flag: '-select_streams v',
          description: 'Select video streams'
        },
        {
          flag: '-show_entries stream=codec_name,width,height,r_frame_rate',
          description: 'Show codec, width, height, and frame rate'
        },
        {
          flag: '-v quiet',
          description: 'Quiet mode'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Video Analysis Use Cases',
      content: 'When to analyze video streams:',
      bullets: [
        'Quality control: Verify expected video properties',
        'Compatibility checks: Check codec and resolution support',
        'Processing preparation: Understand video before transcoding',
        'Debugging: Identify video-related issues',
        'Automation: Extract video metadata for scripts'
      ]
    },
    {
      type: 'quiz',
      question: 'What does pix_fmt represent?',
      options: [
        { id: 'a', text: 'Pixel format (color space and bit depth)', correct: true },
        { id: 'b', text: 'Frame rate', correct: false },
        { id: 'c', text: 'Video codec', correct: false },
        { id: 'd', text: 'Video resolution', correct: false }
      ],
      explanation: 'pix_fmt represents the pixel format, which defines the color space and bit depth (e.g., yuv420p, yuv422p). This is important for compatibility and processing.'
    }
  ]
};
