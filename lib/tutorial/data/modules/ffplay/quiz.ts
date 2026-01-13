import { ModuleQuiz } from '@/lib/tutorial/types/module-quiz';

export const ffplayQuiz: ModuleQuiz = {
  id: 'ffplay-quiz',
  moduleId: 'ffplay',
  title: 'FFPlay Mastery Quiz',
  description: 'Test your understanding of video playback, window controls, looping, keyboard shortcuts, audio/subtitle selection, and stream testing using FFPlay.',
  passingScore: 70,
  questions: [
    // Multiple-choice questions from lessons
    {
      type: 'multiple-choice',
      id: 'mc-1',
      question: 'What is FFPlay primarily designed for?',
      options: [
        { id: 'a', text: 'Full-featured media editing', correct: false },
        { id: 'b', text: 'Quick playback and debugging for developers', correct: true },
        { id: 'c', text: 'Professional video production', correct: false },
        { id: 'd', text: 'Streaming to large audiences', correct: false }
      ],
      explanation: 'FFPlay is a lightweight media player designed for developers and media workflows, providing quick playback and debugging capabilities rather than full editing features.',
      weight: 1,
      source: 'introduction-to-ffplay'
    },
    {
      type: 'multiple-choice',
      id: 'mc-2',
      question: 'What keyboard shortcut pauses/resumes playback in FFPlay?',
      options: [
        { id: 'a', text: 'p', correct: false },
        { id: 'b', text: 'Space', correct: true },
        { id: 'c', text: 'Enter', correct: false },
        { id: 'd', text: 'Ctrl+P', correct: false }
      ],
      explanation: 'The Space bar is used to pause and resume playback in FFPlay. This is the most commonly used shortcut for controlling playback.',
      weight: 1,
      source: 'interactive-controls-keyboard-shortcuts'
    },
    {
      type: 'multiple-choice',
      id: 'mc-3',
      question: 'What does the -an flag do in FFPlay?',
      options: [
        { id: 'a', text: 'Enables audio', correct: false },
        { id: 'b', text: 'Disables audio output', correct: true },
        { id: 'c', text: 'Normalizes audio', correct: false },
        { id: 'd', text: 'Adjusts audio volume', correct: false }
      ],
      explanation: 'The -an flag disables audio output, allowing you to play video without sound. This is useful for testing video-only playback.',
      weight: 1,
      source: 'basic-video-playback'
    },
    {
      type: 'multiple-choice',
      id: 'mc-4',
      question: 'What does -x 1280 -y 720 do?',
      options: [
        { id: 'a', text: 'Changes video resolution to 1280x720', correct: false },
        { id: 'b', text: 'Sets the playback window size to 1280x720', correct: true },
        { id: 'c', text: 'Crops the video to 1280x720', correct: false },
        { id: 'd', text: 'Scales the video file size', correct: false }
      ],
      explanation: 'The -x and -y flags set the playback window dimensions, not the video resolution. The video will be scaled to fit within this window size.',
      weight: 1,
      source: 'window-size-control'
    },
    {
      type: 'multiple-choice',
      id: 'mc-5',
      question: 'How do you toggle fullscreen mode during playback?',
      options: [
        { id: 'a', text: 'Press F11', correct: false },
        { id: 'b', text: 'Press f key', correct: true },
        { id: 'c', text: 'Press Ctrl+F', correct: false },
        { id: 'd', text: 'Right-click and select fullscreen', correct: false }
      ],
      explanation: 'Press the f key to toggle fullscreen mode on and off during playback. You can also start in fullscreen using the -fs flag.',
      weight: 1,
      source: 'full-screen-mode'
    },
    {
      type: 'multiple-choice',
      id: 'mc-6',
      question: 'What does -loop 0 do?',
      options: [
        { id: 'a', text: 'Plays once and stops', correct: false },
        { id: 'b', text: 'Loops forever', correct: true },
        { id: 'c', text: 'Plays at 0x speed', correct: false },
        { id: 'd', text: 'Disables looping', correct: false }
      ],
      explanation: 'The -loop flag with value 0 means infinite loops. The video will restart automatically when it ends, continuing indefinitely until you stop playback.',
      weight: 1,
      source: 'looping-playback'
    },
    {
      type: 'multiple-choice',
      id: 'mc-7',
      question: 'What does -ss 60 do in FFPlay?',
      options: [
        { id: 'a', text: 'Plays at 60x speed', correct: false },
        { id: 'b', text: 'Starts playback at 60 seconds', correct: true },
        { id: 'c', text: 'Plays for 60 seconds', correct: false },
        { id: 'd', text: 'Sets volume to 60%', correct: false }
      ],
      explanation: 'The -ss flag seeks to a specific time before starting playback. -ss 60 starts playback at 60 seconds from the beginning of the video.',
      weight: 1,
      source: 'starting-playback-from-specific-time'
    },
    {
      type: 'multiple-choice',
      id: 'mc-8',
      question: 'How do you load external subtitles in FFPlay?',
      options: [
        { id: 'a', text: 'Use -sub flag', correct: false },
        { id: 'b', text: 'Use -vf "subtitles=file.srt"', correct: true },
        { id: 'c', text: 'Use -srt flag', correct: false },
        { id: 'd', text: 'Subtitles load automatically', correct: false }
      ],
      explanation: 'External subtitles are loaded using the subtitles video filter with -vf flag. The syntax is -vf "subtitles=filename.srt".',
      weight: 1,
      source: 'subtitle-display'
    },
    // Command-builder questions
    {
      type: 'command-builder',
      id: 'cb-1',
      title: 'Play Video in Fullscreen',
      description: 'Write an FFPlay command to play input.mp4 in fullscreen mode.',
      requirements: [
        'Use ffplay command',
        'Use -fs flag for fullscreen',
        'Input file is input.mp4'
      ],
      hints: [
        'Start with ffplay',
        'Use -fs flag to enable fullscreen',
        'Input file comes last'
      ],
      solution: 'ffplay -fs input.mp4',
      validation: {
        type: 'contains',
        value: '-fs'
      },
      weight: 2,
      explanation: 'The -fs flag launches FFPlay in fullscreen mode immediately. You can also toggle fullscreen during playback using the f key.',
      sampleVideoId: 'sample-1'
    },
    {
      type: 'command-builder',
      id: 'cb-2',
      title: 'Set Window Size',
      description: 'Write an FFPlay command to play input.mp4 with a window size of 1280x720 pixels.',
      requirements: [
        'Use ffplay command',
        'Use -x flag for width (1280)',
        'Use -y flag for height (720)',
        'Input file is input.mp4'
      ],
      hints: [
        'Window width is set with -x flag',
        'Window height is set with -y flag',
        'Both flags are needed together'
      ],
      solution: 'ffplay -x 1280 -y 720 input.mp4',
      validation: {
        type: 'contains',
        value: '-x 1280 -y 720'
      },
      weight: 2,
      explanation: 'The -x and -y flags set the playback window dimensions. The video will be scaled to fit within this window size, which is useful for demos and screen recording.',
      sampleVideoId: 'sample-1'
    },
    {
      type: 'command-builder',
      id: 'cb-3',
      title: 'Start Playback from Specific Time',
      description: 'Write an FFPlay command to start playing input.mp4 from 30 seconds into the video.',
      requirements: [
        'Use ffplay command',
        'Use -ss flag with time value (30)',
        'Input file is input.mp4'
      ],
      hints: [
        'The -ss flag seeks to a specific time',
        'Time can be specified in seconds',
        'Place -ss before the input file'
      ],
      solution: 'ffplay -ss 30 input.mp4',
      validation: {
        type: 'contains',
        value: '-ss 30'
      },
      weight: 2,
      explanation: 'The -ss flag seeks to the specified time before starting playback. This is great for testing specific sections without watching from the beginning.',
      sampleVideoId: 'sample-1'
    },
    {
      type: 'command-builder',
      id: 'cb-4',
      title: 'Loop Playback',
      description: 'Write an FFPlay command to loop input.mp4 5 times.',
      requirements: [
        'Use ffplay command',
        'Use -loop flag with value 5',
        'Input file is input.mp4'
      ],
      hints: [
        'The -loop flag controls looping behavior',
        'A number specifies how many times to loop',
        'Place -loop before the input file'
      ],
      solution: 'ffplay -loop 5 input.mp4',
      validation: {
        type: 'contains',
        value: '-loop 5'
      },
      weight: 2,
      explanation: 'The -loop flag with a number loops the video that many times. Use -loop 0 for infinite loops. This is perfect for verifying color grading or A/V sync in repeated segments.',
      sampleVideoId: 'sample-1'
    },
    {
      type: 'command-builder',
      id: 'cb-5',
      title: 'Play Video with Subtitles',
      description: 'Write an FFPlay command to play input.mp4 with external subtitles from subtitles.srt file.',
      requirements: [
        'Use ffplay command',
        'Use -vf flag with subtitles filter',
        'Specify subtitles.srt in the filter',
        'Input file is input.mp4'
      ],
      hints: [
        'Use -vf flag for video filters',
        'Subtitle filter syntax: subtitles=filename',
        'Quote the filter string'
      ],
      solution: 'ffplay -vf "subtitles=subtitles.srt" input.mp4',
      validation: {
        type: 'contains',
        value: 'subtitles=subtitles.srt'
      },
      weight: 2,
      explanation: 'External subtitles are loaded using the subtitles video filter with -vf flag. This allows you to verify subtitle rendering, timing alignment, and font rendering.',
      sampleVideoId: 'sample-1'
    }
  ]
};
