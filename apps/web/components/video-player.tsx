'use client';

import * as React from 'react';
import Hls from 'hls.js';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  onQualityChange?: (quality: string) => void;
}

export function VideoPlayer({
  src,
  poster,
  className,
  autoPlay = false,
  muted = false,
  onQualityChange,
}: VideoPlayerProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const hlsRef = React.useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(muted);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [buffered, setBuffered] = React.useState(0);
  const [currentQuality, setCurrentQuality] = React.useState<string>('Auto');
  const [availableQualities, setAvailableQualities] = React.useState<string[]>([]);
  const [showControls, setShowControls] = React.useState(true);
  const controlsTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const [qualityLevels, setQualityLevels] = React.useState<{ quality: string; index: number }[]>([]);

  React.useEffect(() => {
    if (!videoRef.current || !src) return;

    const video = videoRef.current;

    // Load video source
    if (src) {
      // Check if it's an HLS stream - support both .m3u8 files and proxy URLs
      const isHLSStream = src.endsWith('.m3u8') || src.includes('/api/hls-proxy');
      
      if (!isHLSStream) {
        // For regular video files, just set the source directly
        video.src = src;
        video.addEventListener('loadedmetadata', () => {
          if (autoPlay) void video.play();
        });
        return;
      }
      
      // Handle HLS streams
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = src;
        video.addEventListener('loadedmetadata', () => {
          if (autoPlay) void video.play();
        });
      } else if (Hls?.isSupported()) {
        // HLS.js for other browsers
        const hls = new Hls({
          debug: false,
          enableWorker: true,
          lowLatencyMode: false,
        });
        hlsRef.current = hls;
        
        hls.loadSource(src);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (autoPlay) void video.play();
          
          // Get available quality levels
          const uniqueQualities = new Set<string>();
          const levels = hls.levels.map((level, index) => {
            const height = level.height;
            let quality: string;
            if (height >= 1080) quality = '1080p';
            else if (height >= 720) quality = '720p';
            else if (height >= 480) quality = '480p';
            else quality = '360p';
            
            // If we already have this quality, add the bitrate to make it unique
            if (uniqueQualities.has(quality)) {
              quality = `${quality} (${Math.round(level.bitrate / 1000)}kbps)`;
            }
            uniqueQualities.add(quality);
            
            return {
              quality,
              index,
            };
          });
          
          setQualityLevels(levels);
          setAvailableQualities(['Auto', ...levels.map(l => l.quality)]);
          
          // Set initial quality (auto by default)
          if (hls.currentLevel === -1) {
            setCurrentQuality('Auto');
          } else {
            const currentLevel = levels.find(l => l.index === hls.currentLevel);
            setCurrentQuality(currentLevel?.quality ?? 'Auto');
          }
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
          const level = hls.levels[data.level];
          const height = level.height;
          let quality = 'Auto';
          if (height >= 1080) quality = '1080p';
          else if (height >= 720) quality = '720p';
          else if (height >= 480) quality = '480p';
          else quality = '360p';
          
          setCurrentQuality(quality);
          onQualityChange?.(quality);
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            console.error('HLS fatal error:', data);
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                break;
            }
          }
        });
      } else {
        console.error('This browser does not support HLS playback');
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, autoPlay, onQualityChange]);

  // Video event handlers
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBuffered((bufferedEnd / video.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => setIsMuted(video.muted);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, []);

  // Control visibility
  const showControlsTemporarily = React.useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  React.useEffect(() => {
    showControlsTemporarily();
  }, [showControlsTemporarily]);

  // Player controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        void videoRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const seek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(currentTime + 10, duration);
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(currentTime - 10, 0);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        void document.exitFullscreen();
      } else {
        void videoRef.current.requestFullscreen();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const changeQuality = (quality: string) => {
    if (!hlsRef.current) return;

    if (quality === 'Auto') {
      hlsRef.current.currentLevel = -1;
    } else {
      // Find the level that matches this quality
      const level = qualityLevels.find(l => l.quality === quality);
      if (level !== undefined) {
        hlsRef.current.currentLevel = level.index;
      }
    }
    
    setCurrentQuality(quality);
  };

  return (
    <Card 
      className={cn('relative overflow-hidden bg-black', className)}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        poster={poster}
        muted={isMuted}
        onClick={togglePlay}
      />

      {/* Video Controls */}
      <div 
        className={cn(
          'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0'
        )}
      >
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="relative h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer"
               onClick={(e) => {
                 const rect = e.currentTarget.getBoundingClientRect();
                 const percent = (e.clientX - rect.left) / rect.width;
                 seek(percent * duration);
               }}>
            {/* Buffered */}
            <div 
              className="absolute h-full bg-white/30"
              style={{ width: `${buffered}%` }}
            />
            {/* Progress */}
            <div 
              className="absolute h-full bg-white"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={togglePlay}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>

            {/* Skip backward */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={skipBackward}
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            {/* Skip forward */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={skipForward}
            >
              <SkipForward className="h-4 w-4" />
            </Button>

            {/* Volume */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={toggleMute}
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>

            {/* Time */}
            <span className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quality Selector */}
            <select
              value={currentQuality}
              onChange={(e) => changeQuality(e.target.value)}
              className="bg-white/20 text-white text-sm px-2 py-1 rounded hover:bg-white/30 cursor-pointer"
            >
              {availableQualities.map((q, index) => (
                <option key={`${q}-${index}`} value={q}>{q}</option>
              ))}
            </select>

            {/* Fullscreen */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={toggleFullscreen}
            >
              <Maximize className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
} 