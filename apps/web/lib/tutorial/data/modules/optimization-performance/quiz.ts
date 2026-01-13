import { ModuleQuiz } from '@/lib/tutorial/types/module-quiz';

export const optimizationPerformanceQuiz: ModuleQuiz = {
  id: 'optimization-performance-quiz',
  moduleId: 'optimization-performance',
  title: 'Optimization & Performance Mastery Quiz',
  description: 'Test your understanding of encoding optimization techniques including two-pass encoding, hardware acceleration, multi-threading, file size optimization, speed vs quality trade-offs, and performance tuning.',
  passingScore: 70,
  questions: [
    // Multiple-choice questions from lessons
    {
      type: 'multiple-choice',
      id: 'mc-1',
      question: 'What is the main advantage of two-pass encoding over single-pass?',
      options: [
        { id: 'a', text: 'Faster encoding time', correct: false },
        { id: 'b', text: 'Higher quality at target file size', correct: true },
        { id: 'c', text: 'Smaller output files', correct: false },
        { id: 'd', text: 'Better audio quality', correct: false }
      ],
      explanation: 'Two-pass encoding analyzes video complexity first, then allocates bits optimally in the second pass. This results in higher quality at the target file size compared to single-pass encoding, which allocates bits uniformly.',
      weight: 1,
      source: 'two-pass-encoding'
    },
    {
      type: 'multiple-choice',
      id: 'mc-2',
      question: 'What is the main advantage of hardware acceleration for video encoding?',
      options: [
        { id: 'a', text: 'Better quality at same bitrate', correct: false },
        { id: 'b', text: 'Significantly faster encoding speed', correct: true },
        { id: 'c', text: 'Smaller file sizes', correct: false },
        { id: 'd', text: 'Better audio quality', correct: false }
      ],
      explanation: 'Hardware acceleration uses dedicated GPU/ASIC encoders to offload work from the CPU, resulting in dramatically faster encoding (often 5-10× faster). This is especially beneficial for high-resolution content and batch processing.',
      weight: 1,
      source: 'hardware-acceleration'
    },
    {
      type: 'multiple-choice',
      id: 'mc-3',
      question: 'What does -threads 0 do in FFmpeg?',
      options: [
        { id: 'a', text: 'Disables multi-threading', correct: false },
        { id: 'b', text: 'Auto-detects optimal thread count', correct: true },
        { id: 'c', text: 'Uses only one thread', correct: false },
        { id: 'd', text: 'Uses maximum possible threads', correct: false }
      ],
      explanation: '-threads 0 tells FFmpeg to automatically detect and use the optimal number of threads based on your CPU cores. This is usually the best choice as it maximizes performance without manual tuning.',
      weight: 1,
      source: 'multi-threading'
    },
    {
      type: 'multiple-choice',
      id: 'mc-4',
      question: 'What is the main trade-off between faster and slower encoding presets?',
      options: [
        { id: 'a', text: 'Faster presets produce better quality', correct: false },
        { id: 'b', text: 'Slower presets produce smaller files at same quality', correct: true },
        { id: 'c', text: 'Faster presets produce smaller files', correct: false },
        { id: 'd', text: 'Slower presets are always better', correct: false }
      ],
      explanation: 'Slower presets use more advanced compression algorithms that take longer to encode but produce smaller files at the same quality level. Faster presets prioritize speed over compression efficiency, resulting in larger files.',
      weight: 1,
      source: 'encoding-speed-vs-quality'
    },
    {
      type: 'multiple-choice',
      id: 'mc-5',
      question: 'What is the main advantage of using CRF over fixed bitrate for file size optimization?',
      options: [
        { id: 'a', text: 'Faster encoding', correct: false },
        { id: 'b', text: 'Maintains quality while adjusting file size', correct: true },
        { id: 'c', text: 'Smaller output files', correct: false },
        { id: 'd', text: 'Better audio quality', correct: false }
      ],
      explanation: 'CRF (Constant Rate Factor) maintains consistent quality across the video while allowing file size to vary. This means complex scenes get more bits and simple scenes get fewer bits, resulting in better quality per file size compared to fixed bitrate encoding.',
      weight: 1,
      source: 'file-size-optimization'
    },
    {
      type: 'multiple-choice',
      id: 'mc-6',
      question: 'What is the main trade-off between CPU and GPU encoding?',
      options: [
        { id: 'a', text: 'CPU is always faster', correct: false },
        { id: 'b', text: 'GPU is faster but CPU provides better quality per bitrate', correct: true },
        { id: 'c', text: 'GPU produces smaller files', correct: false },
        { id: 'd', text: 'CPU requires more memory', correct: false }
      ],
      explanation: 'GPU encoding is typically 5-10× faster than CPU encoding, making it ideal for real-time and batch processing. However, CPU encoding generally provides better quality per bitrate and more consistent compression efficiency, making it better for final encodes when quality matters most.',
      weight: 1,
      source: 'cpu-vs-gpu-encoding'
    },
    // Command-builder questions
    {
      type: 'command-builder',
      id: 'cb-1',
      title: 'Use Two-Pass Encoding',
      description: 'Write an FFmpeg command to perform two-pass encoding with bitrate 2500k. First pass should analyze the video, second pass should encode with audio.',
      requirements: [
        'Use ffmpeg command',
        'Use libx264 codec',
        'Set bitrate to 2500k',
        'First pass: use -pass 1, disable audio with -an, output to null',
        'Second pass: use -pass 2, include audio encoding',
        'Chain both passes with &&'
      ],
      hints: [
        'First pass: -pass 1 -an -f null /dev/null',
        'Second pass: -pass 2 -c:a aac',
        'Both passes use same -b:v 2500k',
        'Use && to chain commands',
        'Add -y flag before first -i to overwrite'
      ],
      solution: 'ffmpeg -y -i input.mp4 -c:v libx264 -b:v 2500k -pass 1 -an -f null /dev/null && ffmpeg -i input.mp4 -c:v libx264 -b:v 2500k -pass 2 -c:a aac output.mp4',
      validation: {
        type: 'contains',
        value: '-pass 1'
      },
      weight: 2,
      explanation: 'Two-pass encoding analyzes video complexity in the first pass, then uses that data to allocate bits optimally in the second pass. This produces better quality at the target file size compared to single-pass encoding.',
      sampleVideoId: 'sample-1',
      previewType: 'format'
    },
    {
      type: 'command-builder',
      id: 'cb-2',
      title: 'Enable Hardware Acceleration',
      description: 'Write an FFmpeg command to use NVIDIA GPU encoding with CUDA hardware acceleration and bitrate 4M.',
      requirements: [
        'Use ffmpeg command',
        'Enable CUDA hardware acceleration',
        'Use h264_nvenc encoder',
        'Set bitrate to 4M',
        'Output file is output.mp4'
      ],
      hints: [
        'Use -hwaccel cuda for NVIDIA acceleration',
        'h264_nvenc is the NVIDIA H.264 encoder',
        'Set bitrate with -b:v 4M',
        'Place -hwaccel before -i'
      ],
      solution: 'ffmpeg -hwaccel cuda -i input.mp4 -c:v h264_nvenc -b:v 4M output.mp4',
      validation: {
        type: 'contains',
        value: 'h264_nvenc'
      },
      weight: 2,
      explanation: 'Hardware acceleration uses dedicated GPU encoders to dramatically speed up encoding. NVIDIA NVENC can be 5-10× faster than CPU encoding, making it ideal for batch processing and real-time encoding.',
      sampleVideoId: 'sample-1',
      previewType: 'format'
    },
    {
      type: 'command-builder',
      id: 'cb-3',
      title: 'Optimize with Encoding Preset',
      description: 'Write an FFmpeg command to encode with medium preset for balanced speed and compression efficiency, using CRF 23 for quality.',
      requirements: [
        'Use ffmpeg command',
        'Use libx264 codec',
        'Set preset to medium',
        'Set CRF to 23',
        'Output file is output.mp4'
      ],
      hints: [
        '-preset medium provides balanced encoding',
        '-crf 23 is high quality default',
        'Preset controls speed vs compression',
        'CRF controls quality level'
      ],
      solution: 'ffmpeg -i input.mp4 -c:v libx264 -preset medium -crf 23 output.mp4',
      validation: {
        type: 'contains',
        value: '-preset medium'
      },
      weight: 2,
      explanation: 'The medium preset provides a good balance between encoding speed and compression efficiency. Combined with CRF 23, this produces high-quality output with reasonable encoding time.',
      sampleVideoId: 'sample-1',
      previewType: 'format'
    },
    {
      type: 'command-builder',
      id: 'cb-4',
      title: 'Optimize File Size with CRF',
      description: 'Write an FFmpeg command to optimize file size using CRF 28 with slow preset for better compression, and copy audio without re-encoding.',
      requirements: [
        'Use ffmpeg command',
        'Use libx264 codec',
        'Set CRF to 28',
        'Set preset to slow',
        'Copy audio without re-encoding',
        'Output file is output.mp4'
      ],
      hints: [
        'CRF 28 provides good quality with smaller files',
        '-preset slow improves compression',
        'Use -c:a copy to avoid audio re-encoding',
        'Lower CRF = better quality but larger files'
      ],
      solution: 'ffmpeg -i input.mp4 -c:v libx264 -crf 28 -preset slow -c:a copy output.mp4',
      validation: {
        type: 'contains',
        value: '-crf 28'
      },
      weight: 2,
      explanation: 'CRF 28 provides good quality with smaller file sizes. The slow preset improves compression efficiency, and copying audio avoids unnecessary re-encoding while saving processing time.',
      sampleVideoId: 'sample-1',
      previewType: 'format'
    },
    {
      type: 'command-builder',
      id: 'cb-5',
      title: 'Configure Multi-Threading',
      description: 'Write an FFmpeg command to use automatic thread detection for optimal CPU utilization with medium preset.',
      requirements: [
        'Use ffmpeg command',
        'Use libx264 codec',
        'Set threads to 0 (auto-detect)',
        'Use medium preset',
        'Output file is output.mp4'
      ],
      hints: [
        '-threads 0 auto-detects optimal thread count',
        'Place -threads after -c:v',
        'Combine with -preset medium',
        'Auto-threading uses all available CPU cores'
      ],
      solution: 'ffmpeg -i input.mp4 -c:v libx264 -threads 0 -preset medium output.mp4',
      validation: {
        type: 'contains',
        value: '-threads 0'
      },
      weight: 2,
      explanation: 'Setting -threads 0 allows FFmpeg to automatically detect and use the optimal number of threads based on your CPU cores. This maximizes performance without manual tuning.',
      sampleVideoId: 'sample-1',
      previewType: 'format'
    }
  ]
};
