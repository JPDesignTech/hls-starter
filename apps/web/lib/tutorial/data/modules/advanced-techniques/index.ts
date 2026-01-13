import { Module } from '@/lib/tutorial/types';
import { complexFilterGraphs } from './complex-filter-graphs';
import { multipleInputProcessing } from './multiple-input-processing';
import { advancedAudioFiltering } from './advanced-audio-filtering';
import { advancedVideoFiltering } from './advanced-video-filtering';
import { customFilterCreation } from './custom-filter-creation';
import { scriptAutomation } from './script-automation';
import { errorHandling } from './error-handling';
import { loggingAndDebugging } from './logging-and-debugging';
import { performanceProfiling } from './performance-profiling';
import { advancedMuxingDemuxing } from './advanced-muxing-demuxing';
import { formatSpecificOptions } from './format-specific-options';
import { hardwareDecodingEncodingDetailed } from './hardware-decoding-encoding-detailed';
import { advancedTechniquesQuiz } from './quiz';

export const advancedTechniquesModule: Module = {
  id: 'advanced-techniques',
  title: 'Advanced Techniques',
  description: 'Master advanced FFmpeg workflows, automation, and debugging techniques',
  lessons: [
    complexFilterGraphs,
    multipleInputProcessing,
    advancedAudioFiltering,
    advancedVideoFiltering,
    customFilterCreation,
    scriptAutomation,
    errorHandling,
    loggingAndDebugging,
    performanceProfiling,
    advancedMuxingDemuxing,
    formatSpecificOptions,
    hardwareDecodingEncodingDetailed,
  ],
  quiz: advancedTechniquesQuiz
};
