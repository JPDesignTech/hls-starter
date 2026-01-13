import { type ModuleQuiz } from '@/lib/tutorial/types/module-quiz';

export const audioProcessingQuiz: ModuleQuiz = {
  id: 'audio-processing-quiz',
  moduleId: 'audio-processing',
  title: 'Audio Processing Mastery Quiz',
  description: 'Test your understanding of audio codecs, extraction, format conversion, bitrate control, channel manipulation, normalization, and audio effects.',
  passingScore: 70,
  questions: [
    // Multiple-choice questions from lessons
    {
      type: 'multiple-choice',
      id: 'mc-1',
      question: 'What flag is used to specify the audio codec?',
      options: [
        { id: 'a', text: '-c:a or -acodec', correct: true },
        { id: 'b', text: '-audio', correct: false },
        { id: 'c', text: '-a', correct: false },
        { id: 'd', text: '-codec:a', correct: false }
      ],
      explanation: 'The -c:a (or -acodec) flag is used to specify the audio codec in FFMPEG commands.',
      weight: 1,
      source: 'audio-codecs'
    },
    {
      type: 'multiple-choice',
      id: 'mc-2',
      question: 'What is the main difference between lossy and lossless audio formats?',
      options: [
        { id: 'a', text: 'Lossy formats are always better quality', correct: false },
        { id: 'b', text: 'Lossless formats preserve quality but create larger files', correct: true },
        { id: 'c', text: 'Lossy formats cannot be converted', correct: false },
        { id: 'd', text: 'There is no difference', correct: false }
      ],
      explanation: 'Lossless formats like FLAC preserve the original audio quality but create larger files. Lossy formats like MP3 reduce quality to achieve smaller file sizes.',
      weight: 1,
      source: 'converting-audio-formats'
    },
    {
      type: 'multiple-choice',
      id: 'mc-3',
      question: 'What is the advantage of using -c:a copy when extracting audio?',
      options: [
        { id: 'a', text: 'It converts to a better format', correct: false },
        { id: 'b', text: 'It preserves original quality and is faster', correct: true },
        { id: 'c', text: 'It reduces file size', correct: false },
        { id: 'd', text: 'It improves audio quality', correct: false }
      ],
      explanation: 'Using -c:a copy copies the audio stream without re-encoding, preserving the original quality and processing faster than re-encoding.',
      weight: 1,
      source: 'extracting-audio-from-video'
    },
    {
      type: 'multiple-choice',
      id: 'mc-4',
      question: 'What does -q:a 2 mean in VBR encoding?',
      options: [
        { id: 'a', text: 'Low quality (higher number = better)', correct: false },
        { id: 'b', text: 'High quality (lower number = better)', correct: true },
        { id: 'c', text: 'Fixed bitrate of 2 kbps', correct: false },
        { id: 'd', text: '2-channel audio', correct: false }
      ],
      explanation: 'In VBR encoding, -q:a uses a quality scale where lower values (0-9) mean higher quality. -q:a 2 is high quality.',
      weight: 1,
      source: 'audio-bitrate-control'
    },
    {
      type: 'multiple-choice',
      id: 'mc-5',
      question: 'What does -ac 1 do?',
      options: [
        { id: 'a', text: 'Sets audio codec to 1', correct: false },
        { id: 'b', text: 'Sets audio channels to 1 (mono)', correct: true },
        { id: 'c', text: 'Sets audio bitrate to 1 kbps', correct: false },
        { id: 'd', text: 'Sets audio sample rate to 1 Hz', correct: false }
      ],
      explanation: 'The -ac flag controls the number of audio channels. -ac 1 sets the output to mono (1 channel).',
      weight: 1,
      source: 'audio-channel-manipulation'
    },
    {
      type: 'multiple-choice',
      id: 'mc-6',
      question: 'What is the advantage of loudnorm over simple volume adjustment?',
      options: [
        { id: 'a', text: 'It\'s faster', correct: false },
        { id: 'b', text: 'It normalizes perceived loudness, not just peak levels', correct: true },
        { id: 'c', text: 'It reduces file size', correct: false },
        { id: 'd', text: 'It changes the audio format', correct: false }
      ],
      explanation: 'loudnorm normalizes perceived loudness based on how humans hear, not just peak levels. This provides more consistent results across different audio content and is preferred for professional workflows.',
      weight: 1,
      source: 'audio-normalization'
    },
    {
      type: 'multiple-choice',
      id: 'mc-7',
      question: 'What does the -an flag do?',
      options: [
        { id: 'a', text: 'Adds audio to video', correct: false },
        { id: 'b', text: 'Disables all audio streams', correct: true },
        { id: 'c', text: 'Normalizes audio', correct: false },
        { id: 'd', text: 'Extracts audio from video', correct: false }
      ],
      explanation: 'The -an flag disables all audio output, effectively removing audio from the video file.',
      weight: 1,
      source: 'removing-audio-from-video'
    },
    {
      type: 'multiple-choice',
      id: 'mc-8',
      question: 'What does afade=t=in:ss=0:d=3 do?',
      options: [
        { id: 'a', text: 'Fades out over 3 seconds', correct: false },
        { id: 'b', text: 'Fades in over the first 3 seconds', correct: true },
        { id: 'c', text: 'Fades at 3 seconds', correct: false },
        { id: 'd', text: 'Fades to 3% volume', correct: false }
      ],
      explanation: 'afade=t=in creates a fade in effect, ss=0 starts at the beginning, and d=3 makes it last 3 seconds.',
      weight: 1,
      source: 'audio-fade-in-fade-out'
    },
    {
      type: 'multiple-choice',
      id: 'mc-9',
      question: 'What is the difference between atempo and asetrate?',
      options: [
        { id: 'a', text: 'atempo changes speed and pitch, asetrate only changes speed', correct: false },
        { id: 'b', text: 'atempo preserves pitch while changing speed, asetrate changes both', correct: true },
        { id: 'c', text: 'There is no difference', correct: false },
        { id: 'd', text: 'atempo is faster', correct: false }
      ],
      explanation: 'atempo changes playback speed while preserving pitch (sounds natural), while asetrate changes both speed and pitch (creates chipmunk effect when sped up).',
      weight: 1,
      source: 'changing-audio-speed-pitch'
    },
    // Command builder questions
    {
      type: 'command-builder',
      id: 'cb-1',
      title: 'Extract Audio from Video',
      description: 'Extract audio from input.mp4 using stream copy to preserve original quality. Output should be an audio file.',
      requirements: [
        'Use -i flag for input video file',
        'Use -vn to disable video stream',
        'Use -c:a copy to copy audio without re-encoding',
        'Output should be an audio file (e.g., output.aac)'
      ],
      hints: [
        'The -vn flag removes video from output',
        'Stream copy preserves original quality',
        'Use -c:a copy to avoid re-encoding',
        'Output extension determines container format'
      ],
      solution: 'ffmpeg -i input.mp4 -vn -c:a copy output.aac',
      validation: {
        type: 'contains',
        value: '-vn -c:a copy'
      },
      weight: 2,
      explanation: 'Extracting audio with stream copy preserves the original quality and is faster than re-encoding. The -vn flag removes video, and -c:a copy copies the audio stream directly.',
      sampleVideoId: 'sample-1',
      previewType: 'audio'
    },
    {
      type: 'command-builder',
      id: 'cb-2',
      title: 'Convert Audio Format',
      description: 'Convert input.wav to AAC format with explicit codec selection. Output should be output.m4a.',
      requirements: [
        'Use -i flag for input WAV file',
        'Use -c:a aac to specify AAC codec',
        'Output file should be output.m4a'
      ],
      hints: [
        'AAC codec is specified with -c:a aac',
        'Output extension .m4a is commonly used for AAC',
        'AAC provides good quality at lower bitrates'
      ],
      solution: 'ffmpeg -i input.wav -c:a aac output.m4a',
      validation: {
        type: 'contains',
        value: '-c:a aac'
      },
      weight: 2,
      explanation: 'AAC is a widely supported codec that provides good quality at lower bitrates, making it ideal for streaming and mobile devices.',
      sampleVideoId: 'sample-1',
      previewType: 'audio'
    },
    {
      type: 'command-builder',
      id: 'cb-3',
      title: 'Set Audio Bitrate',
      description: 'Convert input.wav to MP3 format with a bitrate of 192 kbps.',
      requirements: [
        'Use -i flag for input file',
        'Use -b:a 192k to set audio bitrate',
        'Output should be MP3 format'
      ],
      hints: [
        'Bitrate is specified with -b:a flag',
        '192k means 192 kilobits per second',
        'Output extension determines format'
      ],
      solution: 'ffmpeg -i input.wav -b:a 192k output.mp3',
      validation: {
        type: 'contains',
        value: '-b:a 192k'
      },
      weight: 2,
      explanation: '192 kbps is considered high quality for MP3 audio, providing excellent sound quality while maintaining reasonable file sizes.',
      sampleVideoId: 'sample-1',
      previewType: 'audio'
    },
    {
      type: 'command-builder',
      id: 'cb-4',
      title: 'Apply Fade In Effect',
      description: 'Apply a 2-second fade in to the beginning of input.wav. The fade should start at 0 seconds.',
      requirements: [
        'Use -i flag for input file',
        'Use -af flag with afade filter',
        'Set fade type to in (t=in)',
        'Set start time to 0 (ss=0)',
        'Set duration to 2 seconds (d=2)'
      ],
      hints: [
        'Fade type is t=in for fade in',
        'Start time is ss=0 for beginning',
        'Duration is d=2 for 2 seconds',
        'Use -af flag for audio filters'
      ],
      solution: 'ffmpeg -i input.wav -af "afade=t=in:ss=0:d=2" output.wav',
      validation: {
        type: 'contains',
        value: 'afade=t=in'
      },
      weight: 2,
      explanation: 'Fade in effects create smooth audio transitions at the start of tracks, avoiding abrupt beginnings and adding professional polish.',
      sampleVideoId: 'sample-1',
      previewType: 'audio'
    },
    {
      type: 'command-builder',
      id: 'cb-5',
      title: 'Speed Up Audio While Preserving Pitch',
      description: 'Speed up input.wav by 50% (1.5× speed) while preserving the original pitch.',
      requirements: [
        'Use -i flag for input file',
        'Use -filter:a with atempo filter',
        'Set speed to 1.5 (50% faster)',
        'Preserve pitch (use atempo, not asetrate)'
      ],
      hints: [
        'atempo preserves pitch while changing speed',
        '1.5 means 1.5× speed (50% faster)',
        'Use -filter:a flag for audio filters',
        'atempo range is 0.5 to 2.0 per filter'
      ],
      solution: 'ffmpeg -i input.wav -filter:a "atempo=1.5" output.wav',
      validation: {
        type: 'contains',
        value: 'atempo=1.5'
      },
      weight: 2,
      explanation: 'atempo changes playback speed while preserving pitch, making it ideal for podcasts and accessibility where you want faster playback without the chipmunk effect.',
      sampleVideoId: 'sample-1',
      previewType: 'audio'
    }
  ]
};
