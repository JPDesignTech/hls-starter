import { type Module } from '@/lib/tutorial/types';
import { introductionToFFprobe } from './introduction-to-ffprobe';
import { basicMetadataExtraction } from './basic-metadata-extraction';
import { extractingFormatInformation } from './extracting-format-information';
import { streamAnalysis } from './stream-analysis';
import { frameByFrameAnalysis } from './frame-by-frame-analysis';
import { codecDetection } from './codec-detection';
import { durationAndBitrateAnalysis } from './duration-and-bitrate-analysis';
import { resolutionAndFrameRateDetection } from './resolution-and-frame-rate-detection';
import { audioStreamAnalysis } from './audio-stream-analysis';
import { videoStreamAnalysis } from './video-stream-analysis';
import { jsonOutputFormatting } from './json-output-formatting';
import { extractingSpecificMetadataFields } from './extracting-specific-metadata-fields';
import { frameTimestampAnalysis } from './frame-timestamp-analysis';
import { ffprobeQuiz } from './quiz';

export const ffprobeModule: Module = {
  id: 'ffprobe',
  title: 'FFProbe - Media Analysis',
  description: 'Media analysis and metadata extraction using FFprobe',
  lessons: [
    introductionToFFprobe,
    basicMetadataExtraction,
    extractingFormatInformation,
    streamAnalysis,
    frameByFrameAnalysis,
    codecDetection,
    durationAndBitrateAnalysis,
    resolutionAndFrameRateDetection,
    audioStreamAnalysis,
    videoStreamAnalysis,
    jsonOutputFormatting,
    extractingSpecificMetadataFields,
    frameTimestampAnalysis,
  ],
  quiz: ffprobeQuiz,
};
