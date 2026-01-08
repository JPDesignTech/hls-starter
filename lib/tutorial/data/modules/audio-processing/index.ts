import { Module } from '@/lib/tutorial/types';
import { audioCodecs } from './audio-codecs';

export const audioProcessingModule: Module = {
  id: 'audio-processing',
  title: 'Audio Processing',
  description: 'Audio codec and processing techniques',
  lessons: [
    audioCodecs,
  ]
};
