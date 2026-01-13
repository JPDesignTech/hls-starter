import { type Lesson } from '@/lib/tutorial/types';

export const cpuVsGpuEncoding: Lesson = {
  id: 'cpu-vs-gpu-encoding',
  title: 'CPU vs GPU Encoding',
  module: 'Optimization & Performance',
  duration: 30,
  unlockAfter: 'memory-usage-control',
  content: [
    {
      type: 'introduction',
      heading: 'What This Lesson Covers',
      content: 'How to decide between software (CPU) and hardware (GPU) encoding. Understanding the trade-offs between quality, speed, and flexibility for different use cases.'
    },
    {
      type: 'bullets',
      heading: 'Why It Matters',
      content: 'Choosing the right encoder enables:',
      bullets: [
        'Optimal performance for your workflow',
        'Best quality vs speed balance',
        'Efficient resource utilization',
        'Cost-effective encoding solutions',
        'Right tool for the job'
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -c:v libx264 output.mp4',
      explanation: 'CPU encoding using libx264. Generally higher quality per bitrate, more flexible settings, and finer control. Slower but best quality.',
      flagBreakdown: [
        {
          flag: '-c:v libx264',
          description: 'Use CPU-based H.264 encoder (software encoding)'
        }
      ],
      tryItYourself: true
    },
    {
      type: 'code',
      command: 'ffmpeg -hwaccel cuda -i input.mp4 -c:v h264_nvenc output.mp4',
      explanation: 'GPU encoding using NVIDIA NVENC. Much faster throughput, lower CPU usage, but potentially higher file size or artifacts without tuning.',
      flagBreakdown: [
        {
          flag: '-hwaccel cuda',
          description: 'Enable CUDA hardware acceleration (NVIDIA)'
        },
        {
          flag: '-c:v h264_nvenc',
          description: 'Use NVIDIA hardware H.264 encoder'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -hwaccel cuda -i input.mp4 -c:v h264_nvenc -preset p4 -b:v 5M output.mp4',
      explanation: 'GPU encoding with quality tuning. Use presets (p1-p7) to balance speed vs quality. p4 is balanced, p7 is best quality.',
      flagBreakdown: [
        {
          flag: '-preset p4',
          description: 'NVENC preset p4 (balanced speed/quality)'
        },
        {
          flag: '-b:v 5M',
          description: 'Set bitrate for quality control'
        }
      ]
    },
    {
      type: 'code',
      command: 'ffmpeg -i input.mp4 -c:v libx264 -preset slow -crf 23 output.mp4',
      explanation: 'CPU encoding with quality optimization. Slow preset with CRF provides best quality per bitrate, ideal for final encodes.',
      flagBreakdown: [
        {
          flag: '-preset slow',
          description: 'Slow preset for best compression (CPU)'
        },
        {
          flag: '-crf 23',
          description: 'High quality setting'
        }
      ]
    },
    {
      type: 'diagram',
      title: 'CPU vs GPU Encoding Comparison',
      diagram: `flowchart LR
    subgraph CPU[CPU Encoding]
        CPUInput[Input] --> CPUDecode[CPU Decode]
        CPUDecode --> CPUProcess[CPU Process]
        CPUProcess --> CPUEncode[CPU Encode]
        CPUEncode --> CPUOutput[Output]
    end
    
    subgraph GPU[GPU Encoding]
        GPUInput[Input] --> GPUDecode[GPU Decode]
        GPUDecode --> GPUProcess[GPU Process]
        GPUProcess --> GPUEncode[GPU Encode]
        GPUEncode --> GPUOutput[Output]
    end`,
      explanation: 'CPU encoding provides better quality and flexibility but is slower. GPU encoding is much faster but may require tuning for optimal quality.',
      diagramType: 'mermaid',
      diagramFormat: 'flowchart'
    },
    {
      type: 'bullets',
      heading: 'CPU Encoding Advantages',
      content: 'When to use CPU encoding:',
      bullets: [
        'Higher quality per bitrate (better compression)',
        'More flexible settings and fine control',
        'Consistent quality across different hardware',
        'Best for final encodes when quality matters most',
        'No GPU required, works on any system',
        'Better for two-pass encoding'
      ]
    },
    {
      type: 'bullets',
      heading: 'GPU Encoding Advantages',
      content: 'When to use GPU encoding:',
      bullets: [
        'Much faster throughput (5-10× faster)',
        'Lower CPU usage (frees CPU for other tasks)',
        'Great for real-time or live streaming',
        'Ideal for batch processing large libraries',
        'Better for high-resolution content',
        'Good for quick previews and testing'
      ]
    },
    {
      type: 'bullets',
      heading: 'Decision Guide',
      content: 'Choose based on your needs:',
      bullets: [
        'CPU: Best quality, final encodes, when time allows',
        'GPU: Speed critical, real-time, batch processing, live streaming',
        'GPU: May need tuning for quality (use presets, bitrate control)',
        'CPU: More consistent quality, better compression efficiency',
        'Hybrid: Use GPU for speed, CPU for final quality pass'
      ]
    },
    {
      type: 'preview',
      heading: 'Try It: GPU Encoding',
      content: 'Experience GPU-accelerated encoding with faster processing times',
      code: 'ffmpeg -hwaccel cuda -i sample.mp4 -c:v h264_nvenc -b:v 3M output.mp4',
      explanation: 'This uses NVIDIA GPU encoding (if available). GPU encoding is typically 5-10× faster than CPU encoding but may require tuning for optimal quality. Compare encoding time and file size with CPU encoding.',
      previewType: 'filter',
      sampleVideoId: 'sample-optimization-089'
    },
    {
      type: 'challenge',
      title: 'Compare CPU and GPU Encoding',
      description: 'Create a GPU encoding command with quality preset',
      requirements: [
        'Use CUDA hardware acceleration',
        'Use h264_nvenc encoder',
        'Set preset to p6 (high quality)',
        'Set bitrate to 4M'
      ],
      hints: [
        '-hwaccel cuda enables NVIDIA acceleration',
        'h264_nvenc is the NVIDIA encoder',
        '-preset p6 provides high quality',
        'Set bitrate with -b:v 4M'
      ],
      solution: 'ffmpeg -hwaccel cuda -i input.mp4 -c:v h264_nvenc -preset p6 -b:v 4M output.mp4',
      validation: {
        type: 'contains',
        value: 'h264_nvenc'
      }
    },
    {
      type: 'quiz',
      question: 'What is the main trade-off between CPU and GPU encoding?',
      options: [
        { id: 'a', text: 'CPU is always faster', correct: false },
        { id: 'b', text: 'GPU is faster but CPU provides better quality per bitrate', correct: true },
        { id: 'c', text: 'GPU produces smaller files', correct: false },
        { id: 'd', text: 'CPU requires more memory', correct: false }
      ],
      explanation: 'GPU encoding is typically 5-10× faster than CPU encoding, making it ideal for real-time and batch processing. However, CPU encoding generally provides better quality per bitrate and more consistent compression efficiency, making it better for final encodes when quality matters most.'
    }
  ]
};
