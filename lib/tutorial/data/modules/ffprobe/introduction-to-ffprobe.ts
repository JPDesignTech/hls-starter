import { Lesson } from '@/lib/tutorial/types';

export const introductionToFFprobe: Lesson = {
  id: 'introduction-to-ffprobe',
  title: 'Introduction to FFProbe',
  module: 'FFProbe - Media Analysis',
  duration: 15,
  unlockAfter: 'command-structure-flags',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'FFprobe is FFmpeg\'s analysis tool for inspecting media files. Unlike FFmpeg, FFprobe does not modify files - it only reads metadata and technical information. This makes it perfect for debugging, automation, metadata extraction, and media validation.'
    },
    {
      type: 'code',
      command: 'ffprobe input.mp4',
      explanation: 'Basic FFprobe usage. This displays basic information about the media file including streams, codecs, duration, and bitrate.',
      flagBreakdown: [
        {
          flag: 'input.mp4',
          description: 'Input media file to analyze'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'bullets',
      heading: 'What FFprobe Does',
      content: 'FFprobe provides:',
      bullets: [
        'File metadata: Container format, duration, file size',
        'Stream information: Codecs, bitrates, resolution, frame rates',
        'Technical details: Pixel formats, sample rates, channel layouts',
        'Frame analysis: Individual frame timestamps and properties',
        'Read-only operation: Never modifies the input file'
      ]
    },
    {
      type: 'bullets',
      heading: 'Why Use FFprobe',
      content: 'Common use cases:',
      bullets: [
        'Debugging: Understanding why a file won\'t play or process correctly',
        'Automation: Extracting metadata for scripts and pipelines',
        'Metadata extraction: Getting technical information about media',
        'Media validation: Verifying file properties before processing',
        'Quality control: Checking codecs, bitrates, and formats'
      ]
    },
    {
      type: 'quiz',
      question: 'What is the main difference between FFmpeg and FFprobe?',
      options: [
        { id: 'a', text: 'FFprobe modifies files, FFmpeg only reads', correct: false },
        { id: 'b', text: 'FFprobe only reads metadata, FFmpeg processes files', correct: true },
        { id: 'c', text: 'There is no difference', correct: false },
        { id: 'd', text: 'FFprobe is faster', correct: false }
      ],
      explanation: 'FFprobe is a read-only analysis tool that extracts metadata and information from media files without modifying them. FFmpeg processes and converts media files.'
    }
  ]
};
