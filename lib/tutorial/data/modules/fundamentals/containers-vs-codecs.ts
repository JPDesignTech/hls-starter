import { Lesson } from '@/lib/tutorial/types';

export const containersVsCodecs: Lesson = {
  id: 'containers-vs-codecs',
  title: 'Understanding Containers vs Codecs',
  module: 'Fundamentals',
  duration: 20,
  unlockAfter: 'basic-format-conversion',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'Media files consist of a container format and the encoded streams inside it. Understanding the difference between containers and codecs is fundamental to working with FFmpeg effectively.'
    },
    {
      type: 'bullets',
      heading: 'Container Formats',
      content: 'The container (e.g. MP4, MKV, AVI) is like a wrapper that holds:',
      bullets: [
        'One or more streams (video, audio, subtitles, etc.)',
        'Metadata about the media',
        'Synchronization information',
        'Rules about which codecs it supports'
      ]
    },
    {
      type: 'bullets',
      heading: 'Codec Formats',
      content: 'The codec refers to how a stream is encoded or compressed:',
      bullets: [
        'Video codecs: H.264, H.265/HEVC, VP9, AV1',
        'Audio codecs: MP3, AAC, Opus, FLAC',
        'Each codec has different compression methods',
        'Each codec has different quality/size trade-offs'
      ]
    },
    {
      type: 'bullets',
      heading: 'Key Differences',
      content: 'Important distinctions:',
      bullets: [
        'Container is just a file format that can contain certain types of encoded streams',
        'Codec is the actual format of the audiovisual data',
        'An MP4 file (container) might contain H.264 video (codec) and AAC audio (codec)',
        'Container formats have rules about which codecs they support (e.g. WebM supports VP8/VP9 video and Vorbis/Opus audio)'
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -c:v copy -c:a copy output.mkv',
      explanation: 'Copy streams into a different container without re-encoding. The video and audio codecs remain the same, only the container changes.',
      flagBreakdown: [
        {
          flag: '-c:v copy',
          description: 'Copy video stream without re-encoding'
        },
        {
          flag: '-c:a copy',
          description: 'Copy audio stream without re-encoding'
        },
        {
          flag: 'output.mkv',
          description: 'Output in MKV container (if codecs are compatible)'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -c:v libx265 -c:a aac output.mp4',
      explanation: 'Re-encode streams to different codecs within the same container. Here we convert to H.265 video and AAC audio, both compatible with MP4.',
      flagBreakdown: [
        {
          flag: '-c:v libx265',
          description: 'Re-encode video to H.265 codec'
        },
        {
          flag: '-c:a aac',
          description: 'Re-encode audio to AAC codec'
        }
      ]
    },
    {
      type: 'quiz',
      question: 'What is the difference between a container and a codec?',
      options: [
        { id: 'a', text: 'They are the same thing', correct: false },
        { id: 'b', text: 'Container is the file format wrapper; codec is how data is encoded', correct: true },
        { id: 'c', text: 'Codec is the file format; container is the encoding method', correct: false },
        { id: 'd', text: 'Container determines quality; codec determines file size', correct: false }
      ],
      explanation: 'A container is the file format (like MP4 or MKV) that wraps the streams, while a codec is the compression format used to encode the actual video or audio data.'
    }
  ]
};
