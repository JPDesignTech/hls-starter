'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Info, Sparkles, ChevronLeft, ChevronRight, Pause, Play, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ModuleTip {
  title: string;
  description: string;
  moduleHref: string | null;
  iconColor: string;
  gradientColor: string;
}

const moduleTips: ModuleTip[] = [
  // FFMPEG Fundamentals
  {
    title: "What is FFMPEG",
    description: "FFMPEG is a powerful multimedia framework that can decode, encode, transcode, mux, demux, stream, filter, and play media files. It supports hundreds of codecs and formats.",
    moduleHref: null,
    iconColor: "text-teal-400",
    gradientColor: "from-teal-400 to-cyan-400"
  },
  {
    title: "FFMPEG Components",
    description: "FFmpeg handles encoding/decoding, FFprobe analyzes media files to extract information, and FFplay provides playback capabilities. Together they form a complete media toolkit.",
    moduleHref: null,
    iconColor: "text-yellow-400",
    gradientColor: "from-yellow-400 to-orange-400"
  },
  {
    title: "How FFMPEG Works",
    description: "FFMPEG uses a command-line interface with a flexible filter system. It processes media through codecs, applies filters for transformations, and outputs in various formats for different use cases.",
    moduleHref: null,
    iconColor: "text-teal-400",
    gradientColor: "from-teal-400 to-cyan-400"
  },
  {
    title: "Common Use Cases",
    description: "Convert videos between formats, compress files, adjust quality and resolution, extract audio, add watermarks, create thumbnails, and prepare content for streaming platforms.",
    moduleHref: null,
    iconColor: "text-yellow-400",
    gradientColor: "from-yellow-400 to-orange-400"
  },
  // Platform Capabilities
  {
    title: "Cloud Processing",
    description: "Videos are uploaded directly to cloud storage and processed serverlessly, enabling scalable video processing without managing infrastructure or worrying about file size limits.",
    moduleHref: null,
    iconColor: "text-teal-400",
    gradientColor: "from-teal-400 to-cyan-400"
  },
  {
    title: "Adaptive Streaming",
    description: "Generate HLS playlists with multiple quality levels automatically. The player adapts to network conditions, switching between bitrates for optimal playback experience.",
    moduleHref: null,
    iconColor: "text-yellow-400",
    gradientColor: "from-yellow-400 to-orange-400"
  },
  {
    title: "Deep Analysis",
    description: "Inspect media files at the frame level, analyze packet structures, visualize bitstreams, and understand codec-specific details for debugging and optimization.",
    moduleHref: null,
    iconColor: "text-teal-400",
    gradientColor: "from-teal-400 to-cyan-400"
  },
  // Module-Specific Tips
  {
    title: "HLS Video Processing",
    description: "Upload videos to generate adaptive bitrate HLS playlists with multiple quality levels, or analyze existing playlists with deep segment inspection and quality analysis.",
    moduleHref: "/hls-video-processing",
    iconColor: "text-purple-400",
    gradientColor: "from-purple-400 to-pink-400"
  },
  {
    title: "What the FFMPEG",
    description: "Upload media files to get comprehensive analysis including stream information, frame-level data, packet inspection, bitstream visualization, and codec-specific details.",
    moduleHref: "/what-the-ffmpeg",
    iconColor: "text-yellow-400",
    gradientColor: "from-yellow-400 to-orange-400"
  },
  {
    title: "Video Corruption Checker",
    description: "Detect corruption issues including missing metadata, codec problems, sync issues, and damaged frames. Get detailed analysis and FFmpeg commands to fix detected problems.",
    moduleHref: "/corruption-check",
    iconColor: "text-green-400",
    gradientColor: "from-green-400 to-emerald-400"
  },
  {
    title: "FFMPEG Command Builder",
    description: "Build commands with pre-defined operations or analyze existing commands to visualize and understand what each flag does. Perfect for learning FFMPEG syntax interactively.",
    moduleHref: "/ffmpeg-command-builder",
    iconColor: "text-teal-400",
    gradientColor: "from-teal-400 to-cyan-400"
  },
  // Advanced Features
  {
    title: "Command Learning",
    description: "Learn FFMPEG syntax interactively by building commands step-by-step or analyzing existing ones. Visualize flag meanings and see how different options affect output.",
    moduleHref: null,
    iconColor: "text-yellow-400",
    gradientColor: "from-yellow-400 to-orange-400"
  },
  {
    title: "Quality Analysis",
    description: "Inspect HLS playlists to understand segment structure, bitrate distribution, and adaptive streaming behavior. Identify quality level transitions and optimize encoding settings.",
    moduleHref: null,
    iconColor: "text-teal-400",
    gradientColor: "from-teal-400 to-cyan-400"
  },
  {
    title: "Media Debugging",
    description: "Use detailed analysis tools to debug media file issues, understand codec properties, identify sync problems, and optimize workflows for better performance.",
    moduleHref: null,
    iconColor: "text-yellow-400",
    gradientColor: "from-yellow-400 to-orange-400"
  },
  {
    title: "Workflow Optimization",
    description: "Combine multiple tools to create efficient video processing workflows from upload to analysis. Streamline your media pipeline with integrated cloud processing and analysis.",
    moduleHref: null,
    iconColor: "text-teal-400",
    gradientColor: "from-teal-400 to-cyan-400"
  }
];

function ModuleSpecTips() {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRotation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      if (!isPaused) {
        // Use startTransition for non-urgent updates
        React.startTransition(() => {
          setIsVisible(false);
          
          setTimeout(() => {
            React.startTransition(() => {
              setCurrentTipIndex((prevIndex) => (prevIndex + 1) % moduleTips.length);
              setIsVisible(true);
            });
          }, 300);
        });
      }
    }, 6000); // Change tip every 6 seconds
  };

  useEffect(() => {
    startRotation();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused]);

  const goToTip = (index: number) => {
    React.startTransition(() => {
      setIsVisible(false);
      setTimeout(() => {
        React.startTransition(() => {
          setCurrentTipIndex(index);
          setIsVisible(true);
          startRotation(); // Reset the timer
        });
      }, 300);
    });
  };

  const goToPrevious = () => {
    const newIndex = currentTipIndex === 0 ? moduleTips.length - 1 : currentTipIndex - 1;
    goToTip(newIndex);
  };

  const goToNext = () => {
    const newIndex = (currentTipIndex + 1) % moduleTips.length;
    goToTip(newIndex);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const currentTip = moduleTips[currentTipIndex];
  const badgeBgColor = currentTip.iconColor.replace('text-', 'bg-').replace('-400', '-500/10');
  const progressGradient = currentTip.gradientColor;

  return (
    <div className="my-4 relative min-h-[100px]">
      <div 
        className={`bg-gradient-to-r from-teal-900/30 via-cyan-900/30 to-teal-900/30 rounded-lg px-4 py-3 border border-teal-500/20 transition-opacity duration-300 will-change-[opacity] ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ isolation: 'isolate', contain: 'layout style paint' }}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <div className="relative">
              <Sparkles className={`h-4 w-4 ${currentTip.iconColor}`} />
              <div className={`absolute inset-0 h-4 w-4 ${currentTip.iconColor.replace('text-', 'bg-')} rounded-full opacity-20`} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`${currentTip.iconColor} font-semibold text-sm ${badgeBgColor} px-2 py-0.5 rounded-md`}>
                {currentTip.title}
              </span>
              <span className="text-gray-300 text-sm">{currentTip.description}</span>
              {currentTip.moduleHref && (
                <Link 
                  href={currentTip.moduleHref}
                  className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors whitespace-nowrap group"
                >
                  <span className="border-b border-dotted border-blue-400/50 group-hover:border-blue-300">
                    Try Module
                  </span>
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
              )}
            </div>
          </div>
          
          {/* Navigation Controls */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={goToPrevious}
              className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
              title="Previous tip"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
            <button
              onClick={togglePause}
              className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
              title={isPaused ? "Resume auto-rotation" : "Pause auto-rotation"}
            >
              {isPaused ? (
                <Play className="h-3 w-3" />
              ) : (
                <Pause className="h-3 w-3" />
              )}
            </button>
            <button
              onClick={goToNext}
              className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
              title="Next tip"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
        
        {/* Progress indicators */}
        <div className="absolute bottom-1 left-4 right-4 flex gap-1">
          {moduleTips.map((_, index) => {
            const tip = moduleTips[index];
            const tipGradient = tip.gradientColor;
            return (
              <button
                key={index}
                onClick={() => goToTip(index)}
                className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                title={`Go to tip ${index + 1}: ${tip.title}`}
              >
                {index === currentTipIndex && !isPaused && (
                  <div 
                    className={`absolute inset-0 bg-gradient-to-r ${progressGradient} rounded-full`}
                    style={{
                      animation: 'progress 6s linear'
                    }}
                  />
                )}
                {index === currentTipIndex && isPaused && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${progressGradient} rounded-full`} />
                )}
                {index < currentTipIndex && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${tipGradient} opacity-50 rounded-full`} />
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Quick tip label */}
      <div className="absolute -top-2 left-4 bg-gradient-to-r from-gray-900 to-gray-800 px-3 py-0.5 rounded-full shadow-lg z-10">
        <span className="text-xs text-teal-400 font-medium flex items-center gap-1">
          <Info className="h-3 w-3" />
          Platform Guide
          <span className="text-teal-300 ml-1">
            ({currentTipIndex + 1}/{moduleTips.length})
          </span>
        </span>
      </div>
      
      <style jsx>{`
        @keyframes progress {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export default React.memo(ModuleSpecTips);
