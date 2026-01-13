import { ModuleQuiz } from '@/lib/tutorial/types/module-quiz';

export const commonUseCasesQuiz: ModuleQuiz = {
  id: 'common-use-cases-quiz',
  moduleId: 'common-use-cases',
  title: 'Common Use Cases Mastery Quiz',
  description: 'Test your understanding of practical real-world FFmpeg workflows including format conversion, thumbnail creation, subtitle handling, batch processing, GIF creation, and web optimization.',
  passingScore: 70,
  questions: [
    // Multiple-choice questions from lessons
    {
      type: 'multiple-choice',
      id: 'mc-1',
      question: 'What happens when converting AAC audio (from MP4) to MP3?',
      options: [
        { id: 'a', text: 'No quality loss occurs', correct: false },
        { id: 'b', text: 'Quality loss occurs (lossy → lossy conversion)', correct: true },
        { id: 'c', text: 'File size increases significantly', correct: false },
        { id: 'd', text: 'Conversion is not possible', correct: false }
      ],
      explanation: 'Converting AAC to MP3 involves lossy to lossy conversion, which introduces quality loss. Both formats are compressed, so re-encoding from one lossy format to another reduces quality.',
      weight: 1,
      source: 'converting-mp4-to-mp3'
    },
    {
      type: 'multiple-choice',
      id: 'mc-2',
      question: 'Why should you place -ss before -i when extracting thumbnails?',
      options: [
        { id: 'a', text: 'It\'s required syntax', correct: false },
        { id: 'b', text: 'It enables faster seeking (more efficient)', correct: true },
        { id: 'c', text: 'It improves thumbnail quality', correct: false },
        { id: 'd', text: 'It reduces file size', correct: false }
      ],
      explanation: 'Placing -ss before -i tells FFmpeg to seek before decoding, which is much faster and more efficient. When placed after -i, FFmpeg decodes the entire video up to that point.',
      weight: 1,
      source: 'creating-video-thumbnails'
    },
    {
      type: 'multiple-choice',
      id: 'mc-3',
      question: 'What is the main difference between burned-in and embedded subtitles?',
      options: [
        { id: 'a', text: 'Burned-in can be turned off, embedded cannot', correct: false },
        { id: 'b', text: 'Burned-in are permanent, embedded are selectable', correct: true },
        { id: 'c', text: 'Embedded require re-encoding, burned-in do not', correct: false },
        { id: 'd', text: 'There is no difference', correct: false }
      ],
      explanation: 'Burned-in subtitles are permanently part of the video and cannot be turned off. Embedded subtitles are attached as a separate stream that can be toggled on/off in players that support them.',
      weight: 1,
      source: 'adding-subtitles-to-videos'
    },
    {
      type: 'multiple-choice',
      id: 'mc-4',
      question: 'What is the main difference between copy mode and re-encoding when extracting segments?',
      options: [
        { id: 'a', text: 'Copy mode is slower but more accurate', correct: false },
        { id: 'b', text: 'Copy mode is faster but requires keyframe alignment, re-encoding is frame-accurate', correct: true },
        { id: 'c', text: 'There is no difference', correct: false },
        { id: 'd', text: 'Copy mode always produces larger files', correct: false }
      ],
      explanation: 'Copy mode is faster and preserves quality but requires keyframe alignment (cuts may not be frame-accurate). Re-encoding is slower but provides frame-accurate cuts at any point in the video.',
      weight: 1,
      source: 'extracting-video-segments'
    },
    {
      type: 'multiple-choice',
      id: 'mc-5',
      question: 'What is the main concern when creating GIFs from video?',
      options: [
        { id: 'a', text: 'Video quality', correct: false },
        { id: 'b', text: 'File size (GIFs can be very large)', correct: true },
        { id: 'c', text: 'Color accuracy', correct: false },
        { id: 'd', text: 'Frame rate', correct: false }
      ],
      explanation: 'GIFs can be very large files, often much larger than the source video. Optimization through reduced FPS, scaling, and palette methods is essential to keep file sizes manageable.',
      weight: 1,
      source: 'creating-gifs-from-video'
    },
    {
      type: 'multiple-choice',
      id: 'mc-6',
      question: 'What does +faststart do in web video optimization?',
      options: [
        { id: 'a', text: 'Speeds up encoding', correct: false },
        { id: 'b', text: 'Enables progressive download (video can start before fully loaded)', correct: true },
        { id: 'c', text: 'Reduces file size', correct: false },
        { id: 'd', text: 'Improves video quality', correct: false }
      ],
      explanation: 'The +faststart flag moves metadata to the beginning of the file, enabling progressive download. This allows the video to start playing before it\'s fully downloaded, improving user experience on web pages.',
      weight: 1,
      source: 'converting-videos-for-web'
    },
    {
      type: 'multiple-choice',
      id: 'mc-7',
      question: 'Which codec combination is most widely supported for web video?',
      options: [
        { id: 'a', text: 'VP9 + Opus', correct: false },
        { id: 'b', text: 'H.264 + AAC', correct: true },
        { id: 'c', text: 'AV1 + AAC', correct: false },
        { id: 'd', text: 'HEVC + MP3', correct: false }
      ],
      explanation: 'H.264 video codec with AAC audio codec is the most widely supported combination for web video, ensuring compatibility across different browsers and devices.',
      weight: 1,
      source: 'converting-videos-for-web'
    },
    {
      type: 'multiple-choice',
      id: 'mc-8',
      question: 'What flag is used to set audio bitrate when converting to MP3?',
      options: [
        { id: 'a', text: '-b:v', correct: false },
        { id: 'b', text: '-b:a', correct: true },
        { id: 'c', text: '-a:b', correct: false },
        { id: 'd', text: '-bitrate', correct: false }
      ],
      explanation: 'The -b:a flag is used to set audio bitrate. For example, -b:a 192k sets the audio bitrate to 192 kilobits per second.',
      weight: 1,
      source: 'converting-mp4-to-mp3'
    },
    // Command-builder questions
    {
      type: 'command-builder',
      id: 'cb-1',
      title: 'Convert MP4 to MP3',
      description: 'Write an FFmpeg command to convert input.mp4 to output.mp3 with a bitrate of 192k.',
      requirements: [
        'Use ffmpeg command',
        'Use -i for input file',
        'Use -b:a 192k for audio bitrate',
        'Output file is output.mp3'
      ],
      hints: [
        'Audio bitrate is set with -b:a flag',
        '192k means 192 kilobits per second',
        'Output extension determines format'
      ],
      solution: 'ffmpeg -i input.mp4 -b:a 192k output.mp3',
      validation: {
        type: 'contains',
        value: '-b:a 192k'
      },
      weight: 2,
      explanation: 'The -b:a flag sets the audio bitrate. Higher bitrates provide better quality but larger file sizes. 192k is a good balance for most use cases.',
      sampleVideoId: 'sample-1',
      previewType: 'format'
    },
    {
      type: 'command-builder',
      id: 'cb-2',
      title: 'Extract Thumbnail',
      description: 'Write an FFmpeg command to extract a single frame at 5 seconds from input.mp4 and save it as thumbnail.jpg.',
      requirements: [
        'Use ffmpeg command',
        'Use -ss 5 to seek to 5 seconds',
        'Place -ss before -i for efficiency',
        'Use -frames:v 1 to extract one frame',
        'Output file is thumbnail.jpg'
      ],
      hints: [
        'Place -ss before -i for faster seeking',
        'Use -frames:v 1 to extract a single frame',
        'Output extension determines image format'
      ],
      solution: 'ffmpeg -ss 5 -i input.mp4 -frames:v 1 thumbnail.jpg',
      validation: {
        type: 'contains',
        value: '-ss 5 -i input.mp4 -frames:v 1'
      },
      weight: 2,
      explanation: 'Placing -ss before -i enables faster seeking by telling FFmpeg to seek before decoding. The -frames:v 1 flag extracts exactly one video frame.',
      sampleVideoId: 'sample-1',
      previewType: 'filter'
    },
    {
      type: 'command-builder',
      id: 'cb-3',
      title: 'Add Burned-in Subtitles',
      description: 'Write an FFmpeg command to burn subtitles from subs.srt into input.mp4 and save as output.mp4.',
      requirements: [
        'Use ffmpeg command',
        'Use -vf flag with subtitles filter',
        'Specify subs.srt in the filter',
        'Output file is output.mp4'
      ],
      hints: [
        'Use -vf for video filters',
        'Subtitle filter syntax: subtitles=filename',
        'Quote the filter string if needed'
      ],
      solution: 'ffmpeg -i input.mp4 -vf subtitles=subs.srt output.mp4',
      validation: {
        type: 'contains',
        value: 'subtitles=subs.srt'
      },
      weight: 2,
      explanation: 'The subtitles video filter burns subtitles permanently into the video. This makes subtitles part of the video that cannot be turned off.',
      sampleVideoId: 'sample-1',
      previewType: 'filter'
    },
    {
      type: 'command-builder',
      id: 'cb-4',
      title: 'Extract Video Segment',
      description: 'Write an FFmpeg command to extract a 10-second segment starting at 30 seconds from input.mp4 using copy mode (no re-encoding).',
      requirements: [
        'Use ffmpeg command',
        'Use -ss 30 for start time',
        'Use -t 10 for duration',
        'Place -ss before -i',
        'Use -c copy to avoid re-encoding',
        'Output file is clip.mp4'
      ],
      hints: [
        'Start time: -ss 30',
        'Duration: -t 10',
        'Use -c copy for fast processing',
        'Place -ss before -i for efficiency'
      ],
      solution: 'ffmpeg -ss 30 -i input.mp4 -t 10 -c copy clip.mp4',
      validation: {
        type: 'contains',
        value: '-c copy'
      },
      weight: 2,
      explanation: 'Copy mode (-c copy) is fast and preserves quality but requires keyframe alignment. Placing -ss before -i enables faster seeking.',
      sampleVideoId: 'sample-1',
      previewType: 'crop'
    },
    {
      type: 'command-builder',
      id: 'cb-5',
      title: 'Create Optimized GIF',
      description: 'Write an FFmpeg command to convert input.mp4 to output.gif with 10 fps and scaled to 320px width.',
      requirements: [
        'Use ffmpeg command',
        'Use -vf filter',
        'Set fps to 10',
        'Scale to 320px width (height auto)',
        'Use lanczos scaling',
        'Output file is output.gif'
      ],
      hints: [
        'fps=10 for frame rate',
        'scale=320:-1 for width (height auto)',
        'flags=lanczos for scaling algorithm',
        'Combine filters with commas'
      ],
      solution: 'ffmpeg -i input.mp4 -vf "fps=10,scale=320:-1:flags=lanczos" output.gif',
      validation: {
        type: 'contains',
        value: 'fps=10'
      },
      weight: 2,
      explanation: 'Reducing FPS and scaling down significantly reduces GIF file size. The lanczos scaling algorithm provides high-quality scaling.',
      sampleVideoId: 'sample-1',
      previewType: 'format'
    },
    {
      type: 'command-builder',
      id: 'cb-6',
      title: 'Optimize Video for Web',
      description: 'Write an FFmpeg command to optimize input.mp4 for web with faststart enabled and H.264 codec.',
      requirements: [
        'Use ffmpeg command',
        'Use -movflags +faststart',
        'Use -c:v libx264',
        'Set CRF to 23',
        'Output file is output.mp4'
      ],
      hints: [
        '+faststart enables progressive download',
        'libx264 is the H.264 encoder',
        'CRF 23 provides good quality',
        'Place flags before output file'
      ],
      solution: 'ffmpeg -i input.mp4 -movflags +faststart -c:v libx264 -crf 23 output.mp4',
      validation: {
        type: 'contains',
        value: '+faststart'
      },
      weight: 2,
      explanation: 'The +faststart flag moves metadata to the beginning, enabling progressive download. H.264 codec ensures wide browser compatibility.',
      sampleVideoId: 'sample-1',
      previewType: 'format'
    }
  ]
};
