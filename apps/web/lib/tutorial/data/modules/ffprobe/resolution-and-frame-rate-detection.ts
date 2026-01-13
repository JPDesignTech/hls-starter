import { type Lesson } from '@/lib/tutorial/types';

export const resolutionAndFrameRateDetection: Lesson = {
  id: 'resolution-and-frame-rate-detection',
  title: 'Resolution and Frame Rate Detection',
  module: 'FFProbe - Media Analysis',
  duration: 15,
  unlockAfter: 'duration-and-bitrate-analysis',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Detecting video stream properties like resolution and frame rate is essential for quality control, compatibility checks, and automated processing pipelines.'
    },
    {
      type: 'code',
      command: 'ffprobe -select_streams v -show_entries stream=width,height input.mp4',
      explanation: 'Extract video resolution. Returns width and height in pixels.',
      flagBreakdown: [
        {
          flag: '-select_streams v',
          description: 'Select video streams'
        },
        {
          flag: '-show_entries stream=width,height',
          description: 'Show width and height fields from stream'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffprobe -select_streams v -show_entries stream=r_frame_rate input.mp4',
      explanation: 'Extract frame rate. Returns frame rate as a fraction (e.g., 30/1 for 30 fps).',
      flagBreakdown: [
        {
          flag: '-select_streams v',
          description: 'Select video streams'
        },
        {
          flag: '-show_entries stream=r_frame_rate',
          description: 'Show frame rate (r_frame_rate) field'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffprobe -select_streams v -show_entries stream=width,height,r_frame_rate -v quiet input.mp4',
      explanation: 'Extract all video properties together. Combine resolution and frame rate for complete video stream information.',
      flagBreakdown: [
        {
          flag: '-select_streams v',
          description: 'Select video streams'
        },
        {
          flag: '-show_entries stream=width,height,r_frame_rate',
          description: 'Show width, height, and frame rate'
        },
        {
          flag: '-v quiet',
          description: 'Quiet mode for clean output'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Video Properties',
      content: 'Key video stream properties:',
      bullets: [
        'width: Video width in pixels',
        'height: Video height in pixels',
        'r_frame_rate: Frame rate as fraction (e.g., 30/1 = 30 fps)',
        'avg_frame_rate: Average frame rate (useful for VFR)',
        'display_aspect_ratio: Display aspect ratio'
      ]
    },
    {
      type: 'quiz',
      question: 'What does r_frame_rate represent?',
      options: [
        { id: 'a', text: 'Video resolution', correct: false },
        { id: 'b', text: 'Frame rate as a fraction', correct: true },
        { id: 'c', text: 'Bitrate', correct: false },
        { id: 'd', text: 'Duration', correct: false }
      ],
      explanation: 'r_frame_rate represents the frame rate as a fraction (e.g., 30/1 for 30 fps, 29.97/1 for 29.97 fps). This is the raw frame rate from the stream.'
    }
  ]
};
