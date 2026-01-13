import { type Lesson } from '@/lib/tutorial/types';

export const creatingGifsFromVideo: Lesson = {
  id: 'creating-gifs-from-video',
  title: 'Creating GIFs from Video',
  module: 'Common Use Cases',
  duration: 20,
  unlockAfter: 'extracting-video-segments',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Creating animated GIFs from video clips is popular for social media, documentation, and web content. However, GIFs can be very large, so optimization is crucial.'
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 output.gif',
      explanation: 'Basic GIF conversion. Simple but may produce large files. Best for short clips.',
      flagBreakdown: [
        {
          flag: '-i input.mp4',
          description: 'Input video file'
        },
        {
          flag: 'output.gif',
          description: 'Output GIF file'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "fps=10,scale=320:-1:flags=lanczos" output.gif',
      explanation: 'High-quality GIF with optimization. Reduces FPS to 10 and scales to 320px width (height auto) using lanczos scaling.',
      flagBreakdown: [
        {
          flag: '-vf "fps=10,scale=320:-1:flags=lanczos"',
          description: 'Video filter: 10 fps, scale to 320px width (height auto), lanczos scaling'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "fps=15,scale=640:-1:flags=lanczos,palettegen" palette.png && ffmpeg -i input.mp4 -i palette.png -lavfi "fps=15,scale=640:-1:flags=lanczos[x];[x][1:v]paletteuse" output.gif',
      explanation: 'Two-pass palette method for best quality. First pass generates palette, second pass uses it. Produces smaller, higher quality GIFs.',
      flagBreakdown: [
        {
          flag: '-vf "fps=15,scale=640:-1:flags=lanczos,palettegen"',
          description: 'First pass: Generate color palette'
        },
        {
          flag: '-lavfi "fps=15,scale=640:-1:flags=lanczos[x];[x][1:v]paletteuse"',
          description: 'Second pass: Use palette for optimized GIF'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'GIF Optimization Tips',
      content: 'Reducing GIF file size:',
      bullets: [
        'Reduce frame rate: Lower FPS (10-15) significantly reduces size',
        'Scale down: Smaller dimensions = smaller files',
        'Use palette method: Two-pass palette produces better quality at smaller sizes',
        'Limit duration: Shorter clips = smaller files',
        'Consider alternatives: WebP or MP4 may be better for some use cases'
      ]
    },
    {
      type: 'bullets',
      heading: 'Use Cases',
      content: 'When to create GIFs:',
      bullets: [
        'Social media: Animated content for Twitter, Reddit, etc.',
        'Documentation: Animated tutorials and demonstrations',
        'Web content: Animated banners and effects',
        'Email: Animated content in email campaigns',
        'Presentations: Animated slides and transitions'
      ]
    },
    {
      type: 'challenge',
      title: 'Create Optimized GIF',
      description: 'Create a GIF from a video with 12 fps and scaled to 480px width',
      requirements: [
        'Use -vf filter',
        'Set fps to 12',
        'Scale to 480px width',
        'Use lanczos scaling'
      ],
      hints: [
        'fps=12 for frame rate',
        'scale=480:-1 for width (height auto)',
        'flags=lanczos for scaling algorithm'
      ],
      solution: 'ffmpeg -i input.mp4 -vf "fps=12,scale=480:-1:flags=lanczos" output.gif',
      validation: {
        type: 'contains',
        value: 'fps=12'
      }
    },
    {
      type: 'quiz',
      question: 'What is the main concern when creating GIFs from video?',
      options: [
        { id: 'a', text: 'Video quality', correct: false },
        { id: 'b', text: 'File size (GIFs can be very large)', correct: true },
        { id: 'c', text: 'Color accuracy', correct: false },
        { id: 'd', text: 'Frame rate', correct: false }
      ],
      explanation: 'GIFs can be very large files, often much larger than the source video. Optimization through reduced FPS, scaling, and palette methods is essential to keep file sizes manageable.'
    }
  ]
};
