import { type Lesson } from '@/lib/tutorial/types';

export const interactiveControlsKeyboardShortcuts: Lesson = {
  id: 'interactive-controls-keyboard-shortcuts',
  title: 'Interactive Controls (Keyboard Shortcuts)',
  module: 'FFPlay - Video Playback',
  duration: 20,
  unlockAfter: 'looping-playback',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'FFplay provides essential keyboard shortcuts for playback control. These shortcuts allow you to control playback without closing the player, making it efficient for testing and debugging.'
    },
    {
      type: 'bullets',
      heading: 'Most Useful Shortcuts',
      content: 'Essential FFplay keyboard shortcuts:',
      bullets: [
        'Space → Pause/resume playback',
        'Left/Right arrows → Seek backward/forward (small step)',
        'Up/Down arrows → Volume up/down',
        'm → Mute/unmute audio',
        'f → Toggle fullscreen mode',
        'q or Esc → Quit FFplay',
        's → Step to next frame',
        'a → Cycle through available audio channels'
      ]
    },
    {
      type: 'bullets',
      heading: 'Playback Control',
      content: 'Playback shortcuts:',
      bullets: [
        'Space: Toggle pause/resume',
        'Left Arrow: Seek backward (small step)',
        'Right Arrow: Seek forward (small step)',
        's: Step to next frame (when paused)',
        'q/Esc: Quit and close player'
      ]
    },
    {
      type: 'bullets',
      heading: 'Audio Control',
      content: 'Audio-related shortcuts:',
      bullets: [
        'Up Arrow: Increase volume',
        'Down Arrow: Decrease volume',
        'm: Mute/unmute audio',
        'a: Cycle through audio channels'
      ]
    },
    {
      type: 'bullets',
      heading: 'Display Control',
      content: 'Display and window shortcuts:',
      bullets: [
        'f: Toggle fullscreen mode',
        'w: Cycle through available video filters',
        't: Cycle through available subtitle tracks'
      ]
    },
    {
      type: 'bullets',
      heading: 'Shortcut Notes',
      content: 'Important points about shortcuts:',
      bullets: [
        'Shortcut behavior can vary slightly by build/OS',
        'These are the common core shortcuts',
        'Most shortcuts work during playback',
        'Some shortcuts require the player window to be focused',
        'Perfect for quick testing and debugging workflows'
      ]
    },
    {
      type: 'challenge',
      title: 'Practice Keyboard Shortcuts',
      description: 'Try these actions with FFplay: Start a video, pause it, seek forward, adjust volume, and toggle fullscreen',
      requirements: [
        'Start playback with ffplay',
        'Use Space to pause',
        'Use Right Arrow to seek forward',
        'Use Up Arrow to increase volume',
        'Use f to toggle fullscreen'
      ],
      hints: [
        'Space bar pauses/resumes',
        'Arrow keys control seeking and volume',
        'f key toggles fullscreen',
        'Make sure the FFplay window is focused'
      ],
      solution: 'ffplay input.mp4 (then use keyboard shortcuts)',
      validation: {
        type: 'contains',
        value: 'ffplay'
      }
    },
    {
      type: 'quiz',
      question: 'What keyboard shortcut pauses/resumes playback in FFplay?',
      options: [
        { id: 'a', text: 'p', correct: false },
        { id: 'b', text: 'Space', correct: true },
        { id: 'c', text: 'Enter', correct: false },
        { id: 'd', text: 'Ctrl+P', correct: false }
      ],
      explanation: 'The Space bar is used to pause and resume playback in FFplay. This is the most commonly used shortcut for controlling playback.'
    }
  ]
};
