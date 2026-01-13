import { Module } from '@/lib/tutorial/types';
import { audioCodecs } from './audio-codecs';
import { extractingAudioFromVideo } from './extracting-audio-from-video';
import { convertingAudioFormats } from './converting-audio-formats';
import { audioBitrateControl } from './audio-bitrate-control';
import { audioChannelManipulation } from './audio-channel-manipulation';
import { audioNormalization } from './audio-normalization';
import { audioMixingAndMerging } from './audio-mixing-and-merging';
import { removingAudioFromVideo } from './removing-audio-from-video';
import { audioFadeInFadeOut } from './audio-fade-in-fade-out';
import { changingAudioSpeedPitch } from './changing-audio-speed-pitch';

export const audioProcessingModule: Module = {
  id: 'audio-processing',
  title: 'Audio Processing',
  description: 'Audio codec and processing techniques',
  lessons: [
    audioCodecs,
    extractingAudioFromVideo,
    convertingAudioFormats,
    audioBitrateControl,
    audioChannelManipulation,
    audioNormalization,
    audioMixingAndMerging,
    removingAudioFromVideo,
    audioFadeInFadeOut,
    changingAudioSpeedPitch,
  ]
};
