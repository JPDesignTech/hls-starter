import { Module } from '@/lib/tutorial/types';
import { introductionToFFplay } from './introduction-to-ffplay';
import { basicVideoPlayback } from './basic-video-playback';
import { windowSizeControl } from './window-size-control';
import { startingPlaybackFromSpecificTime } from './starting-playback-from-specific-time';
import { loopingPlayback } from './looping-playback';
import { interactiveControlsKeyboardShortcuts } from './interactive-controls-keyboard-shortcuts';
import { fullScreenMode } from './full-screen-mode';
import { audioChannelSelection } from './audio-channel-selection';
import { subtitleDisplay } from './subtitle-display';
import { lowLatencyStreamingPlayback } from './low-latency-streaming-playback';
import { testingStreams } from './testing-streams';
import { ffplayQuiz } from './quiz';

export const ffplayModule: Module = {
  id: 'ffplay',
  title: 'FFPlay - Video Playback',
  description: 'Video playback and stream testing using FFplay',
  lessons: [
    introductionToFFplay,
    basicVideoPlayback,
    windowSizeControl,
    startingPlaybackFromSpecificTime,
    loopingPlayback,
    interactiveControlsKeyboardShortcuts,
    fullScreenMode,
    audioChannelSelection,
    subtitleDisplay,
    lowLatencyStreamingPlayback,
    testingStreams,
  ],
  quiz: ffplayQuiz,
};
