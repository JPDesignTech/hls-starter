import { Module } from '@/lib/tutorial/types';
import { twoPassEncoding } from './two-pass-encoding';
import { hardwareAcceleration } from './hardware-acceleration';
import { multiThreading } from './multi-threading';
import { fileSizeOptimization } from './file-size-optimization';
import { encodingSpeedVsQuality } from './encoding-speed-vs-quality';
import { preProcessingOptimization } from './pre-processing-optimization';
import { memoryUsageControl } from './memory-usage-control';
import { cpuVsGpuEncoding } from './cpu-vs-gpu-encoding';
import { optimizationPerformanceQuiz } from './quiz';

export const optimizationPerformanceModule: Module = {
  id: 'optimization-performance',
  title: 'Optimization & Performance',
  description: 'Master encoding optimization techniques for better performance and quality',
  lessons: [
    twoPassEncoding,
    hardwareAcceleration,
    multiThreading,
    fileSizeOptimization,
    encodingSpeedVsQuality,
    preProcessingOptimization,
    memoryUsageControl,
    cpuVsGpuEncoding,
  ],
  quiz: optimizationPerformanceQuiz
};
