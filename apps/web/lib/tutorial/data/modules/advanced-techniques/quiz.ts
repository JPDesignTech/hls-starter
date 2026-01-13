import { type ModuleQuiz } from '@/lib/tutorial/types/module-quiz';

export const advancedTechniquesQuiz: ModuleQuiz = {
  id: 'advanced-techniques-quiz',
  moduleId: 'advanced-techniques',
  title: 'Advanced Techniques Mastery Quiz',
  description: 'Test your understanding of advanced FFmpeg workflows including complex filter graphs, multiple input processing, advanced video/audio filtering, script automation, and error handling.',
  passingScore: 70,
  questions: [
    // Multiple-choice questions from lessons
    {
      type: 'multiple-choice',
      id: 'mc-1',
      question: 'In a filter graph, what separates filters in the same chain?',
      options: [
        { id: 'a', text: 'Semicolons (;)', correct: false },
        { id: 'b', text: 'Commas (,)', correct: true },
        { id: 'c', text: 'Pipes (|)', correct: false },
        { id: 'd', text: 'Colons (:)', correct: false }
      ],
      explanation: 'Filters in the same chain are separated by commas. Semicolons separate different filter chains. For example: "scale=640:360,crop=320:240" applies scale then crop to the same stream.',
      weight: 1,
      source: 'complex-filter-graphs'
    },
    {
      type: 'multiple-choice',
      id: 'mc-2',
      question: 'How do you reference the video stream from the second input file?',
      options: [
        { id: 'a', text: '[1:v]', correct: true },
        { id: 'b', text: '[2:v]', correct: false },
        { id: 'c', text: '[v:1]', correct: false },
        { id: 'd', text: '[input2:v]', correct: false }
      ],
      explanation: 'Inputs are numbered starting from 0. [1:v] refers to the video stream from the second input file (the second -i flag). [0:v] is the first input, [1:v] is the second, [2:v] is the third, and so on.',
      weight: 1,
      source: 'multiple-input-processing'
    },
    {
      type: 'multiple-choice',
      id: 'mc-3',
      question: 'What does the tblend filter do?',
      options: [
        { id: 'a', text: 'Blends colors between frames', correct: false },
        { id: 'b', text: 'Blends successive frames to create motion blur', correct: true },
        { id: 'c', text: 'Blends multiple video inputs', correct: false },
        { id: 'd', text: 'Blends audio tracks', correct: false }
      ],
      explanation: 'tblend (temporal blend) blends successive frames together to simulate motion blur. This creates a smooth, cinematic effect by averaging frames over time, making fast motion appear blurred.',
      weight: 1,
      source: 'advanced-video-filtering'
    },
    {
      type: 'multiple-choice',
      id: 'mc-4',
      question: 'What is the main advantage of script automation over manual FFmpeg commands?',
      options: [
        { id: 'a', text: 'Faster individual file processing', correct: false },
        { id: 'b', text: 'Ability to process multiple files automatically', correct: true },
        { id: 'c', text: 'Better video quality', correct: false },
        { id: 'd', text: 'Smaller file sizes', correct: false }
      ],
      explanation: 'Script automation allows you to process multiple files automatically without manually running commands for each file. This is essential for batch processing, scheduled pipelines, and handling large media libraries efficiently.',
      weight: 1,
      source: 'script-automation'
    },
    {
      type: 'multiple-choice',
      id: 'mc-5',
      question: 'What does acompressor do in audio processing?',
      options: [
        { id: 'a', text: 'Increases dynamic range', correct: false },
        { id: 'b', text: 'Reduces dynamic range by compressing loud sounds', correct: true },
        { id: 'c', text: 'Adds reverb', correct: false },
        { id: 'd', text: 'Removes noise', correct: false }
      ],
      explanation: 'acompressor reduces dynamic range by compressing audio signals that exceed a threshold. This smooths out volume variations, making quiet parts louder and loud parts quieter, resulting in more consistent audio levels.',
      weight: 1,
      source: 'advanced-audio-filtering'
    },
    {
      type: 'multiple-choice',
      id: 'mc-6',
      question: 'What exit code does FFmpeg return on success?',
      options: [
        { id: 'a', text: '1', correct: false },
        { id: 'b', text: '0', correct: true },
        { id: 'c', text: '-1', correct: false },
        { id: 'd', text: '255', correct: false }
      ],
      explanation: 'FFmpeg returns exit code 0 on success and non-zero values (typically 1) on failure. In bash, you can check this with $? or use if statements to detect success/failure.',
      weight: 1,
      source: 'error-handling'
    },
    // Command-builder questions
    {
      type: 'command-builder',
      id: 'cb-1',
      title: 'Create Complex Filter Graph',
      description: 'Write an FFmpeg command that splits the video into two streams, applies blur to one copy, then overlays the blurred stream on the original.',
      requirements: [
        'Use ffmpeg command',
        'Use -filter_complex flag',
        'Split input into two streams',
        'Apply blur to one stream',
        'Overlay blurred stream on original',
        'Use proper stream labels',
        'Output file is output.mp4'
      ],
      hints: [
        'split[orig][blurred] creates two labeled streams',
        'Apply blur filter to [blurred] stream',
        'Use overlay to combine [orig] and blurred stream',
        'Remember to use semicolons between filter chains',
        'Format: -filter_complex "split[orig][blurred]; [blurred]gblur=sigma=10[blur]; [orig][blur]overlay=0:0"'
      ],
      solution: 'ffmpeg -i input.mp4 -filter_complex "split[orig][blurred]; [blurred]gblur=sigma=10[blur]; [orig][blur]overlay=0:0" output.mp4',
      validation: {
        type: 'contains',
        value: 'split'
      },
      weight: 2,
      explanation: 'Complex filter graphs allow you to split streams, process them independently, and combine them. The split filter creates multiple copies of a stream, which can then be processed separately and combined with overlay.',
      sampleVideoId: 'sample-1',
      previewType: 'filter'
    },
    {
      type: 'command-builder',
      id: 'cb-2',
      title: 'Combine Multiple Inputs Side-by-Side',
      description: 'Write an FFmpeg command that combines two video inputs side-by-side using hstack.',
      requirements: [
        'Use two video inputs',
        'Scale both videos to same size (640×360)',
        'Use hstack to combine horizontally',
        'Map the combined video stream',
        'Include audio from first input',
        'Output file is output.mp4'
      ],
      hints: [
        'Use two -i flags for inputs',
        'Scale first input: [0:v]scale=640:360[left]',
        'Scale second input: [1:v]scale=640:360[right]',
        'Stack horizontally: [left][right]hstack=inputs=2[vid]',
        'Map video and audio: -map "[vid]" -map 0:a'
      ],
      solution: 'ffmpeg -i input1.mp4 -i input2.mp4 -filter_complex "[0:v]scale=640:360[left]; [1:v]scale=640:360[right]; [left][right]hstack=inputs=2[vid]" -map "[vid]" -map 0:a output.mp4',
      validation: {
        type: 'contains',
        value: 'hstack'
      },
      weight: 2,
      explanation: 'Multiple input processing allows you to combine different video sources. hstack combines streams horizontally side-by-side, while vstack combines them vertically. Both inputs must be scaled to the same size before stacking.',
      sampleVideoId: 'sample-1',
      previewType: 'filter'
    },
    {
      type: 'command-builder',
      id: 'cb-3',
      title: 'Create Picture-in-Picture Effect',
      description: 'Write an FFmpeg command that creates a picture-in-picture effect by overlaying a second video scaled to 1/4 size at the bottom-right corner.',
      requirements: [
        'Use two video inputs',
        'Scale second video to 1/4 size',
        'Overlay at bottom-right with 10px margin',
        'Map video and audio from main video',
        'Output file is output.mp4'
      ],
      hints: [
        'Scale second input: [1:v]scale=iw/4:ih/4[pip]',
        'Overlay at bottom-right: overlay=W-w-10:H-h-10',
        'W-w-10 positions at right edge minus 10px',
        'H-h-10 positions at bottom edge minus 10px',
        'Map main video: -map "[v]" -map 0:a'
      ],
      solution: 'ffmpeg -i main.mp4 -i pip.mp4 -filter_complex "[1:v]scale=iw/4:ih/4[pip]; [0:v][pip]overlay=W-w-10:H-h-10[v]" -map "[v]" -map 0:a output.mp4',
      validation: {
        type: 'contains',
        value: 'overlay=W-w-10:H-h-10'
      },
      weight: 2,
      explanation: 'Picture-in-picture effects overlay a smaller video on top of a main video. The overlay filter positions the second video at specific coordinates, and expressions like W-w-10 calculate positions relative to the frame dimensions.',
      sampleVideoId: 'sample-1',
      previewType: 'filter'
    },
    {
      type: 'command-builder',
      id: 'cb-4',
      title: 'Apply Motion Blur Effect',
      description: 'Write an FFmpeg command that applies motion blur using tblend filter with average mode.',
      requirements: [
        'Use ffmpeg command',
        'Use -vf flag with tblend filter',
        'Set mode to average',
        'Output file is output.mp4'
      ],
      hints: [
        'tblend creates temporal blending',
        'all_mode=\'average\' blends all frames',
        'Format: tblend=all_mode=\'average\'',
        'Use single quotes around average',
        'Can combine with framestep for stronger effect'
      ],
      solution: 'ffmpeg -i input.mp4 -vf "tblend=all_mode=\'average\'" output.mp4',
      validation: {
        type: 'contains',
        value: 'tblend'
      },
      weight: 2,
      explanation: 'The tblend (temporal blend) filter blends successive frames to create motion blur effects. This simulates the motion blur that occurs naturally in film cameras, creating smoother, more cinematic motion.',
      sampleVideoId: 'sample-1',
      previewType: 'filter'
    },
    {
      type: 'command-builder',
      id: 'cb-5',
      title: 'Split and Scale Multiple Resolutions',
      description: 'Write an FFmpeg command that splits video into three streams, scales each to different resolutions (640×360, 1280×720, 1920×1080), then stacks them horizontally.',
      requirements: [
        'Use ffmpeg command',
        'Use -filter_complex flag',
        'Split video into 3 streams',
        'Scale first to 640×360',
        'Scale second to 1280×720',
        'Scale third to 1920×1080',
        'Stack all three horizontally',
        'Output file is output.mp4'
      ],
      hints: [
        'Split: [0:v]split=3[v1][v2][v3]',
        'Scale streams: [v1]scale=640:360[small]; [v2]scale=1280:720[medium]; [v3]scale=1920:1080[large]',
        'Stack: [small][medium][large]hstack=inputs=3',
        'Use semicolons to separate filter chains',
        'Map the final stacked stream'
      ],
      solution: 'ffmpeg -i input.mp4 -filter_complex "[0:v]split=3[v1][v2][v3]; [v1]scale=640:360[small]; [v2]scale=1280:720[medium]; [v3]scale=1920:1080[large]; [small][medium][large]hstack=inputs=3[vid]" -map "[vid]" output.mp4',
      validation: {
        type: 'contains',
        value: 'split=3'
      },
      weight: 2,
      explanation: 'Complex filter graphs enable sophisticated multi-stream processing. You can split a single input into multiple streams, process each independently, and combine them in creative ways like side-by-side comparisons.',
      sampleVideoId: 'sample-1',
      previewType: 'filter'
    }
  ]
};
