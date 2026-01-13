/**
 * Tutorial data registry
 * Aggregates all modules and provides a flat lessons array
 */

import { type Lesson } from '../types';
import { fundamentalsModule } from './modules/fundamentals';
import { videoProcessingModule } from './modules/video-processing';
import { audioProcessingModule } from './modules/audio-processing';
import { ffprobeModule } from './modules/ffprobe';
import { ffplayModule } from './modules/ffplay';
import { commonUseCasesModule } from './modules/common-use-cases';
import { advancedFiltersModule } from './modules/advanced-filters';
import { optimizationPerformanceModule } from './modules/optimization-performance';
import { advancedTechniquesModule } from './modules/advanced-techniques';

// Export all modules
export const modules = [
  fundamentalsModule,
  videoProcessingModule,
  audioProcessingModule,
  ffprobeModule,
  ffplayModule,
  commonUseCasesModule,
  advancedFiltersModule,
  optimizationPerformanceModule,
  advancedTechniquesModule,
];

// Flatten all lessons into a single array
export const lessons: Lesson[] = modules.flatMap(module => module.lessons);

// Export modules individually for convenience
export { fundamentalsModule, videoProcessingModule, audioProcessingModule, ffprobeModule, ffplayModule, commonUseCasesModule, advancedFiltersModule, optimizationPerformanceModule, advancedTechniquesModule };
