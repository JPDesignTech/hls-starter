import { type Lesson } from '@/lib/tutorial/types';

export const hardwareAcceleration: Lesson = {
  id: 'hardware-acceleration',
  title: 'Hardware Acceleration',
  module: 'Optimization & Performance',
  duration: 30,
  unlockAfter: 'two-pass-encoding',
  content: [
    {
      type: 'introduction',
      heading: 'What This Lesson Covers',
      content: 'Using GPU/ASIC hardware to speed up video encoding/decoding. Hardware encoders can offload work from the CPU, drastically improving throughput — especially for high-resolution or live workflows.'
    },
    {
      type: 'bullets',
      heading: 'Why It Matters',
      content: 'Hardware acceleration enables:',
      bullets: [
        'Drastically faster encoding (often 5-10× faster)',
        'Lower CPU usage, freeing CPU for other tasks',
        'Real-time encoding for live streaming',
        'Batch processing of large video libraries',
        'Better performance on high-resolution content'
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -hwaccel cuda -i input.mp4 -c:v h264_nvenc -b:v 5M output.mp4',
      explanation: 'NVIDIA GPU encoding using NVENC. Requires NVIDIA GPU with NVENC support. Much faster than CPU encoding.',
      flagBreakdown: [
        {
          flag: '-hwaccel cuda',
          description: 'Enable CUDA hardware acceleration (NVIDIA GPUs)'
        },
        {
          flag: '-c:v h264_nvenc',
          description: 'Use NVIDIA H.264 hardware encoder'
        },
        {
          flag: '-b:v 5M',
          description: 'Set video bitrate to 5 megabits per second'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -hwaccel vaapi -i input.mp4 -c:v h264_vaapi -b:v 5M output.mp4',
      explanation: 'VAAPI hardware acceleration (Intel/AMD on Linux). Uses GPU for encoding on supported systems.',
      flagBreakdown: [
        {
          flag: '-hwaccel vaapi',
          description: 'Enable VAAPI hardware acceleration (Intel/AMD Linux)'
        },
        {
          flag: '-c:v h264_vaapi',
          description: 'Use VAAPI H.264 hardware encoder'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -c:v h264_videotoolbox -b:v 5M output.mp4',
      explanation: 'VideoToolbox hardware acceleration (macOS). Uses Apple\'s hardware encoder on Mac systems.',
      flagBreakdown: [
        {
          flag: '-c:v h264_videotoolbox',
          description: 'Use VideoToolbox H.264 hardware encoder (macOS)'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -hwaccel cuda -i input.mp4 -c:v hevc_nvenc -preset p4 -b:v 5M output.mp4',
      explanation: 'NVIDIA HEVC encoding with preset. Presets control speed vs quality (p1=fastest, p7=slowest but best quality).',
      flagBreakdown: [
        {
          flag: '-c:v hevc_nvenc',
          description: 'Use NVIDIA HEVC (H.265) hardware encoder'
        },
        {
          flag: '-preset p4',
          description: 'NVENC preset p4 (balanced speed/quality)'
        }
      ]
    },
    {
      type: 'diagram',
      title: 'Hardware Acceleration Pipeline',
      diagram: `sequenceDiagram
    participant Input as Input File
    participant GPU as GPU Decoder
    participant Filter as GPU Filter
    participant Encoder as GPU Encoder
    participant Output as Output File
    
    Input->>GPU: Hardware Decode
    GPU->>Filter: Decoded Frames
    Filter->>Encoder: Filtered Frames
    Encoder->>Output: Encoded Video`,
      explanation: 'Hardware acceleration pipeline: GPU handles decoding, filtering, and encoding, keeping the entire process on the GPU for maximum performance.',
      diagramType: 'mermaid',
      diagramFormat: 'sequenceDiagram'
    },
    {
      type: 'bullets',
      heading: 'Supported Hardware Backends',
      content: 'Available hardware acceleration options:',
      bullets: [
        'NVENC/NVDEC: NVIDIA GPUs (GeForce, Quadro, Tesla)',
        'VAAPI: Intel/AMD GPUs on Linux',
        'VideoToolbox: Apple Silicon and Intel Macs',
        'AMF: AMD GPUs on Windows (via FFmpeg AMF support)',
        'QSV: Intel Quick Sync Video (integrated graphics)',
        'Hardware acceleration can be 5-10× faster than CPU encoding'
      ]
    },
    {
      type: 'bullets',
      heading: 'Hardware Acceleration Tips',
      content: 'Best practices:',
      bullets: [
        'Check GPU support: ffmpeg -encoders | grep nvenc',
        'Hardware encoders may have different quality per bitrate than CPU',
        'Tune quality settings for your hardware encoder',
        'Use presets to balance speed vs quality',
        'Fallback to CPU encoding if GPU unavailable',
        'Monitor GPU temperature during long encoding sessions'
      ]
    },
    {
      type: 'preview',
      heading: 'Try It: Hardware Acceleration',
      content: 'Experience GPU-accelerated encoding with significantly faster processing times',
      code: 'ffmpeg -hwaccel cuda -i sample.mp4 -c:v h264_nvenc -b:v 3M output.mp4',
      explanation: 'This uses NVIDIA GPU encoding (if available). GPU encoding is typically 5-10× faster than CPU encoding. If GPU is not available, this will fall back to CPU encoding.',
      previewType: 'filter',
      sampleVideoId: 'sample-optimization-083'
    },
    {
      type: 'challenge',
      title: 'Use GPU Encoding',
      description: 'Create a command that uses NVIDIA GPU to encode HEVC video',
      requirements: [
        'Use CUDA hardware acceleration',
        'Use HEVC NVENC encoder',
        'Set bitrate to 4M'
      ],
      hints: [
        'Use -hwaccel cuda for NVIDIA',
        'hevc_nvenc is the HEVC encoder',
        'Set bitrate with -b:v 4M'
      ],
      solution: 'ffmpeg -hwaccel cuda -i input.mp4 -c:v hevc_nvenc -b:v 4M output.mp4',
      validation: {
        type: 'contains',
        value: 'hevc_nvenc'
      }
    },
    {
      type: 'quiz',
      question: 'What is the main advantage of hardware acceleration for video encoding?',
      options: [
        { id: 'a', text: 'Better quality at same bitrate', correct: false },
        { id: 'b', text: 'Significantly faster encoding speed', correct: true },
        { id: 'c', text: 'Smaller file sizes', correct: false },
        { id: 'd', text: 'Better audio quality', correct: false }
      ],
      explanation: 'Hardware acceleration uses dedicated GPU/ASIC encoders to offload work from the CPU, resulting in dramatically faster encoding (often 5-10× faster). This is especially beneficial for high-resolution content and batch processing.'
    }
  ]
};
