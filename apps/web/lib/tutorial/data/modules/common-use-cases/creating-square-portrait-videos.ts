import { Lesson } from '@/lib/tutorial/types';

export const creatingSquarePortraitVideos: Lesson = {
  id: 'creating-square-portrait-videos',
  title: 'Creating Square / Portrait Videos',
  module: 'Common Use Cases',
  duration: 20,
  unlockAfter: 'optimizing-video-file-sizes',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Reformatting videos for social media platforms requires specific aspect ratios. Square (1:1) and portrait (9:16) formats are essential for Instagram, TikTok, and other social platforms.'
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "crop=ih:ih" square.mp4',
      explanation: 'Create square video (1:1 aspect ratio). Crops to square using input height for both dimensions, preserving quality.',
      flagBreakdown: [
        {
          flag: '-vf "crop=ih:ih"',
          description: 'Video filter: crop to square (width=height, using input height)'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "scale=1080:1920" portrait.mp4',
      explanation: 'Create portrait video (9:16 aspect ratio). Scales to 1080x1920, standard for TikTok and Instagram Stories.',
      flagBreakdown: [
        {
          flag: '-vf "scale=1080:1920"',
          description: 'Scale to 1080x1920 (9:16 portrait format)'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "crop=ih:ih,scale=1080:1080" square.mp4',
      explanation: 'Create square video with specific size. First crop to square, then scale to 1080x1080 for Instagram.',
      flagBreakdown: [
        {
          flag: '-vf "crop=ih:ih,scale=1080:1080"',
          description: 'Crop to square, then scale to 1080x1080 pixels'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" square.mp4',
      explanation: 'Create square with letterboxing. Scales to fit, then adds black bars to create square without cropping.',
      flagBreakdown: [
        {
          flag: 'scale=1920:1080:force_original_aspect_ratio=decrease',
          description: 'Scale maintaining aspect ratio, fit within 1920x1080'
        },
        {
          flag: 'pad=1920:1080:(ow-iw)/2:(oh-ih)/2',
          description: 'Add padding (black bars) to center and create square'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Cropping vs Scaling',
      content: 'Understanding the trade-offs:',
      bullets: [
        'Cropping: Preserves quality, may lose content (cuts off edges)',
        'Scaling: Keeps all content, may distort if aspect ratios differ',
        'Cropping: Better for quality, use when you can afford to lose edges',
        'Scaling: Better for content preservation, may reduce quality',
        'Combination: Crop then scale for best results'
      ]
    },
    {
      type: 'bullets',
      heading: 'Social Media Formats',
      content: 'Common aspect ratios:',
      bullets: [
        'Square (1:1): 1080x1080 - Instagram posts, Facebook posts',
        'Portrait (9:16): 1080x1920 - TikTok, Instagram Stories, YouTube Shorts',
        'Landscape (16:9): 1920x1080 - YouTube, Facebook videos',
        'Vertical (4:5): 1080x1350 - Instagram portrait posts'
      ]
    },
    {
      type: 'challenge',
      title: 'Create Square Video',
      description: 'Create a square video (1:1) by cropping to use the input height for both dimensions',
      requirements: [
        'Use -vf with crop filter',
        'Crop to square using ih:ih',
        'Output should be square format'
      ],
      hints: [
        'ih means input height',
        'crop=ih:ih creates square',
        'Use -vf flag for video filter'
      ],
      solution: 'ffmpeg -i input.mp4 -vf "crop=ih:ih" square.mp4',
      validation: {
        type: 'contains',
        value: 'crop=ih:ih'
      }
    },
    {
      type: 'quiz',
      question: 'What is the advantage of cropping over scaling for square videos?',
      options: [
        { id: 'a', text: 'Cropping preserves quality, scaling may distort', correct: true },
        { id: 'b', text: 'Scaling is always better', correct: false },
        { id: 'c', text: 'Cropping is faster', correct: false },
        { id: 'd', text: 'There is no difference', correct: false }
      ],
      explanation: 'Cropping preserves the original quality of the video by cutting off edges, while scaling may distort the video if the aspect ratios differ significantly. Cropping is better when you can afford to lose some content.'
    }
  ]
};
