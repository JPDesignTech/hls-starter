import { type Lesson } from '@/lib/tutorial/types';

export const frameTimestampAnalysis: Lesson = {
  id: 'frame-timestamp-analysis',
  title: 'Frame Timestamp Analysis',
  module: 'FFProbe - Media Analysis',
  duration: 20,
  unlockAfter: 'extracting-specific-metadata-fields',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Inspecting frame-level timestamps is essential for sync debugging, variable frame rate (VFR) analysis, and troubleshooting playback issues. Frame timestamps determine when each frame should be displayed.'
    },
    {
      type: 'code',
      command: 'ffprobe -show_entries frame=pkt_pts_time -select_streams v input.mp4',
      explanation: 'Extract frame presentation timestamps. Shows when each frame should be displayed, measured in seconds from the start.',
      flagBreakdown: [
        {
          flag: '-show_entries frame=pkt_pts_time',
          description: 'Show presentation timestamp (PTS) for each frame in seconds'
        },
        {
          flag: '-select_streams v',
          description: 'Select video streams only'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffprobe -show_entries frame=pkt_pts_time,pkt_dts_time -select_streams v input.mp4',
      explanation: 'Extract both presentation (PTS) and decoding (DTS) timestamps. DTS is when frame should be decoded, PTS is when it should be displayed.',
      flagBreakdown: [
        {
          flag: '-show_entries frame=pkt_pts_time,pkt_dts_time',
          description: 'Show both presentation and decoding timestamps'
        },
        {
          flag: '-select_streams v',
          description: 'Select video streams'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Timestamp Types',
      content: 'Understanding frame timestamps:',
      bullets: [
        'pkt_pts_time: Presentation timestamp (when frame should be displayed)',
        'pkt_dts_time: Decoding timestamp (when frame should be decoded)',
        'PTS and DTS may differ for B-frames',
        'Timestamps are in seconds from start',
        'Useful for analyzing frame timing and sync'
      ]
    },
    {
      type: 'bullets',
      heading: 'Use Cases',
      content: 'When to analyze frame timestamps:',
      bullets: [
        'Sync debugging: Identify audio/video sync issues',
        'VFR analysis: Analyze variable frame rate content',
        'Playback issues: Troubleshoot frame timing problems',
        'Quality control: Verify consistent frame timing',
        'Frame drops: Identify missing or duplicate frames'
      ]
    },
    {
      type: 'code',
      command: 'ffprobe -show_entries frame=pkt_pts_time -select_streams v -v quiet input.mp4',
      explanation: 'Extract timestamps in quiet mode. Useful for scripting and automation.',
      flagBreakdown: [
        {
          flag: '-show_entries frame=pkt_pts_time',
          description: 'Show frame timestamps'
        },
        {
          flag: '-select_streams v',
          description: 'Select video streams'
        },
        {
          flag: '-v quiet',
          description: 'Quiet mode for clean output'
        }
      ]
    },
    {
      type: 'quiz',
      question: 'What is the difference between PTS and DTS?',
      options: [
        { id: 'a', text: 'PTS is when frame should be decoded, DTS is when displayed', correct: false },
        { id: 'b', text: 'PTS is when frame should be displayed, DTS is when decoded', correct: true },
        { id: 'c', text: 'There is no difference', correct: false },
        { id: 'd', text: 'PTS is for audio, DTS is for video', correct: false }
      ],
      explanation: 'PTS (Presentation Timestamp) is when a frame should be displayed, while DTS (Decoding Timestamp) is when it should be decoded. They may differ for B-frames which need to be decoded out of order.'
    }
  ]
};
