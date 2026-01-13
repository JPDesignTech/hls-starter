import { type Module } from '@/lib/tutorial/types';
import { videoCodecs } from './video-codecs';
import { qualityControl } from './quality-control';
import { filteringBasics } from './filtering-basics';
import { croppingVideos } from './cropping-videos';
import { rotatingFlipping } from './rotating-flipping';
import { frameRateManipulation } from './frame-rate-manipulation';
import { aspectRatioChanges } from './aspect-ratio-changes';
import { videoStabilization } from './video-stabilization';
import { timelapseCreation } from './timelapse-creation';
import { slowMotionSpeed } from './slow-motion-speed';
import { videoConcatenation } from './video-concatenation';
import { pictureInPicture } from './picture-in-picture';
import { chromaKeying } from './chroma-keying';
import { motionDetection } from './motion-detection';
import { videoOverlays } from './video-overlays';
import { addingWatermarks } from './adding-watermarks';
import { videoProcessingQuiz } from './quiz';

export const videoProcessingModule: Module = {
  id: 'video-processing',
  title: 'Video Processing',
  description: 'Advanced video manipulation and processing techniques',
  lessons: [
    videoCodecs,
    qualityControl,
    filteringBasics,
    croppingVideos,
    rotatingFlipping,
    frameRateManipulation,
    aspectRatioChanges,
    videoStabilization,
    timelapseCreation,
    slowMotionSpeed,
    videoConcatenation,
    pictureInPicture,
    chromaKeying,
    motionDetection,
    videoOverlays,
    addingWatermarks,
  ],
  quiz: videoProcessingQuiz,
};
