import { Module } from '@/lib/tutorial/types';
import { dynamicOverlayPlacement } from './dynamic-overlay-placement';
import { speedRamping } from './speed-ramping';
import { frameInterpolation } from './frame-interpolation';
import { colorGrading } from './color-grading';
import { blurEffects } from './blur-effects';
import { sharpening } from './sharpening';
import { noiseReduction } from './noise-reduction';
import { deinterlacing } from './deinterlacing';
import { transitionsBetweenClips } from './transitions-between-clips';
import { advancedScalingOptions } from './advanced-scaling-options';
import { histogramAnalysis } from './histogram-analysis';
import { advancedFiltersQuiz } from './quiz';

export const advancedFiltersModule: Module = {
  id: 'advanced-filters',
  title: 'Advanced Filters',
  description: 'Master advanced visual effects and filter techniques',
  lessons: [
    dynamicOverlayPlacement,
    speedRamping,
    frameInterpolation,
    colorGrading,
    blurEffects,
    sharpening,
    noiseReduction,
    deinterlacing,
    transitionsBetweenClips,
    advancedScalingOptions,
    histogramAnalysis,
  ],
  quiz: advancedFiltersQuiz,
};
