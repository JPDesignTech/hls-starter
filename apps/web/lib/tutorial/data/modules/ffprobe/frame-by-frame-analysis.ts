import { Lesson } from '@/lib/tutorial/types';

export const frameByFrameAnalysis: Lesson = {
  id: 'frame-by-frame-analysis',
  title: 'Frame-by-Frame Analysis',
  module: 'FFProbe - Media Analysis',
  duration: 20,
  unlockAfter: 'stream-analysis',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Inspecting individual frames provides detailed information about each frame\'s timestamp, type, and properties. This is useful for debugging frame drops, motion analysis, and timestamp inspection, but produces very large output.'
    },
    {
      type: 'code',
      command: 'ffprobe -show_frames input.mp4',
      explanation: 'Display information for every frame. This produces extensive output with details about each frame including timestamps, frame type, and size.',
      flagBreakdown: [
        {
          flag: '-show_frames',
          description: 'Display detailed information for every frame'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'bullets',
      heading: 'Frame Information',
      content: 'Frame analysis provides:',
      bullets: [
        'Frame timestamps: Presentation timestamp (PTS) for each frame',
        'Frame type: I-frame, P-frame, or B-frame',
        'Frame size: Size of frame data in bytes',
        'Keyframe status: Whether frame is a keyframe',
        'Duration: Time duration of the frame'
      ]
    },
    {
      type: 'bullets',
      heading: 'Use Cases',
      content: 'When to use frame-by-frame analysis:',
      bullets: [
        'Debugging frame drops: Identify missing or corrupted frames',
        'Motion analysis: Analyze frame timestamps and intervals',
        'Timestamp inspection: Verify frame timing accuracy',
        'Quality control: Check frame types and keyframe distribution',
        'Variable frame rate: Analyze VFR content'
      ]
    },
    {
      type: 'bullets',
      heading: 'Important Warning',
      content: 'Frame analysis considerations:',
      bullets: [
        '⚠️ Produces very large output - can be gigabytes for long videos',
        'Use with caution on long videos',
        'Consider piping to file: ffprobe -show_frames input.mp4 > frames.txt',
        'May take significant time to process',
        'Use -select_streams to limit to specific stream'
      ]
    },
    {
      type: 'code',
      command: 'ffprobe -select_streams v:0 -show_frames input.mp4',
      explanation: 'Limit frame analysis to first video stream only. This reduces output size by analyzing only one stream.',
      flagBreakdown: [
        {
          flag: '-select_streams v:0',
          description: 'Select only the first video stream (index 0)'
        },
        {
          flag: '-show_frames',
          description: 'Show frame information'
        }
      ]
    },
    {
      type: 'quiz',
      question: 'What is a potential issue with using -show_frames?',
      options: [
        { id: 'a', text: 'It modifies the video file', correct: false },
        { id: 'b', text: 'It produces very large output files', correct: true },
        { id: 'c', text: 'It only works on audio files', correct: false },
        { id: 'd', text: 'It requires internet connection', correct: false }
      ],
      explanation: '-show_frames produces detailed information for every frame, which can result in very large output files, especially for long videos. Consider using -select_streams to limit the analysis.'
    }
  ]
};
