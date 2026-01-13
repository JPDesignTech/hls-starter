import { Lesson } from '@/lib/tutorial/types';

export const creatingImageSlideshows: Lesson = {
  id: 'creating-image-slideshows',
  title: 'Creating Image Slideshows',
  module: 'Common Use Cases',
  duration: 20,
  unlockAfter: 'adding-subtitles-to-videos',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Turning images into a video slideshow is perfect for presentations, photo albums, and social media content. FFmpeg can combine multiple images into a single video with customizable timing.'
    },
    {
      type: 'code',
      command: 'ffmpeg -framerate 1 -i img_%03d.jpg output.mp4',
      explanation: 'Basic slideshow with 1 image per second. Images must be sequentially named (img_001.jpg, img_002.jpg, etc.).',
      flagBreakdown: [
        {
          flag: '-framerate 1',
          description: 'Set input frame rate to 1 fps (1 image per second)'
        },
        {
          flag: '-i img_%03d.jpg',
          description: 'Input pattern: img_001.jpg, img_002.jpg, img_003.jpg, etc.'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -framerate 0.5 -i img_%03d.jpg output.mp4',
      explanation: 'Slower slideshow: 1 image every 2 seconds. Lower framerate means longer display time per image.',
      flagBreakdown: [
        {
          flag: '-framerate 0.5',
          description: 'Set input frame rate to 0.5 fps (1 image every 2 seconds)'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -framerate 1 -i img_%03d.jpg -i music.mp3 -shortest output.mp4',
      explanation: 'Add background music. The -shortest flag stops video when audio ends, keeping them in sync.',
      flagBreakdown: [
        {
          flag: '-i music.mp3',
          description: 'Second input: background music file'
        },
        {
          flag: '-shortest',
          description: 'Stop encoding when shortest input ends (keeps video and audio in sync)'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -framerate 1 -i img_%03d.jpg -c:v libx264 -pix_fmt yuv420p output.mp4',
      explanation: 'Create slideshow with explicit codec settings. Ensures compatibility with all players.',
      flagBreakdown: [
        {
          flag: '-c:v libx264',
          description: 'Use H.264 video codec'
        },
        {
          flag: '-pix_fmt yuv420p',
          description: 'Set pixel format for maximum compatibility'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Image Naming Requirements',
      content: 'Important points about image sequences:',
      bullets: [
        'Images must be sequentially named (img_001.jpg, img_002.jpg, etc.)',
        'Use %03d pattern for 3-digit numbering (001, 002, 003)',
        'Use %02d for 2-digit numbering (01, 02, 03)',
        'All images should be same size for best results',
        'Supported formats: JPG, PNG, BMP, etc.'
      ]
    },
    {
      type: 'bullets',
      heading: 'Use Cases',
      content: 'When to create slideshows:',
      bullets: [
        'Photo albums: Turn photo collections into videos',
        'Presentations: Convert slide decks to video format',
        'Social media: Create engaging content from images',
        'Memories: Combine photos into shareable videos',
        'Marketing: Product showcases and portfolios'
      ]
    },
    {
      type: 'challenge',
      title: 'Create Slideshow with Music',
      description: 'Create a slideshow from images with background music, showing each image for 2 seconds',
      requirements: [
        'Use -framerate 0.5 (2 seconds per image)',
        'Add music file as second input',
        'Use -shortest to sync video and audio'
      ],
      hints: [
        '0.5 fps = 1 image every 2 seconds',
        'Use -i twice: once for images, once for music',
        'Use -shortest to stop when shortest input ends'
      ],
      solution: 'ffmpeg -framerate 0.5 -i img_%03d.jpg -i music.mp3 -shortest output.mp4',
      validation: {
        type: 'contains',
        value: '-shortest'
      }
    },
    {
      type: 'quiz',
      question: 'What does -shortest do when creating a slideshow with music?',
      options: [
        { id: 'a', text: 'Makes the video shorter', correct: false },
        { id: 'b', text: 'Stops encoding when shortest input ends (keeps sync)', correct: true },
        { id: 'c', text: 'Speeds up the slideshow', correct: false },
        { id: 'd', text: 'Reduces file size', correct: false }
      ],
      explanation: 'The -shortest flag stops encoding when the shortest input stream ends. This keeps the video and audio in sync, ensuring the slideshow ends when the music ends.'
    }
  ]
};
