import { type Lesson } from '@/lib/tutorial/types';

export const formatSpecificOptions: Lesson = {
  id: 'format-specific-options',
  title: 'Format-Specific Options',
  module: 'Advanced Techniques',
  duration: 30,
  unlockAfter: 'advanced-muxing-demuxing',
  content: [
    {
      type: 'introduction',
      heading: 'What This Lesson Covers',
      content: 'Using codec/container flags and format-specific parameters for higher quality or compatibility. Codec and container flags often expose advanced settings not found in basic tutorials.'
    },
    {
      type: 'bullets',
      heading: 'Why It Matters',
      content: 'Format-specific options enable:',
      bullets: [
        'Higher quality encoding',
        'Better compatibility',
        'Optimized file sizes',
        'Platform-specific optimizations',
        'Professional encoding workflows'
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -c:v libx264 -profile:v high -level 4.1 -preset slow -crf 23 output.mp4',
      explanation: 'H.264 with profile and level: High profile with level 4.1 provides better quality and compatibility. Level restricts features for compatibility.',
      flagBreakdown: [
        {
          flag: '-profile:v high',
          description: 'H.264 High profile (better quality than baseline/main)'
        },
        {
          flag: '-level 4.1',
          description: 'H.264 level 4.1 (defines max bitrate, resolution, etc.)'
        },
        {
          flag: '-preset slow',
          description: 'Slow preset for better compression'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -c:v libvpx-vp9 -b:v 2M -c:a libopus output.webm',
      explanation: 'WebM with VP9 and Opus: VP9 provides better compression than VP8, Opus is high-quality audio codec. WebM is open format.',
      flagBreakdown: [
        {
          flag: '-c:v libvpx-vp9',
          description: 'Use VP9 video codec (better compression than VP8)'
        },
        {
          flag: '-b:v 2M',
          description: 'Set video bitrate to 2 megabits per second'
        },
        {
          flag: '-c:a libopus',
          description: 'Use Opus audio codec (high quality, open format)'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -c:v libx264 -profile:v high -level 4.1 -pix_fmt yuv420p -movflags +faststart output.mp4',
      explanation: 'MP4 optimization: yuv420p pixel format for compatibility, faststart for web streaming. Combines codec and container options.',
      flagBreakdown: [
        {
          flag: '-pix_fmt yuv420p',
          description: 'Pixel format: YUV 4:2:0 (most compatible)'
        },
        {
          flag: '-movflags +faststart',
          description: 'MP4 faststart: enables progressive download'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -c:v libx265 -preset medium -crf 28 -x265-params "keyint=60:min-keyint=60:scenecut=0" output.mp4',
      explanation: 'HEVC/H.265 with x265 parameters: Custom keyframe interval and scene cut detection. Advanced codec-specific options.',
      flagBreakdown: [
        {
          flag: '-x265-params "keyint=60:min-keyint=60:scenecut=0"',
          description: 'x265-specific parameters: keyframe interval 60, disable scene cut detection'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'H.264 Options',
      content: 'Common H.264 codec options:',
      bullets: [
        '-profile:v baseline/main/high: Profile determines features',
        '-level 3.0/3.1/4.0/4.1: Level restricts bitrate/resolution',
        '-pix_fmt yuv420p: Pixel format for compatibility',
        '-tune film/animation/grain: Optimize for content type',
        '-x264-params: Advanced x264 encoder parameters'
      ]
    },
    {
      type: 'bullets',
      heading: 'WebM/VP9 Options',
      content: 'WebM format options:',
      bullets: [
        '-c:v libvpx-vp9: VP9 codec (better than VP8)',
        '-c:a libopus: Opus audio (high quality)',
        '-b:v: Bitrate control',
        '-crf: Quality-based encoding',
        '-deadline good/best: Encoding speed vs quality',
        '-cpu-used: Speed control (0-5, lower = slower/better)'
      ]
    },
    {
      type: 'preview',
      heading: 'Try It: Format-Specific Options',
      content: 'See how format-specific options optimize encoding',
      code: 'ffmpeg -i sample.mp4 -c:v libx264 -profile:v high -level 4.1 -preset slow -crf 23 output.mp4',
      explanation: 'This uses H.264 High profile with level 4.1 for optimal quality and compatibility. Format-specific options provide fine control over encoding.',
      previewType: 'filter',
      sampleVideoId: 'sample-advanced-100'
    },
    {
      type: 'challenge',
      title: 'Use VP9 Encoding',
      description: 'Create a command that encodes to WebM with VP9 and Opus',
      requirements: [
        'Use libvpx-vp9 codec',
        'Use libopus audio codec',
        'Set video bitrate to 1.5M',
        'Output to WebM format'
      ],
      hints: [
        '-c:v libvpx-vp9 for VP9 video',
        '-c:a libopus for Opus audio',
        '-b:v 1.5M sets bitrate',
        'Output extension .webm'
      ],
      solution: 'ffmpeg -i input.mp4 -c:v libvpx-vp9 -b:v 1.5M -c:a libopus output.webm',
      validation: {
        type: 'contains',
        value: 'libvpx-vp9'
      }
    },
    {
      type: 'quiz',
      question: 'What does the H.264 "high" profile provide compared to "baseline"?',
      options: [
        { id: 'a', text: 'Faster encoding', correct: false },
        { id: 'b', text: 'Better quality and more advanced features', correct: true },
        { id: 'c', text: 'Smaller file sizes', correct: false },
        { id: 'd', text: 'Better compatibility', correct: false }
      ],
      explanation: 'The H.264 High profile provides better quality and more advanced encoding features (like B-frames, CABAC) compared to Baseline profile. However, Baseline has better compatibility with older devices.'
    }
  ]
};
