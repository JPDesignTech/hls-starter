import { ModuleQuiz } from '@/lib/tutorial/types/module-quiz';

export const ffprobeQuiz: ModuleQuiz = {
  id: 'ffprobe-quiz',
  moduleId: 'ffprobe',
  title: 'FFProbe Mastery Quiz',
  description: 'Test your understanding of media analysis, metadata extraction, stream analysis, codec detection, and output formatting using FFProbe.',
  passingScore: 70,
  questions: [
    // Multiple-choice questions from lessons
    {
      type: 'multiple-choice',
      id: 'mc-1',
      question: 'What does -hide_banner do in FFprobe?',
      options: [
        { id: 'a', text: 'Hides all output', correct: false },
        { id: 'b', text: 'Removes version and build information for cleaner output', correct: true },
        { id: 'c', text: 'Hides file information', correct: false },
        { id: 'd', text: 'Shows more detailed information', correct: false }
      ],
      explanation: 'The -hide_banner flag removes the FFprobe version and build information banner, making the output cleaner and easier to read.',
      weight: 1,
      source: 'basic-metadata-extraction'
    },
    {
      type: 'multiple-choice',
      id: 'mc-2',
      question: 'What does -show_format display?',
      options: [
        { id: 'a', text: 'Individual frame information', correct: false },
        { id: 'b', text: 'Container-level metadata (format name, duration, bitrate)', correct: true },
        { id: 'c', text: 'Only video stream information', correct: false },
        { id: 'd', text: 'Only audio stream information', correct: false }
      ],
      explanation: '-show_format displays container-level metadata including format name, duration, bitrate, and file size, not individual stream or frame information.',
      weight: 1,
      source: 'extracting-format-information'
    },
    {
      type: 'multiple-choice',
      id: 'mc-3',
      question: 'What does -select_streams v do?',
      options: [
        { id: 'a', text: 'Selects audio streams', correct: false },
        { id: 'b', text: 'Selects video streams', correct: true },
        { id: 'c', text: 'Selects all streams', correct: false },
        { id: 'd', text: 'Selects subtitle streams', correct: false }
      ],
      explanation: '-select_streams v selects video streams, while -select_streams a selects audio streams. This allows you to analyze specific stream types.',
      weight: 1,
      source: 'codec-detection'
    },
    {
      type: 'multiple-choice',
      id: 'mc-4',
      question: 'What does -v quiet do?',
      options: [
        { id: 'a', text: 'Shows more verbose output', correct: false },
        { id: 'b', text: 'Suppresses all output except requested fields', correct: true },
        { id: 'c', text: 'Hides errors', correct: false },
        { id: 'd', text: 'Speeds up processing', correct: false }
      ],
      explanation: '-v quiet suppresses all output except the specifically requested fields, making the output clean and suitable for scripting and automation.',
      weight: 1,
      source: 'duration-and-bitrate-analysis'
    },
    {
      type: 'multiple-choice',
      id: 'mc-5',
      question: 'What is the main advantage of JSON output format?',
      options: [
        { id: 'a', text: 'It\'s more readable for humans', correct: false },
        { id: 'b', text: 'It\'s machine-readable and easy to parse programmatically', correct: true },
        { id: 'c', text: 'It\'s smaller in size', correct: false },
        { id: 'd', text: 'It shows more information', correct: false }
      ],
      explanation: 'JSON output provides structured, machine-readable data that can be easily parsed by scripts, APIs, and applications, making it ideal for automation and integration.',
      weight: 1,
      source: 'json-output-formatting'
    },
    {
      type: 'multiple-choice',
      id: 'mc-6',
      question: 'What does -of csv=p=0 do?',
      options: [
        { id: 'a', text: 'Outputs CSV with headers', correct: false },
        { id: 'b', text: 'Outputs CSV without headers (p=0)', correct: true },
        { id: 'c', text: 'Outputs JSON format', correct: false },
        { id: 'd', text: 'Outputs XML format', correct: false }
      ],
      explanation: '-of csv=p=0 outputs CSV format without headers (p=0 means no print headers), making it perfect for scripting where you only need the data values.',
      weight: 1,
      source: 'extracting-specific-metadata-fields'
    },
    // New comprehensive multiple-choice questions
    {
      type: 'multiple-choice',
      id: 'mc-7',
      question: 'What is the primary purpose of FFProbe?',
      options: [
        { id: 'a', text: 'To modify and transcode media files', correct: false },
        { id: 'b', text: 'To analyze and extract metadata from media files without modifying them', correct: true },
        { id: 'c', text: 'To play media files', correct: false },
        { id: 'd', text: 'To stream media files', correct: false }
      ],
      explanation: 'FFProbe is FFmpeg\'s analysis tool that reads and extracts metadata from media files without modifying them. It is read-only and perfect for debugging, automation, and metadata extraction.',
      weight: 1
    },
    {
      type: 'multiple-choice',
      id: 'mc-8',
      question: 'What is the difference between -show_format and -show_streams?',
      options: [
        { id: 'a', text: '-show_format shows container info, -show_streams shows individual stream info', correct: true },
        { id: 'b', text: 'There is no difference', correct: false },
        { id: 'c', text: '-show_format shows video only, -show_streams shows audio only', correct: false },
        { id: 'd', text: '-show_format shows more detail', correct: false }
      ],
      explanation: '-show_format displays container-level metadata (format name, duration, bitrate), while -show_streams displays information about individual streams (codecs, properties, technical details).',
      weight: 1
    },
    {
      type: 'multiple-choice',
      id: 'mc-9',
      question: 'What does -show_entries stream=codec_name do?',
      options: [
        { id: 'a', text: 'Shows all stream information', correct: false },
        { id: 'b', text: 'Shows only the codec_name field from stream information', correct: true },
        { id: 'c', text: 'Shows format information', correct: false },
        { id: 'd', text: 'Shows frame information', correct: false }
      ],
      explanation: '-show_entries allows you to extract specific fields. stream=codec_name extracts only the codec_name field from stream information, providing clean, focused output.',
      weight: 1
    },
    // Command builder questions
    {
      type: 'command-builder',
      id: 'cb-1',
      title: 'Basic FFProbe Command',
      description: 'Write an FFProbe command to analyze input.mp4 without showing the version banner.',
      requirements: [
        'Use ffprobe command',
        'Use -hide_banner flag',
        'Input file is input.mp4'
      ],
      hints: [
        'Start with ffprobe',
        'Use -hide_banner to remove version information',
        'Input file comes last'
      ],
      solution: 'ffprobe -hide_banner input.mp4',
      validation: {
        type: 'contains',
        value: '-hide_banner'
      },
      weight: 2,
      explanation: 'The -hide_banner flag removes FFProbe version information, making the output cleaner and easier to read.',
      sampleVideoId: 'sample-1',
      previewType: 'text'
    },
    {
      type: 'command-builder',
      id: 'cb-2',
      title: 'Extract Format Information',
      description: 'Write an FFProbe command to display format-level (container) information for input.mp4.',
      requirements: [
        'Use ffprobe command',
        'Use -show_format flag',
        'Input file is input.mp4'
      ],
      hints: [
        'Format information is shown with -show_format',
        'This shows container-level metadata',
        'Input file comes last'
      ],
      solution: 'ffprobe -show_format input.mp4',
      validation: {
        type: 'contains',
        value: '-show_format'
      },
      weight: 2,
      explanation: '-show_format displays container-level metadata including format name, duration, bitrate, and file size.',
      sampleVideoId: 'sample-1',
      previewType: 'text'
    },
    {
      type: 'command-builder',
      id: 'cb-3',
      title: 'Detect Video Codec',
      description: 'Write an FFProbe command to extract the codec name for the video stream in input.mp4.',
      requirements: [
        'Use -select_streams v to select video stream',
        'Use -show_entries stream=codec_name',
        'Input file is input.mp4'
      ],
      hints: [
        'Use -select_streams v for video streams',
        'Use -show_entries stream=codec_name to extract codec name',
        'Combine both flags in the command'
      ],
      solution: 'ffprobe -select_streams v -show_entries stream=codec_name input.mp4',
      validation: {
        type: 'contains',
        value: '-select_streams v -show_entries stream=codec_name'
      },
      weight: 2,
      explanation: 'Combining -select_streams v with -show_entries stream=codec_name extracts only the video codec name, providing clean output for automation.',
      sampleVideoId: 'sample-1',
      previewType: 'text'
    },
    {
      type: 'command-builder',
      id: 'cb-4',
      title: 'Extract Duration in JSON',
      description: 'Write an FFProbe command to extract the duration field in JSON format from input.mp4.',
      requirements: [
        'Use -print_format json for JSON output',
        'Use -show_entries format=duration',
        'Use -v quiet for clean output',
        'Input file is input.mp4'
      ],
      hints: [
        'JSON format is specified with -print_format json',
        'Duration is in format information: -show_entries format=duration',
        'Use -v quiet to suppress extra output'
      ],
      solution: 'ffprobe -print_format json -show_entries format=duration -v quiet input.mp4',
      validation: {
        type: 'contains',
        value: '-print_format json -show_entries format=duration'
      },
      weight: 2,
      explanation: 'JSON output format provides structured, machine-readable data. Combined with -show_entries format=duration, this extracts only the duration field in JSON format, perfect for automation.',
      sampleVideoId: 'sample-1',
      previewType: 'json'
    },
    {
      type: 'command-builder',
      id: 'cb-5',
      title: 'Extract Bitrate in CSV',
      description: 'Write an FFProbe command to extract the bitrate field in CSV format (without headers) from input.mp4.',
      requirements: [
        'Use -of csv=p=0 for CSV without headers',
        'Use -show_entries format=bit_rate',
        'Use -v quiet for clean output',
        'Input file is input.mp4'
      ],
      hints: [
        'CSV format without headers: -of csv=p=0',
        'Bitrate is in format: -show_entries format=bit_rate',
        'Use -v quiet to suppress extra output',
        'p=0 means no headers'
      ],
      solution: 'ffprobe -v quiet -of csv=p=0 -show_entries format=bit_rate input.mp4',
      validation: {
        type: 'contains',
        value: '-of csv=p=0 -show_entries format=bit_rate'
      },
      weight: 2,
      explanation: 'CSV format with p=0 removes headers, providing clean data values perfect for scripting. This extracts only the bitrate value in CSV format.',
      sampleVideoId: 'sample-1',
      previewType: 'csv'
    }
  ]
};
