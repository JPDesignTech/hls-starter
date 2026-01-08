'use client';

import * as React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HelpTooltipProps {
  content: string | React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
  iconClassName?: string;
}

export function HelpTooltip({ 
  content, 
  side = 'top',
  className,
  iconClassName 
}: HelpTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex items-center justify-center rounded-full hover:bg-white/10 transition-colors",
              className
            )}
            aria-label="Help information"
          >
            <Info className={cn("h-4 w-4 text-gray-400", iconClassName)} />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          {typeof content === 'string' ? <p>{content}</p> : content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Predefined help content for common WTF features
export const WTF_HELP = {
  overview: {
    format: 'Container format (e.g., MP4, MKV) that wraps the media streams.',
    duration: 'Total playback duration of the media file.',
    bitrate: 'Average bitrate - the amount of data per second in the file.',
    size: 'Total file size on disk.',
  },
  streams: {
    codec: 'Codec used to encode/decode the stream (e.g., H.264, AAC).',
    resolution: 'Video resolution: width × height in pixels.',
    framerate: 'Frames per second (FPS) for video streams.',
    bitrate: 'Bitrate for this specific stream.',
    profile: 'Codec profile indicating encoding features used.',
    level: 'Codec level indicating maximum capabilities.',
  },
  frames: {
    keyframe: 'I-frame: a frame that can be decoded independently.',
    pts: 'Presentation Timestamp: when the frame should be displayed.',
    dts: 'Decode Timestamp: when the frame should be decoded.',
    pict_type: 'Picture type: I (Intra), P (Predicted), or B (Bidirectional).',
  },
  packets: {
    size: 'Packet size in bytes.',
    pts: 'Presentation Timestamp of the packet.',
    stream: 'Which stream (video/audio) this packet belongs to.',
    duration: 'Duration this packet represents.',
  },
  timeline: {
    frameTypes: 'Visualization of I/P/B frame distribution over time.',
    keyframes: 'Markers showing keyframe positions.',
    gop: 'Group of Pictures: frames between keyframes.',
  },
  bitstream: {
    hex: 'Raw binary data displayed in hexadecimal format.',
    nal: 'Network Abstraction Layer units for H.264/H.265 codecs.',
    structure: 'Hierarchical structure of the bitstream data.',
  },
  codec: {
    compatibility: 'Codec compatibility with common players and browsers.',
    features: 'Encoding features and capabilities of the codec.',
    parameters: 'Detailed codec-specific parameters.',
  },
};

interface HelpIconProps {
  topic: keyof typeof WTF_HELP;
  field: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export function HelpIcon({ topic, field, side = 'top' }: HelpIconProps) {
  const helpText = WTF_HELP[topic]?.[field as keyof typeof WTF_HELP[typeof topic]];
  
  if (!helpText) return null;

  return (
    <HelpTooltip content={helpText} side={side} />
  );
}
