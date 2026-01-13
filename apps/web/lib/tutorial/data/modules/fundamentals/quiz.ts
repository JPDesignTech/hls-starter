import { type ModuleQuiz } from '@/lib/tutorial/types/module-quiz';

export const fundamentalsQuiz: ModuleQuiz = {
  id: 'fundamentals-quiz',
  moduleId: 'fundamentals',
  title: 'Fundamentals Mastery Quiz',
  description: 'Test your understanding of FFmpeg fundamentals including basic concepts, input/output, format conversion, codecs, containers, and command structure.',
  passingScore: 70,
  questions: [
    // Multiple choice questions from lessons
    {
      type: 'multiple-choice',
      id: 'mc-1',
      question: 'What is the primary purpose of FFMPEG?',
      options: [
        { id: 'a', text: 'Video editing', correct: false },
        { id: 'b', text: 'Media transcoding and processing', correct: true },
        { id: 'c', text: 'Video streaming only', correct: false },
        { id: 'd', text: 'Audio editing', correct: false }
      ],
      explanation: 'FFMPEG is primarily a multimedia framework for transcoding, encoding, decoding, and processing various media formats, not just for editing.',
      weight: 1,
      source: 'what-is-ffmpeg'
    },
    {
      type: 'multiple-choice',
      id: 'mc-2',
      question: 'What does the -i flag do in FFMPEG?',
      options: [
        { id: 'a', text: 'Sets the output file', correct: false },
        { id: 'b', text: 'Specifies the input file', correct: true },
        { id: 'c', text: 'Enables interactive mode', correct: false },
        { id: 'd', text: 'Sets the input codec', correct: false }
      ],
      explanation: 'The -i flag is used to specify the input file(s) for FFMPEG to process.',
      weight: 1,
      source: 'input-output'
    },
    {
      type: 'multiple-choice',
      id: 'mc-3',
      question: 'What happens when you convert MP3 to OGG without specifying codecs?',
      options: [
        { id: 'a', text: 'FFmpeg fails because no codec is specified', correct: false },
        { id: 'b', text: 'FFmpeg automatically selects Vorbis codec for OGG', correct: true },
        { id: 'c', text: 'The file extension is ignored', correct: false },
        { id: 'd', text: 'FFmpeg copies the MP3 codec to OGG', correct: false }
      ],
      explanation: 'FFmpeg automatically selects appropriate codecs based on the output container format. For OGG, it defaults to Vorbis audio codec.',
      weight: 1,
      source: 'basic-format-conversion'
    },
    // New comprehensive multiple choice questions
    {
      type: 'multiple-choice',
      id: 'mc-4',
      question: 'Which FFmpeg tool is used to analyze and gather information about media files?',
      options: [
        { id: 'a', text: 'ffmpeg', correct: false },
        { id: 'b', text: 'ffprobe', correct: true },
        { id: 'c', text: 'ffplay', correct: false },
        { id: 'd', text: 'ffanalyze', correct: false }
      ],
      explanation: 'ffprobe is the FFmpeg tool specifically designed for analyzing media files and extracting metadata.',
      weight: 1
    },
    {
      type: 'multiple-choice',
      id: 'mc-5',
      question: 'What is the difference between a container and a codec?',
      options: [
        { id: 'a', text: 'Container is the file format, codec is the compression algorithm', correct: true },
        { id: 'b', text: 'They are the same thing', correct: false },
        { id: 'c', text: 'Codec is the file format, container is the compression algorithm', correct: false },
        { id: 'd', text: 'Container holds video, codec holds audio', correct: false }
      ],
      explanation: 'A container (like MP4, AVI, MKV) is the file format that holds the media streams. A codec (like H.264, AAC) is the compression algorithm used to encode the actual video or audio data.',
      weight: 1
    },
    {
      type: 'multiple-choice',
      id: 'mc-6',
      question: 'In the command "ffmpeg -i input.mp4 output.webm", what determines the output format?',
      options: [
        { id: 'a', text: 'The -i flag', correct: false },
        { id: 'b', text: 'The file extension (.webm)', correct: true },
        { id: 'c', text: 'The input file format', correct: false },
        { id: 'd', text: 'FFmpeg always uses MP4', correct: false }
      ],
      explanation: 'FFmpeg determines the output container format based on the file extension of the output filename. The .webm extension tells FFmpeg to create a WebM container.',
      weight: 1
    },
    {
      type: 'multiple-choice',
      id: 'mc-7',
      question: 'What is the correct order of operations in FFmpeg processing?',
      options: [
        { id: 'a', text: 'Encode → Decode → Process → Mux', correct: false },
        { id: 'b', text: 'Decode → Process → Encode → Mux', correct: true },
        { id: 'c', text: 'Mux → Decode → Process → Encode', correct: false },
        { id: 'd', text: 'Process → Decode → Encode → Mux', correct: false }
      ],
      explanation: 'FFmpeg first decodes the input streams, then processes/filters them, encodes them to the output format, and finally muxes them into the output container.',
      weight: 1
    },
    // Command builder questions
    {
      type: 'command-builder',
      id: 'cb-1',
      title: 'Convert Video Format',
      description: 'Write an FFmpeg command to convert a video file named "sample.mp4" to "sample.avi" format.',
      requirements: [
        'Use the -i flag to specify the input file',
        'Output filename should be sample.avi'
      ],
      hints: [
        'Start with ffmpeg',
        'Use -i sample.mp4 for the input',
        'The output filename comes last'
      ],
      solution: 'ffmpeg -i sample.mp4 sample.avi',
      validation: {
        type: 'contains',
        value: '-i sample.mp4'
      },
      weight: 2,
      explanation: 'The basic format conversion command uses -i for input and the output filename with desired extension determines the output format.'
    },
    {
      type: 'command-builder',
      id: 'cb-2',
      title: 'Convert Audio Format',
      description: 'Write an FFmpeg command to convert an audio file "music.mp3" to OGG format with filename "music.ogg".',
      requirements: [
        'Input file is music.mp3',
        'Output file should be music.ogg',
        'Use the -i flag correctly'
      ],
      hints: [
        'The command structure is: ffmpeg -i input output',
        'For audio files, FFmpeg will automatically select appropriate codecs',
        'The .ogg extension tells FFmpeg to use OGG container'
      ],
      solution: 'ffmpeg -i music.mp3 music.ogg',
      validation: {
        type: 'contains',
        value: '-i music.mp3'
      },
      weight: 2,
      explanation: 'FFmpeg automatically handles audio format conversion, selecting Vorbis codec for OGG output.'
    },
    {
      type: 'command-builder',
      id: 'cb-3',
      title: 'Multiple Input Files',
      description: 'Write an FFmpeg command that takes two input files: "video1.mp4" and "video2.mp4", and outputs to "combined.mp4". Note: This is a basic structure - actual combining requires additional flags.',
      requirements: [
        'Include both input files using -i flag twice',
        'Output file should be combined.mp4'
      ],
      hints: [
        'You can use multiple -i flags for multiple inputs',
        'The order matters: inputs come before output',
        'Format: ffmpeg -i file1 -i file2 output'
      ],
      solution: 'ffmpeg -i video1.mp4 -i video2.mp4 combined.mp4',
      validation: {
        type: 'contains',
        value: '-i video1.mp4 -i video2.mp4'
      },
      weight: 2,
      explanation: 'Multiple input files are specified by using multiple -i flags. FFmpeg processes them in the order specified.'
    }
  ]
};
