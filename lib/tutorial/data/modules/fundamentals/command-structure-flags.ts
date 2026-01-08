import { Lesson } from '@/lib/tutorial/types';

export const commandStructureFlags: Lesson = {
  id: 'command-structure-flags',
  title: 'Command Structure and Flags',
  module: 'Fundamentals',
  duration: 25,
  unlockAfter: 'containers-vs-codecs',
  content: [
    {
      type: 'introduction',
      heading: 'Introduction',
      content: 'An FFmpeg command follows a general structure: ffmpeg [global_options] -i <input1> [-i <input2> ...] [output_options] <output1> [output_options] <output2> .... The order matters – you list all inputs first, then outputs.'
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.avi -b:v 1M -r 24 output.mp4',
      explanation: 'Example showing the command structure: input file, output options (bitrate and frame rate), then output file.',
      flagBreakdown: [
        {
          flag: '-i input.avi',
          description: 'Input file (must come before output options)'
        },
        {
          flag: '-b:v 1M',
          description: 'Output option: set video bitrate to 1 Mbps'
        },
        {
          flag: '-r 24',
          description: 'Output option: set frame rate to 24 fps'
        },
        {
          flag: 'output.mp4',
          description: 'Output filename (comes last)'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'bullets',
      heading: 'Common Input Flags',
      content: 'Flags for input files:',
      bullets: [
        '-i inputfile: Designate an input file or stream',
        '-f format: Force input format (if auto-detection fails)',
        '-ss time: Start reading from specific timestamp',
        '-t duration: Limit input duration'
      ]
    },
    {
      type: 'bullets',
      heading: 'Common Output Flags',
      content: 'Flags for output files:',
      bullets: [
        '-c:v <codec> / -c:a <codec>: Choose video/audio codec (e.g. -c:v libx264, or -c:v copy to stream-copy)',
        '-b:v <bitrate> / -b:a <bitrate>: Set output video/audio bitrate (e.g. -b:v 1000k for ~1000 kb/s)',
        '-r <fps>: Set the frame rate for output video',
        '-s <width>x<height>: Set frame resolution (e.g. -s 1280x720 for 720p HD)',
        '-f <format>: Force a specific output format (normally determined by extension)'
      ]
    },
    {
      type: 'bullets',
      heading: 'Global Flags',
      content: 'Flags that apply to the entire command:',
      bullets: [
        '-y: Overwrite output files without asking',
        '-hide_banner: Suppress FFmpeg banner information',
        '-loglevel warning: Adjust verbosity (quiet, error, warning, info, verbose, debug)',
        '-h full: Display full list of FFmpeg options'
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -c:v libx265 output.mkv',
      explanation: 'Read input.mp4 and encode video with H.265 for output.mkv. Options apply to the next input or output file.',
      flagBreakdown: [
        {
          flag: '-i input.mp4',
          description: 'Input file'
        },
        {
          flag: '-c:v libx265',
          description: 'Output option: encode video with H.265 codec'
        },
        {
          flag: 'output.mkv',
          description: 'Output file'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i video.mp4 -i audio.mp3 -c:v copy -c:a copy output.mp4',
      explanation: 'Multiple inputs: combine video from video.mp4 and audio from audio.mp3, copying both streams without re-encoding.',
      flagBreakdown: [
        {
          flag: '-i video.mp4',
          description: 'First input: video file'
        },
        {
          flag: '-i audio.mp3',
          description: 'Second input: audio file'
        },
        {
          flag: '-c:v copy',
          description: 'Copy video stream from first input'
        },
        {
          flag: '-c:a copy',
          description: 'Copy audio stream from second input'
        }
      ]
    },
    {
      type: 'quiz',
      question: 'What is the correct order for FFmpeg command structure?',
      options: [
        { id: 'a', text: 'Output file, then input file, then options', correct: false },
        { id: 'b', text: 'Input file(s) with -i, then output options, then output file', correct: true },
        { id: 'c', text: 'All options first, then input and output files', correct: false },
        { id: 'd', text: 'Output file first, then input file', correct: false }
      ],
      explanation: 'FFmpeg commands follow the pattern: inputs first (each with -i), then output options, then output filename. The order matters for proper parsing.'
    }
  ]
};
