import { type Lesson } from '@/lib/tutorial/types';

export const whatIsFFmpeg: Lesson = {
  id: 'what-is-ffmpeg',
  title: 'What is FFMPEG?',
  module: 'Fundamentals',
  duration: 15,
  content: [
    {
      type: 'text',
      title: 'Introduction',
      content: `FFMPEG is a powerful, open-source multimedia framework that can decode, encode, transcode, mux, demux, stream, filter, and play almost any media format. It's the backbone of many video processing applications and services.

## What FFMPEG Does

FFMPEG provides a comprehensive solution for:
- **Transcoding**: Converting media files from one format to another
- **Streaming**: Processing live or on-demand media streams
- **Filtering**: Applying effects, transformations, and enhancements
- **Analysis**: Extracting metadata and technical information from media files

## Core Components

FFMPEG consists of several command-line tools:
- **ffmpeg**: The main tool for converting media files
- **ffprobe**: For analyzing and gathering information about media files
- **ffplay**: A simple media player for testing

## Why Learn FFMPEG?

Understanding FFMPEG gives you:
- Complete control over video and audio processing
- The ability to automate complex media workflows
- Deep understanding of codecs, containers, and streaming protocols
- Skills applicable to video editing, streaming, and media analysis`
    },
    {
      type: 'diagram',
      title: 'FFmpeg Architecture',
      diagram: `graph TB
    FFmpeg[FFmpeg Framework] --> FFmpegTool[ffmpeg Tool]
    FFmpeg --> FFprobeTool[ffprobe Tool]
    FFmpeg --> FFplayTool[ffplay Tool]
    
    FFmpegTool --> Encode[Encoding]
    FFmpegTool --> Decode[Decoding]
    FFmpegTool --> Filter[Filtering]
    
    FFprobeTool --> Analyze[Analysis]
    FFprobeTool --> Metadata[Metadata Extraction]
    
    FFplayTool --> Playback[Playback]`,
      explanation: 'FFmpeg consists of three main tools: ffmpeg for processing, ffprobe for analysis, and ffplay for playback.',
      diagramType: 'mermaid',
      diagramFormat: 'graph'
    },
    {
      type: 'code',
      command: 'ffmpeg -version',
      explanation: 'Check your FFMPEG installation and version information',
      flagBreakdown: [
        {
          flag: '-version',
          description: 'Display version information and build configuration'
        }
      ]
    },
    {
      type: 'quiz',
      question: 'What is the primary purpose of FFMPEG?',
      options: [
        { id: 'a', text: 'Video editing', correct: false },
        { id: 'b', text: 'Media transcoding and processing', correct: true },
        { id: 'c', text: 'Video streaming only', correct: false },
        { id: 'd', text: 'Audio editing', correct: false }
      ],
      explanation: 'FFMPEG is primarily a multimedia framework for transcoding, encoding, decoding, and processing various media formats, not just for editing.'
    }
  ]
};
