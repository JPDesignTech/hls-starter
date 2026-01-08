import { Module } from '@/lib/tutorial/types';
import { whatIsFFmpeg } from './what-is-ffmpeg';
import { installationSetup } from './installation-setup';
import { inputOutput } from './input-output';
import { basicFormatConversion } from './basic-format-conversion';
import { containersVsCodecs } from './containers-vs-codecs';
import { commandStructureFlags } from './command-structure-flags';

export const fundamentalsModule: Module = {
  id: 'fundamentals',
  title: 'Fundamentals',
  description: 'Core concepts and basics of FFmpeg',
  lessons: [
    whatIsFFmpeg,
    installationSetup,
    inputOutput,
    basicFormatConversion,
    containersVsCodecs,
    commandStructureFlags,
  ]
};
