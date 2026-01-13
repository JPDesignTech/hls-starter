import { Lesson } from '@/lib/tutorial/types';

export const timecodeBurnIn: Lesson = {
  id: 'timecode-burn-in',
  title: 'Timecode Burn-In',
  module: 'Common Use Cases',
  duration: 20,
  unlockAfter: 'creating-image-slideshows',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Displaying timecode directly on video frames is essential for editing, QA, and broadcast workflows. Timecode helps identify specific moments in video and is used throughout professional video production.'
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "drawtext=text=\'%{pts\\:hms}\'" output.mp4',
      explanation: 'Burn timestamp (elapsed time). Displays time in HH:MM:SS format based on presentation timestamp.',
      flagBreakdown: [
        {
          flag: '-vf "drawtext=text=\'%{pts\\:hms}\'"',
          description: 'Video filter: draw text showing elapsed time (HH:MM:SS)'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "drawtext=timecode=\'00\\:00\\:00\\:00\':rate=30" output.mp4',
      explanation: 'SMPTE timecode format. Standard timecode used in broadcast and professional editing.',
      flagBreakdown: [
        {
          flag: '-vf "drawtext=timecode=\'00\\:00\\:00\\:00\':rate=30"',
          description: 'Draw SMPTE timecode starting at 00:00:00:00, 30 fps rate'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "drawtext=text=\'%{pts\\:hms}\':fontsize=24:fontcolor=white:x=10:y=10" output.mp4',
      explanation: 'Customize timecode appearance. Set font size, color, and position on screen.',
      flagBreakdown: [
        {
          flag: 'fontsize=24',
          description: 'Set font size to 24'
        },
        {
          flag: 'fontcolor=white',
          description: 'Set text color to white'
        },
        {
          flag: 'x=10:y=10',
          description: 'Position text at coordinates (10, 10) - top-left corner'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Timecode Formats',
      content: 'Understanding timecode types:',
      bullets: [
        'Elapsed time (%{pts\\:hms}): Shows time from start of video',
        'SMPTE timecode: Standard broadcast format (HH:MM:SS:FF)',
        'SMPTE includes frame numbers (last two digits)',
        'SMPTE rate must match video frame rate',
        'Both formats useful for different workflows'
      ]
    },
    {
      type: 'bullets',
      heading: 'Use Cases',
      content: 'When to use timecode burn-in:',
      bullets: [
        'Editing workflows: Identify specific moments for cuts',
        'QA and review: Reference exact timestamps in feedback',
        'Broadcast: Standard requirement for professional content',
        'Archiving: Permanent timestamp reference',
        'Collaboration: Share specific time references with team'
      ]
    },
    {
      type: 'bullets',
      heading: 'Font Customization',
      content: 'Recommended timecode styling:',
      bullets: [
        'Use large font size (24-48) for visibility',
        'High contrast colors (white on dark, black on light)',
        'Position in corner (top-left or bottom-right)',
        'Consider background box for better readability',
        'Test on different screen sizes'
      ]
    },
    {
      type: 'challenge',
      title: 'Add Timecode',
      description: 'Add elapsed time timestamp to a video in the top-left corner with white text',
      requirements: [
        'Use drawtext filter',
        'Show elapsed time (%{pts\\:hms})',
        'Set font color to white',
        'Position at top-left (x=10, y=10)'
      ],
      hints: [
        'Use drawtext filter with text parameter',
        'Time format: %{pts\\:hms}',
        'Set fontcolor=white',
        'Set x=10:y=10 for position'
      ],
      solution: 'ffmpeg -i input.mp4 -vf "drawtext=text=\'%{pts\\:hms}\':fontcolor=white:x=10:y=10" output.mp4',
      validation: {
        type: 'contains',
        value: 'drawtext'
      }
    },
    {
      type: 'quiz',
      question: 'What is SMPTE timecode primarily used for?',
      options: [
        { id: 'a', text: 'Web video streaming', correct: false },
        { id: 'b', text: 'Broadcast and professional editing workflows', correct: true },
        { id: 'c', text: 'Social media content', correct: false },
        { id: 'd', text: 'Personal video editing', correct: false }
      ],
      explanation: 'SMPTE timecode is the standard timecode format used in broadcast television and professional video editing. It includes frame numbers and is essential for frame-accurate editing and broadcast workflows.'
    }
  ]
};
