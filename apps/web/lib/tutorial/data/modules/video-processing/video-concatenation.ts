import { Lesson } from '@/lib/tutorial/types';

export const videoConcatenation: Lesson = {
  id: 'video-concatenation',
  title: 'Video Concatenation',
  module: 'Video Processing',
  duration: 20,
  unlockAfter: 'slow-motion-speed',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Joining multiple videos into one can be done in a few ways with FFmpeg. The concat demuxer is preferred for same-format files as it avoids re-encoding.'
    },
    {
      type: 'bullets',
      heading: 'Concatenation Methods',
      content: 'Two main methods:',
      bullets: [
        'Concat Demuxer: Fast, no re-encoding, requires same codecs/resolution',
        'Concat Filter: Handles different formats, requires re-encoding'
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -f concat -safe 0 -i mylist.txt -c copy output.mp4',
      explanation: 'Use concat demuxer with a text file listing videos. Create mylist.txt with lines: file \'part1.mp4\', file \'part2.mp4\', etc.',
      flagBreakdown: [
        {
          flag: '-f concat',
          description: 'Use concat demuxer format'
        },
        {
          flag: '-safe 0',
          description: 'Allow relative or unsafe paths in list file'
        },
        {
          flag: '-i mylist.txt',
          description: 'Input file containing list of videos to concatenate'
        },
        {
          flag: '-c copy',
          description: 'Copy streams without re-encoding'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i video1.mp4 -i video2.mp4 -filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]" -map "[v]" -map "[a]" output.mp4',
      explanation: 'Use concat filter for videos with different formats. This decodes and re-encodes, handling format differences.',
      flagBreakdown: [
        {
          flag: '-filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]"',
          description: 'Concatenate 2 videos with 1 video stream and 1 audio stream each'
        }
      ]
    },
    {
      type: 'preview',
      heading: 'Try It: Concatenate Videos',
      content: 'Join two videos together using the concat filter',
      code: 'ffmpeg -i sample1.mp4 -i sample2.mp4 -filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]" -map "[v]" -map "[a]" output.mp4',
      explanation: 'This concatenates two videos into one continuous video',
      previewType: 'filter',
      sampleVideoId: 'sample-concat-001'
    },
    {
      type: 'quiz',
      question: 'What is the advantage of concat demuxer over concat filter?',
      options: [
        { id: 'a', text: 'It handles different formats better', correct: false },
        { id: 'b', text: 'It avoids re-encoding and is faster', correct: true },
        { id: 'c', text: 'It produces smaller files', correct: false },
        { id: 'd', text: 'It works with any video format', correct: false }
      ],
      explanation: 'The concat demuxer copies streams directly without re-encoding, making it faster and preserving quality, but it requires videos to have the same codecs and resolution.'
    }
  ]
};
