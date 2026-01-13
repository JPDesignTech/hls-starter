import { type Module } from '@/lib/tutorial/types';
import { convertingMp4ToMp3 } from './converting-mp4-to-mp3';
import { creatingVideoThumbnails } from './creating-video-thumbnails';
import { addingSubtitlesToVideos } from './adding-subtitles-to-videos';
import { creatingImageSlideshows } from './creating-image-slideshows';
import { timecodeBurnIn } from './timecode-burn-in';
import { extractingIndividualAudioChannels } from './extracting-individual-audio-channels';
import { creatingVideoLoops } from './creating-video-loops';
import { batchProcessingMultipleFiles } from './batch-processing-multiple-files';
import { extractingVideoSegments } from './extracting-video-segments';
import { creatingGifsFromVideo } from './creating-gifs-from-video';
import { convertingVideosForWeb } from './converting-videos-for-web';
import { optimizingVideoFileSizes } from './optimizing-video-file-sizes';
import { creatingSquarePortraitVideos } from './creating-square-portrait-videos';
import { addingTextOverlays } from './adding-text-overlays';
import { commonUseCasesQuiz } from './quiz';

export const commonUseCasesModule: Module = {
  id: 'common-use-cases',
  title: 'Common Use Cases',
  description: 'Practical real-world FFmpeg workflows and common tasks',
  lessons: [
    convertingMp4ToMp3,
    creatingVideoThumbnails,
    addingSubtitlesToVideos,
    creatingImageSlideshows,
    timecodeBurnIn,
    extractingIndividualAudioChannels,
    creatingVideoLoops,
    batchProcessingMultipleFiles,
    extractingVideoSegments,
    creatingGifsFromVideo,
    convertingVideosForWeb,
    optimizingVideoFileSizes,
    creatingSquarePortraitVideos,
    addingTextOverlays,
  ],
  quiz: commonUseCasesQuiz,
};
