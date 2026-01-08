import { Lesson } from '@/lib/tutorial/types';

export const inputOutput: Lesson = {
  id: 'input-output',
  title: 'Input and Output',
  module: 'Fundamentals',
  duration: 20,
  unlockAfter: 'what-is-ffmpeg',
  content: [
    {
      type: 'text',
      title: 'Basic FFMPEG Command Structure',
      content: `Every FFMPEG command follows a basic structure:

\`\`\`
ffmpeg [input options] -i input_file [output options] output_file
\`\`\`

The \`-i\` flag specifies the input file, and the last argument is typically the output file.

## Input Files

You can specify multiple input files by using multiple \`-i\` flags. FFMPEG will process them in order.`
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 output.avi',
      explanation: 'Basic transcoding: convert MP4 to AVI format',
      flagBreakdown: [
        {
          flag: '-i input.mp4',
          description: 'Specify the input file (input.mp4)'
        },
        {
          flag: 'output.avi',
          description: 'The output filename and format (determined by extension)'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'challenge',
      title: 'Convert a Video File',
      description: 'Write an FFMPEG command to convert a video file named "video.mp4" to "video.mkv"',
      requirements: [
        'Use the -i flag for input',
        'Specify the output filename with .mkv extension'
      ],
      hints: [
        'Start with ffmpeg',
        'Use -i to specify the input file',
        'The output filename comes last'
      ],
      solution: 'ffmpeg -i video.mp4 video.mkv',
      validation: {
        type: 'contains',
        value: '-i video.mp4'
      }
    },
    {
      type: 'quiz',
      question: 'What does the -i flag do in FFMPEG?',
      options: [
        { id: 'a', text: 'Sets the output file', correct: false },
        { id: 'b', text: 'Specifies the input file', correct: true },
        { id: 'c', text: 'Enables interactive mode', correct: false },
        { id: 'd', text: 'Sets the input codec', correct: false }
      ],
      explanation: 'The -i flag is used to specify the input file(s) for FFMPEG to process.'
    }
  ]
};
