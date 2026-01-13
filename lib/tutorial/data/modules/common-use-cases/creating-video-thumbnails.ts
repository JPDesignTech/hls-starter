import { Lesson } from '@/lib/tutorial/types';

export const creatingVideoThumbnails: Lesson = {
  id: 'creating-video-thumbnails',
  title: 'Creating Video Thumbnails',
  module: 'Common Use Cases',
  duration: 20,
  unlockAfter: 'converting-mp4-to-mp3',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Extracting still images from videos is essential for creating video previews, CMS thumbnails, and streaming platform covers. FFmpeg makes it easy to extract frames at specific times or generate multiple thumbnails automatically.'
    },
    {
      type: 'code',
      command: 'ffmpeg -ss 10 -i input.mp4 -frames:v 1 thumbnail.jpg',
      explanation: 'Extract a single frame at 10 seconds. The -ss flag seeks to the time, and -frames:v 1 extracts one frame.',
      flagBreakdown: [
        {
          flag: '-ss 10',
          description: 'Seek to 10 seconds (place before -i for faster seeking)'
        },
        {
          flag: '-frames:v 1',
          description: 'Extract 1 video frame'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -ss 00:01:30 -i input.mp4 -frames:v 1 thumbnail.jpg',
      explanation: 'Extract frame at 1 minute 30 seconds using timestamp format. More readable for longer videos.',
      flagBreakdown: [
        {
          flag: '-ss 00:01:30',
          description: 'Seek to 1 minute 30 seconds (HH:MM:SS format)'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf fps=1/5 thumbs_%03d.jpg',
      explanation: 'Generate multiple thumbnails every 5 seconds. Creates sequentially numbered files (thumbs_001.jpg, thumbs_002.jpg, etc.).',
      flagBreakdown: [
        {
          flag: '-vf fps=1/5',
          description: 'Video filter: extract 1 frame every 5 seconds'
        },
        {
          flag: 'thumbs_%03d.jpg',
          description: 'Output pattern: thumbs_001.jpg, thumbs_002.jpg, etc.'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -ss 10 -i input.mp4 -frames:v 1 -vf scale=320:240 thumbnail.jpg',
      explanation: 'Extract and resize thumbnail. Scale to 320x240 for smaller file size.',
      flagBreakdown: [
        {
          flag: '-vf scale=320:240',
          description: 'Scale thumbnail to 320x240 pixels'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Thumbnail Tips',
      content: 'Best practices for creating thumbnails:',
      bullets: [
        'Use -ss before -i for faster seeking (more efficient)',
        'JPG is common format (smaller file size)',
        'PNG preserves quality (larger file size)',
        'Scale thumbnails to reduce file size',
        'Generate multiple thumbnails for video previews'
      ]
    },
    {
      type: 'bullets',
      heading: 'Use Cases',
      content: 'When to create thumbnails:',
      bullets: [
        'Video previews: Generate multiple thumbnails for scrubbing',
        'CMS thumbnails: Single frame for content management systems',
        'Streaming platforms: Cover images for YouTube, Vimeo, etc.',
        'Video galleries: Thumbnail grids for video collections',
        'Social media: Preview images for video posts'
      ]
    },
    {
      type: 'challenge',
      title: 'Generate Multiple Thumbnails',
      description: 'Create thumbnails every 10 seconds from a video',
      requirements: [
        'Use -i for input file',
        'Use -vf fps filter',
        'Set to extract 1 frame every 10 seconds',
        'Use output pattern with %03d'
      ],
      hints: [
        'fps=1/10 means 1 frame every 10 seconds',
        'Use %03d for sequential numbering',
        'Output pattern: thumbs_%03d.jpg'
      ],
      solution: 'ffmpeg -i input.mp4 -vf fps=1/10 thumbs_%03d.jpg',
      validation: {
        type: 'contains',
        value: 'fps=1/10'
      }
    },
    {
      type: 'quiz',
      question: 'Why should you place -ss before -i when extracting thumbnails?',
      options: [
        { id: 'a', text: 'It\'s required syntax', correct: false },
        { id: 'b', text: 'It enables faster seeking (more efficient)', correct: true },
        { id: 'c', text: 'It improves thumbnail quality', correct: false },
        { id: 'd', text: 'It reduces file size', correct: false }
      ],
      explanation: 'Placing -ss before -i tells FFmpeg to seek before decoding, which is much faster and more efficient. When placed after -i, FFmpeg decodes the entire video up to that point.'
    }
  ]
};
