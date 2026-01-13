import { Lesson } from '@/lib/tutorial/types';

export const advancedMuxingDemuxing: Lesson = {
  id: 'advanced-muxing-demuxing',
  title: 'Advanced Muxing/Demuxing',
  module: 'Advanced Techniques',
  duration: 30,
  unlockAfter: 'performance-profiling',
  content: [
    {
      type: 'introduction',
      heading: 'What This Lesson Covers',
      content: 'Separating or combining streams intelligently. Very important when handling subtitles, multiple audio tracks, and archive workflows.'
    },
    {
      type: 'bullets',
      heading: 'Why It Matters',
      content: 'Advanced muxing/demuxing enables:',
      bullets: [
        'Extracting specific streams (video, audio, subtitles)',
        'Combining streams from different sources',
        'Handling multiple audio tracks',
        'Subtitle management',
        'Archive and preservation workflows'
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mkv -map 0:v -map 0:a -map 0:s -c copy output.mp4',
      explanation: 'Extract all video, audio, and subtitle streams while copying them without re-encoding. -map selects streams, -c copy avoids re-encoding.',
      flagBreakdown: [
        {
          flag: '-map 0:v',
          description: 'Map all video streams from input 0'
        },
        {
          flag: '-map 0:a',
          description: 'Map all audio streams from input 0'
        },
        {
          flag: '-map 0:s',
          description: 'Map all subtitle streams from input 0'
        },
        {
          flag: '-c copy',
          description: 'Copy streams without re-encoding (fast, no quality loss)'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mkv -map 0:v:0 -map 0:a:1 -c copy output.mp4',
      explanation: 'Select specific streams: first video stream (0:v:0) and second audio stream (0:a:1). Useful for multi-track files.',
      flagBreakdown: [
        {
          flag: '-map 0:v:0',
          description: 'Map first video stream from input 0'
        },
        {
          flag: '-map 0:a:1',
          description: 'Map second audio stream (index 1) from input 0'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i video.mp4 -i audio.wav -i subtitles.srt -map 0:v -map 1:a -map 2:s -c:v copy -c:a aac -c:s mov_text output.mkv',
      explanation: 'Combine streams from different sources: video from first input, audio from second, subtitles from third. Re-encode audio and subtitles as needed.',
      flagBreakdown: [
        {
          flag: '-map 0:v',
          description: 'Video from first input'
        },
        {
          flag: '-map 1:a',
          description: 'Audio from second input'
        },
        {
          flag: '-map 2:s',
          description: 'Subtitles from third input'
        },
        {
          flag: '-c:s mov_text',
          description: 'Encode subtitles as mov_text format'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mkv -map 0 -map -0:s -c copy output.mp4',
      explanation: 'Copy all streams except subtitles. -map 0 selects all, -map -0:s excludes subtitle streams.',
      flagBreakdown: [
        {
          flag: '-map 0',
          description: 'Map all streams from input 0'
        },
        {
          flag: '-map -0:s',
          description: 'Exclude all subtitle streams (negative mapping)'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Stream Mapping Guide',
      content: 'Understanding stream references:',
      bullets: [
        '0:v = all video streams from input 0',
        '0:a:1 = second audio stream (index 1) from input 0',
        '0:s = all subtitle streams from input 0',
        '-map selects streams to include',
        '-map - excludes streams',
        '-c copy avoids re-encoding (fast)',
        'Use -c codec to re-encode specific streams'
      ]
    },
    {
      type: 'bullets',
      heading: 'Common Use Cases',
      content: 'Typical muxing/demuxing scenarios:',
      bullets: [
        'Extract audio: -map 0:a -c copy audio.m4a',
        'Extract subtitles: -map 0:s subtitles.srt',
        'Replace audio track: -map 0:v -map 1:a',
        'Add subtitles: -i video.mp4 -i subs.srt -map 0 -map 1',
        'Remove streams: -map 0 -map -0:a (remove audio)',
        'Archive preservation: Copy all streams with -c copy'
      ]
    },
    {
      type: 'preview',
      heading: 'Try It: Advanced Muxing/Demuxing',
      content: 'See how stream mapping extracts and combines streams',
      code: 'ffmpeg -i sample.mkv -map 0:v -map 0:a -c copy output.mp4',
      explanation: 'This extracts video and audio streams while copying without re-encoding. Stream mapping provides precise control over which streams are included in output.',
      previewType: 'filter',
      sampleVideoId: 'sample-advanced-099'
    },
    {
      type: 'challenge',
      title: 'Extract Specific Streams',
      description: 'Create a command that extracts first video and second audio stream',
      requirements: [
        'Map first video stream',
        'Map second audio stream',
        'Copy without re-encoding'
      ],
      hints: [
        'Use -map 0:v:0 for first video',
        'Use -map 0:a:1 for second audio',
        'Add -c copy to avoid re-encoding'
      ],
      solution: 'ffmpeg -i input.mkv -map 0:v:0 -map 0:a:1 -c copy output.mp4',
      validation: {
        type: 'contains',
        value: '-map 0:v:0'
      }
    },
    {
      type: 'quiz',
      question: 'What does -map 0:a:1 do?',
      options: [
        { id: 'a', text: 'Maps all audio streams', correct: false },
        { id: 'b', text: 'Maps the second audio stream (index 1)', correct: true },
        { id: 'c', text: 'Maps the first audio stream', correct: false },
        { id: 'd', text: 'Excludes audio streams', correct: false }
      ],
      explanation: '-map 0:a:1 maps the second audio stream (index 1) from input 0. Stream indices start at 0, so 0:a:0 is the first audio stream and 0:a:1 is the second.'
    }
  ]
};
