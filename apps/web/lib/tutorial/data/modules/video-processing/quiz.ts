import { ModuleQuiz } from '@/lib/tutorial/types/module-quiz';

export const videoProcessingQuiz: ModuleQuiz = {
  id: 'video-processing-quiz',
  moduleId: 'video-processing',
  title: 'Video Processing Mastery Quiz',
  description: 'Test your understanding of video codecs, quality control, video filters, transformations, and advanced video processing techniques.',
  passingScore: 70,
  questions: [
    // Multiple-choice questions from lessons
    {
      type: 'multiple-choice',
      id: 'mc-1',
      question: 'Which flag is used to specify the video codec?',
      options: [
        { id: 'a', text: '-codec', correct: false },
        { id: 'b', text: '-c:v or -vcodec', correct: true },
        { id: 'c', text: '-v', correct: false },
        { id: 'd', text: '-video', correct: false }
      ],
      explanation: 'The -c:v (or -vcodec) flag is used to specify the video codec in FFMPEG commands.',
      weight: 1,
      source: 'video-codecs'
    },
    {
      type: 'multiple-choice',
      id: 'mc-2',
      question: 'What does a lower CRF value mean?',
      options: [
        { id: 'a', text: 'Lower quality, smaller file', correct: false },
        { id: 'b', text: 'Higher quality, larger file', correct: true },
        { id: 'c', text: 'Same quality, faster encoding', correct: false },
        { id: 'd', text: 'Lower quality, larger file', correct: false }
      ],
      explanation: 'Lower CRF values result in higher quality output but produce larger file sizes.',
      weight: 1,
      source: 'quality-control'
    },
    {
      type: 'multiple-choice',
      id: 'mc-3',
      question: 'What flag is used to apply video filters?',
      options: [
        { id: 'a', text: '-filter', correct: false },
        { id: 'b', text: '-vf or -filter:v', correct: true },
        { id: 'c', text: '-video-filter', correct: false },
        { id: 'd', text: '-f', correct: false }
      ],
      explanation: 'The -vf (or -filter:v) flag is used to apply video filters in FFMPEG commands.',
      weight: 1,
      source: 'filtering-basics'
    },
    {
      type: 'multiple-choice',
      id: 'mc-4',
      question: 'What does the crop filter syntax crop=w:h:x:y mean?',
      options: [
        { id: 'a', text: 'Width, height, x-offset, y-offset', correct: true },
        { id: 'b', text: 'Width, height, x-scale, y-scale', correct: false },
        { id: 'c', text: 'Width, height, x-rotation, y-rotation', correct: false },
        { id: 'd', text: 'Width, height, x-speed, y-speed', correct: false }
      ],
      explanation: 'The crop filter uses width, height, x-offset (distance from left), and y-offset (distance from top) to define the crop rectangle.',
      weight: 1,
      source: 'cropping-videos'
    },
    {
      type: 'multiple-choice',
      id: 'mc-5',
      question: 'What filter value rotates a video 90° clockwise?',
      options: [
        { id: 'a', text: 'transpose=0', correct: false },
        { id: 'b', text: 'transpose=1', correct: true },
        { id: 'c', text: 'transpose=2', correct: false },
        { id: 'd', text: 'hflip', correct: false }
      ],
      explanation: 'transpose=1 rotates the video 90° clockwise. transpose=2 rotates counter-clockwise.',
      weight: 1,
      source: 'rotating-flipping'
    },
    {
      type: 'multiple-choice',
      id: 'mc-6',
      question: 'What happens when you increase the frame rate with -r?',
      options: [
        { id: 'a', text: 'Frames are dropped', correct: false },
        { id: 'b', text: 'Extra frames are duplicated', correct: true },
        { id: 'c', text: 'Video duration increases', correct: false },
        { id: 'd', text: 'Video quality decreases', correct: false }
      ],
      explanation: 'When increasing frame rate, FFmpeg duplicates frames to fill the gaps, making motion appear smoother.',
      weight: 1,
      source: 'frame-rate-manipulation'
    },
    {
      type: 'multiple-choice',
      id: 'mc-7',
      question: 'What is the difference between rescaling and changing aspect metadata?',
      options: [
        { id: 'a', text: 'Rescaling changes pixels, metadata only changes how it\'s displayed', correct: true },
        { id: 'b', text: 'Both methods re-encode the video', correct: false },
        { id: 'c', text: 'Metadata changes pixels, rescaling only changes display', correct: false },
        { id: 'd', text: 'There is no difference', correct: false }
      ],
      explanation: 'Rescaling actually changes the pixel dimensions (requires re-encoding), while metadata only changes how players display the video (can use stream copy).',
      weight: 1,
      source: 'aspect-ratio-changes'
    },
    {
      type: 'multiple-choice',
      id: 'mc-8',
      question: 'What is the advantage of concat demuxer over concat filter?',
      options: [
        { id: 'a', text: 'It handles different formats better', correct: false },
        { id: 'b', text: 'It avoids re-encoding and is faster', correct: true },
        { id: 'c', text: 'It produces smaller files', correct: false },
        { id: 'd', text: 'It works with any video format', correct: false }
      ],
      explanation: 'The concat demuxer copies streams directly without re-encoding, making it faster and preserving quality, but it requires videos to have the same codecs and resolution.',
      weight: 1,
      source: 'video-concatenation'
    },
    {
      type: 'multiple-choice',
      id: 'mc-9',
      question: 'What does setpts=2.0*PTS do to video playback?',
      options: [
        { id: 'a', text: 'Speeds up 2×', correct: false },
        { id: 'b', text: 'Slows down 2×', correct: true },
        { id: 'c', text: 'Changes to 2 fps', correct: false },
        { id: 'd', text: 'Doubles the resolution', correct: false }
      ],
      explanation: 'setpts=2.0*PTS doubles each frame\'s timestamp, making the video take twice as long to play (half speed/slow motion).',
      weight: 1,
      source: 'slow-motion-speed'
    },
    // New comprehensive multiple-choice questions
    {
      type: 'multiple-choice',
      id: 'mc-10',
      question: 'Which video codec offers the best compression ratio but slower encoding?',
      options: [
        { id: 'a', text: 'H.264 (libx264)', correct: false },
        { id: 'b', text: 'H.265/HEVC (libx265)', correct: false },
        { id: 'c', text: 'VP9', correct: false },
        { id: 'd', text: 'AV1', correct: true }
      ],
      explanation: 'AV1 is the latest generation codec offering the best compression ratio, but it requires more processing power and time to encode.',
      weight: 1
    },
    {
      type: 'multiple-choice',
      id: 'mc-11',
      question: 'What is the recommended CRF range for H.264 encoding?',
      options: [
        { id: 'a', text: '0-10', correct: false },
        { id: 'b', text: '18-28', correct: true },
        { id: 'c', text: '30-40', correct: false },
        { id: 'd', text: '40-51', correct: false }
      ],
      explanation: 'The recommended CRF range for H.264 is 18-28, with 23 being the default and considered visually lossless.',
      weight: 1
    },
    {
      type: 'multiple-choice',
      id: 'mc-12',
      question: 'How do you chain multiple video filters together?',
      options: [
        { id: 'a', text: 'Use semicolons between filters', correct: false },
        { id: 'b', text: 'Use commas between filters', correct: true },
        { id: 'c', text: 'Use pipes between filters', correct: false },
        { id: 'd', text: 'Use multiple -vf flags', correct: false }
      ],
      explanation: 'Video filters are chained using commas within a single -vf flag, like: -vf "scale=1920:1080,crop=1280:720".',
      weight: 1
    },
    {
      type: 'multiple-choice',
      id: 'mc-13',
      question: 'What does -b:v 2M specify?',
      options: [
        { id: 'a', text: 'Video bitrate of 2 megabytes per second', correct: false },
        { id: 'b', text: 'Video bitrate of 2 megabits per second', correct: true },
        { id: 'c', text: 'Video buffer size of 2MB', correct: false },
        { id: 'd', text: 'Video bit depth of 2 bits', correct: false }
      ],
      explanation: 'The -b:v flag sets video bitrate. 2M means 2 megabits per second (Mbps), not megabytes.',
      weight: 1
    },
    // Command builder questions
    {
      type: 'command-builder',
      id: 'cb-1',
      title: 'Convert Video with H.265 Codec',
      description: 'Write an FFmpeg command to convert input.mp4 to output.mp4 using the H.265/HEVC codec for better compression.',
      requirements: [
        'Use -i flag for input file',
        'Use -c:v flag to specify H.265 codec (libx265)',
        'Output file should be output.mp4'
      ],
      hints: [
        'Start with ffmpeg -i input.mp4',
        'Use -c:v libx265 to specify H.265 codec',
        'Output filename comes last'
      ],
      solution: 'ffmpeg -i input.mp4 -c:v libx265 output.mp4',
      validation: {
        type: 'contains',
        value: '-c:v libx265'
      },
      weight: 2,
      explanation: 'H.265/HEVC provides better compression than H.264, resulting in smaller file sizes at the same quality.',
      sampleVideoId: 'sample-1',
      previewType: 'format'
    },
    {
      type: 'command-builder',
      id: 'cb-2',
      title: 'Resize Video with Scale Filter',
      description: 'Write an FFmpeg command to resize input.mp4 to 1920x1080 (Full HD) resolution using the scale filter.',
      requirements: [
        'Use -vf flag for video filter',
        'Use scale filter with dimensions 1920:1080',
        'Output file should be output.mp4'
      ],
      hints: [
        'Filter syntax: scale=width:height',
        'Use -vf before the filter',
        'Dimensions are separated by colon'
      ],
      solution: 'ffmpeg -i input.mp4 -vf scale=1920:1080 output.mp4',
      validation: {
        type: 'contains',
        value: 'scale=1920:1080'
      },
      weight: 2,
      explanation: 'The scale filter resizes video to the specified dimensions. Use width:height format.',
      sampleVideoId: 'sample-1',
      previewType: 'resize'
    },
    {
      type: 'command-builder',
      id: 'cb-3',
      title: 'Crop Video',
      description: 'Write an FFmpeg command to crop input.mp4 to a 640x480 section starting at coordinates (100, 50) from the top-left.',
      requirements: [
        'Use -vf flag with crop filter',
        'Crop dimensions: 640x480',
        'X-offset: 100, Y-offset: 50',
        'Copy audio stream without re-encoding'
      ],
      hints: [
        'Crop syntax: crop=width:height:x:y',
        'Use -c:a copy to copy audio',
        'Remember to quote the filter if it contains special characters'
      ],
      solution: 'ffmpeg -i input.mp4 -vf "crop=640:480:100:50" -c:a copy output.mp4',
      validation: {
        type: 'contains',
        value: 'crop=640:480:100:50'
      },
      weight: 2,
      explanation: 'The crop filter extracts a rectangular region. Format is crop=width:height:x-offset:y-offset.',
      sampleVideoId: 'sample-1',
      previewType: 'crop'
    },
    {
      type: 'command-builder',
      id: 'cb-4',
      title: 'Rotate Video 90 Degrees',
      description: 'Write an FFmpeg command to rotate input.mp4 90 degrees clockwise.',
      requirements: [
        'Use -vf flag with transpose filter',
        'Rotate 90° clockwise',
        'Copy audio stream'
      ],
      hints: [
        'transpose=1 rotates 90° clockwise',
        'Use -c:a copy to avoid re-encoding audio',
        'Remember transpose values: 1=90°CW, 2=90°CCW'
      ],
      solution: 'ffmpeg -i input.mp4 -vf "transpose=1" -c:a copy output.mp4',
      validation: {
        type: 'contains',
        value: 'transpose=1'
      },
      weight: 2,
      explanation: 'transpose=1 rotates video 90° clockwise. Audio is copied since rotation doesn\'t affect audio.',
      sampleVideoId: 'sample-1',
      previewType: 'filter'
    },
    {
      type: 'command-builder',
      id: 'cb-5',
      title: 'Change Frame Rate',
      description: 'Write an FFmpeg command to convert input.mp4 to 24 fps (frames per second).',
      requirements: [
        'Use -r flag to set output frame rate',
        'Set frame rate to 24 fps',
        'Output file should be output.mp4'
      ],
      hints: [
        'The -r flag sets output frame rate',
        'Place -r after -i but before output filename',
        'FFmpeg will duplicate or drop frames as needed'
      ],
      solution: 'ffmpeg -i input.mp4 -r 24 output.mp4',
      validation: {
        type: 'contains',
        value: '-r 24'
      },
      weight: 2,
      explanation: 'The -r flag sets the output frame rate. FFmpeg duplicates or drops frames to achieve the target rate.',
      sampleVideoId: 'sample-1',
      previewType: 'filter'
    },
    {
      type: 'command-builder',
      id: 'cb-6',
      title: 'Speed Up Video with Audio Sync',
      description: 'Write an FFmpeg command to speed up input.mp4 to 2× speed while keeping audio synchronized.',
      requirements: [
        'Use filter_complex for multiple filters',
        'Speed up video 2× using setpts',
        'Speed up audio 2× using atempo',
        'Map both processed streams'
      ],
      hints: [
        'setpts=0.5*PTS speeds up video 2×',
        'atempo=2.0 speeds up audio 2×',
        'Use -filter_complex to combine filters',
        'Use -map to select processed streams'
      ],
      solution: 'ffmpeg -i input.mp4 -filter_complex "[0:v]setpts=0.5*PTS[v];[0:a]atempo=2.0[a]" -map "[v]" -map "[a]" output.mp4',
      validation: {
        type: 'contains',
        value: 'setpts=0.5*PTS'
      },
      weight: 2,
      explanation: 'To speed up both video and audio together, use setpts for video timestamps and atempo for audio tempo, then map both streams.',
      sampleVideoId: 'sample-1',
      previewType: 'filter'
    },
    {
      type: 'command-builder',
      id: 'cb-7',
      title: 'High Quality Encoding with CRF',
      description: 'Write an FFmpeg command to encode input.mp4 with high quality using CRF 18.',
      requirements: [
        'Use -c:v libx264 for H.264 codec',
        'Set CRF to 18 (high quality)',
        'Output file should be output.mp4'
      ],
      hints: [
        'CRF flag is -crf',
        'Lower CRF = higher quality',
        'CRF 18 is high quality, CRF 23 is default'
      ],
      solution: 'ffmpeg -i input.mp4 -c:v libx264 -crf 18 output.mp4',
      validation: {
        type: 'contains',
        value: '-crf 18'
      },
      weight: 2,
      explanation: 'CRF (Constant Rate Factor) controls quality. Lower values (like 18) produce higher quality but larger files.',
      sampleVideoId: 'sample-1',
      previewType: 'format'
    }
  ]
};
