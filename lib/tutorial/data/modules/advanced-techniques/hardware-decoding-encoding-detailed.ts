import { Lesson } from '@/lib/tutorial/types';

export const hardwareDecodingEncodingDetailed: Lesson = {
  id: 'hardware-decoding-encoding-detailed',
  title: 'Hardware Decoding/Encoding (Detailed)',
  module: 'Advanced Techniques',
  duration: 35,
  unlockAfter: 'format-specific-options',
  content: [
    {
      type: 'introduction',
      heading: 'What This Lesson Covers',
      content: 'Leveraging GPU-based decoders and encoders reliably — beyond basic flags. In workflows where throughput matters (live streams, bulk batch jobs), GPU offload can be the difference between minutes and hours of processing.'
    },
    {
      type: 'bullets',
      heading: 'Why It Matters',
      content: 'Hardware acceleration enables:',
      bullets: [
        'Dramatically faster encoding (5-10× speedup)',
        'Real-time encoding for live streaming',
        'Bulk batch processing of large libraries',
        'Lower CPU usage (frees CPU for other tasks)',
        'Production-ready high-throughput workflows'
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -hwaccel cuda -c:v h264_cuvid -i input.mp4 -c:v h264_nvenc output.mp4',
      explanation: 'NVIDIA decode + encode: Hardware decode with cuvid, hardware encode with nvenc. Full GPU pipeline for maximum performance.',
      flagBreakdown: [
        {
          flag: '-hwaccel cuda',
          description: 'Enable CUDA hardware acceleration'
        },
        {
          flag: '-c:v h264_cuvid',
          description: 'Use NVIDIA hardware decoder for H.264'
        },
        {
          flag: '-c:v h264_nvenc',
          description: 'Use NVIDIA hardware encoder for H.264'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -hwaccel cuda -c:v h264_cuvid -i input.mp4 -vf "scale_cuda=1280:720" -c:v h264_nvenc output.mp4',
      explanation: 'GPU-accelerated filter chain: Decode, scale, and encode all on GPU. scale_cuda uses GPU for scaling, keeping entire pipeline on GPU.',
      flagBreakdown: [
        {
          flag: '-vf "scale_cuda=1280:720"',
          description: 'GPU-accelerated scaling filter'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -hwaccel vaapi -i input.mp4 -vf "scale_vaapi=1920:1080" -c:v h264_vaapi output.mp4',
      explanation: 'VAAPI pipeline (Intel/AMD Linux): Hardware decode, GPU scaling, hardware encode. Full GPU acceleration on Linux.',
      flagBreakdown: [
        {
          flag: '-hwaccel vaapi',
          description: 'Enable VAAPI hardware acceleration (Linux)'
        },
        {
          flag: '-vf "scale_vaapi=1920:1080"',
          description: 'VAAPI-accelerated scaling'
        },
        {
          flag: '-c:v h264_vaapi',
          description: 'VAAPI hardware encoder'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -hwaccel cuda -c:v hevc_cuvid -i input.mp4 -c:v hevc_nvenc -preset p4 -b:v 5M output.mp4',
      explanation: 'HEVC hardware pipeline: Decode HEVC with cuvid, encode with nvenc HEVC. Preset p4 balances speed and quality.',
      flagBreakdown: [
        {
          flag: '-c:v hevc_cuvid',
          description: 'NVIDIA hardware decoder for HEVC'
        },
        {
          flag: '-c:v hevc_nvenc',
          description: 'NVIDIA hardware encoder for HEVC'
        },
        {
          flag: '-preset p4',
          description: 'NVENC preset p4 (balanced)'
        }
      ]
    },
    {
      type: 'bullets',
      heading: 'Hardware Acceleration Backends',
      content: 'Platform-specific options:',
      bullets: [
        'NVENC/NVDEC: NVIDIA GPUs (Windows/Linux)',
        'VAAPI: Intel/AMD GPUs (Linux)',
        'VideoToolbox: Apple Silicon/Intel Macs (macOS)',
        'QSV: Intel Quick Sync Video (integrated graphics)',
        'AMF: AMD GPUs (Windows)',
        'Choose backend based on your platform and hardware'
      ]
    },
    {
      type: 'bullets',
      heading: 'Hardware Pipeline Tips',
      content: 'Optimizing hardware acceleration:',
      bullets: [
        'Use hardware decoders when available: -c:v codec_cuvid/vaapi',
        'Keep filters on GPU when possible: scale_cuda, scale_vaapi',
        'Use hardware encoders: h264_nvenc, hevc_nvenc, etc.',
        'Test quality vs speed trade-offs with presets',
        'Monitor GPU utilization and temperature',
        'Fallback to CPU if GPU unavailable',
        'Hardware acceleration can be 5-10× faster than CPU'
      ]
    },
    {
      type: 'preview',
      heading: 'Try It: Hardware Decoding/Encoding',
      content: 'Experience full GPU-accelerated pipeline for maximum performance',
      code: 'ffmpeg -hwaccel cuda -c:v h264_cuvid -i sample.mp4 -c:v h264_nvenc -b:v 3M output.mp4',
      explanation: 'This uses NVIDIA hardware for both decoding and encoding, creating a full GPU pipeline. Hardware acceleration dramatically speeds up processing.',
      previewType: 'filter',
      sampleVideoId: 'sample-advanced-101'
    },
    {
      type: 'challenge',
      title: 'Create Full GPU Pipeline',
      description: 'Create a command that uses GPU for decode, scale, and encode',
      requirements: [
        'Use CUDA hardware acceleration',
        'Hardware decode H.264',
        'GPU-accelerated scaling to 1280×720',
        'Hardware encode with NVENC'
      ],
      hints: [
        '-hwaccel cuda enables CUDA',
        'h264_cuvid for hardware decode',
        'scale_cuda for GPU scaling',
        'h264_nvenc for hardware encode'
      ],
      solution: 'ffmpeg -hwaccel cuda -c:v h264_cuvid -i input.mp4 -vf "scale_cuda=1280:720" -c:v h264_nvenc output.mp4',
      validation: {
        type: 'contains',
        value: 'scale_cuda'
      }
    },
    {
      type: 'quiz',
      question: 'What is the main advantage of using hardware decoders and encoders together?',
      options: [
        { id: 'a', text: 'Better quality', correct: false },
        { id: 'b', text: 'Maximum performance with full GPU pipeline', correct: true },
        { id: 'c', text: 'Smaller file sizes', correct: false },
        { id: 'd', text: 'Better compatibility', correct: false }
      ],
      explanation: 'Using hardware decoders and encoders together creates a full GPU pipeline, keeping all processing on the GPU. This maximizes performance by avoiding CPU-GPU transfers and can provide 5-10× speedup compared to CPU-only processing.'
    }
  ]
};
