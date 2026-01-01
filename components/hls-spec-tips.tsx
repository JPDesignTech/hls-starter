'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Info, BookOpen, ExternalLink, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import Link from 'next/link';

interface HlsTip {
  term: string;
  definition: string;
  specSection: string;
  specLink: string;
}

const hlsTips: HlsTip[] = [
  {
    term: "HTTP Live Streaming",
    definition: "A protocol for transmitting unbounded streams of multimedia data consisting of a continuous stream of small files",
    specSection: "1",
    specLink: "https://datatracker.ietf.org/doc/html/rfc8216#section-1"
  },
  {
    term: "Media Segment",
    definition: "A Media Segment is a continuous stream of media data that a client can obtain via a single HTTP GET request",
    specSection: "3",
    specLink: "https://datatracker.ietf.org/doc/html/rfc8216#section-3"
  },
  {
    term: "Media Playlist",
    definition: "A Media Playlist contains a list of Media Segments which, when played sequentially, will play the stream",
    specSection: "2",
    specLink: "https://datatracker.ietf.org/doc/html/rfc8216#section-2"
  },
  {
    term: "Master Playlist",
    definition: "A Master Playlist provides a set of Variant Streams, each of which describes a different version of the same content",
    specSection: "2",
    specLink: "https://datatracker.ietf.org/doc/html/rfc8216#section-2"
  },
  {
    term: "Variant Stream",
    definition: "A Variant Stream includes a Media Playlist that specifies media encoded at a particular bit rate, in a particular format, at a particular resolution",
    specSection: "2",
    specLink: "https://datatracker.ietf.org/doc/html/rfc8216#section-2"
  },
  {
    term: "Rendition",
    definition: "A Rendition is an alternate version of the content, such as a different language or camera angle",
    specSection: "2",
    specLink: "https://datatracker.ietf.org/doc/html/rfc8216#section-2"
  },
  {
    term: "Transport Stream",
    definition: "MPEG-2 Transport Streams are specified by ISO/IEC 13818 and are a supported Media Segment format",
    specSection: "3.2",
    specLink: "https://datatracker.ietf.org/doc/html/rfc8216#section-3.2"
  },
  {
    term: "Fragmented MP4",
    definition: "Fragmented MPEG-4 (fMP4) segments are specified by ISO/IEC 14496 and require protocol version 7",
    specSection: "3.3",
    specLink: "https://datatracker.ietf.org/doc/html/rfc8216#section-3.3"
  },
  {
    term: "Target Duration",
    definition: "The EXT-X-TARGETDURATION tag specifies the maximum Media Segment duration",
    specSection: "4.3.3.1",
    specLink: "https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.3.1"
  },
  {
    term: "Media Sequence",
    definition: "Each Media Segment has a unique integer Media Sequence Number starting from 0 or the value of EXT-X-MEDIA-SEQUENCE",
    specSection: "4.3.3.2",
    specLink: "https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.3.2"
  },
  {
    term: "Playlist Types",
    definition: "Three types exist: Live (can change), Event (append-only), and VOD (Video On Demand - static)",
    specSection: "4.3.3.5",
    specLink: "https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.3.5"
  },
  {
    term: "Encryption",
    definition: "Media Segments MAY be encrypted using AES-128 with a 128-bit key and PKCS7 padding",
    specSection: "4.3.2.4",
    specLink: "https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.4"
  },
  {
    term: "Byte Range",
    definition: "EXT-X-BYTERANGE indicates that a Media Segment is a sub-range of a resource identified by its URI",
    specSection: "4.3.2.2",
    specLink: "https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.2.2"
  },
  {
    term: "Client Responsibilities",
    definition: "Clients MUST reload the Playlist file to discover new segments and check for changes in Live playlists",
    specSection: "6.3.1",
    specLink: "https://datatracker.ietf.org/doc/html/rfc8216#section-6.3.1"
  },
  {
    term: "Version Compatibility",
    definition: "A client MUST NOT attempt to use a Playlist containing a EXT-X-VERSION tag with a value greater than it supports",
    specSection: "7",
    specLink: "https://datatracker.ietf.org/doc/html/rfc8216#section-7"
  }
];

function HlsSpecTips() {
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
              setCurrentTipIndex((prevIndex) => (prevIndex + 1) % hlsTips.length);
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
    const newIndex = currentTipIndex === 0 ? hlsTips.length - 1 : currentTipIndex - 1;
    goToTip(newIndex);
  };

  const goToNext = () => {
    const newIndex = (currentTipIndex + 1) % hlsTips.length;
    goToTip(newIndex);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const currentTip = hlsTips[currentTipIndex];

  return (
    <div className="my-4 relative min-h-[100px]">
      <div 
        className={`bg-gradient-to-r from-purple-900/30 via-blue-900/30 to-purple-900/30 rounded-lg px-4 py-3 border border-purple-500/20 transition-opacity duration-300 will-change-[opacity] ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ isolation: 'isolate', contain: 'layout style paint' }}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <div className="relative">
              <BookOpen className="h-4 w-4 text-purple-400" />
              <div className="absolute inset-0 h-4 w-4 bg-purple-400 rounded-full opacity-20" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-purple-300 font-semibold text-sm bg-purple-500/10 px-2 py-0.5 rounded-md">
                {currentTip.term}
              </span>
              <span className="text-gray-300 text-sm">{currentTip.definition}</span>
              <Link 
                href={currentTip.specLink} 
                target="_blank"
                className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors whitespace-nowrap group"
              >
                <span className="border-b border-dotted border-blue-400/50 group-hover:border-blue-300">
                  RFC §{currentTip.specSection}
                </span>
                <ExternalLink className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
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
          {hlsTips.map((_, index) => (
            <button
              key={index}
              onClick={() => goToTip(index)}
              className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              title={`Go to tip ${index + 1}: ${hlsTips[index].term}`}
            >
              {index === currentTipIndex && !isPaused && (
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"
                  style={{
                    animation: 'progress 6s linear'
                  }}
                />
              )}
              {index === currentTipIndex && isPaused && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full" />
              )}
              {index < currentTipIndex && (
                <div className="absolute inset-0 bg-purple-400/50 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Quick tip label */}
      <div className="absolute -top-2 left-4 bg-gradient-to-r from-gray-900 to-gray-800 px-3 py-0.5 rounded-full shadow-lg z-10">
        <span className="text-xs text-purple-400 font-medium flex items-center gap-1">
          <Info className="h-3 w-3" />
          HLS Spec Quick Reference
          <span className="text-purple-300 ml-1">
            ({currentTipIndex + 1}/{hlsTips.length})
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
export default React.memo(HlsSpecTips); 