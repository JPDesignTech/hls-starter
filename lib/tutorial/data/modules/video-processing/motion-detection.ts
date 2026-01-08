import { Lesson } from '@/lib/tutorial/types';

export const motionDetection: Lesson = {
  id: 'motion-detection',
  title: 'Motion Detection',
  module: 'Video Processing',
  duration: 20,
  unlockAfter: 'chroma-keying',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'While FFmpeg doesn\'t have a dedicated motion detection filter, it does have scene change detection which can be repurposed to detect motion or significant changes between frames.'
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "select=\'gt(scene,0.1)\',showinfo" -f null -',
      explanation: 'Analyze video and print info for frames where scene change value exceeds 0.1 (10% difference). High scene values indicate cuts or big motion.',
      flagBreakdown: [
        {
          flag: '-vf "select=\'gt(scene,0.1)\',showinfo"',
          description: 'Select frames with scene change > 0.1 and show frame info'
        },
        {
          flag: '-f null -',
          description: 'No output file, just analysis'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i feed.mp4 -vf "select=\'gt(scene,0.003)\',out=frames%03d.jpg"',
      explanation: 'Extract image frames when differences exceed threshold (0.3% in this example) - effectively capturing moments when motion happens.',
      flagBreakdown: [
        {
          flag: '-vf "select=\'gt(scene,0.003)\'"',
          description: 'Select frames where scene change exceeds 0.003 (0.3%)'
        },
        {
          flag: 'out=frames%03d.jpg',
          description: 'Output pattern for extracted frames'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Threshold Tuning',
      content: 'Tips for motion detection:',
      bullets: [
        'Lower threshold (0.003): More sensitive, detects smaller motions',
        'Higher threshold (0.1): Less sensitive, only detects significant changes',
        'Scene detection works best on mostly static scenes',
        'Requires scripting around FFmpeg to act on detections'
      ]
    },
    {
      type: 'quiz',
      question: 'How does FFmpeg detect motion?',
      options: [
        { id: 'a', text: 'Using a dedicated motion filter', correct: false },
        { id: 'b', text: 'Using scene change detection to identify frame differences', correct: true },
        { id: 'c', text: 'Analyzing audio frequencies', correct: false },
        { id: 'd', text: 'Comparing file sizes', correct: false }
      ],
      explanation: 'FFmpeg uses scene change detection (the scene parameter) to identify differences between consecutive frames. When the difference exceeds a threshold, it indicates motion or scene changes.'
    }
  ]
};
