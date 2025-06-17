'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileVideo, List, Clock, HardDrive, Zap, FileText, Play, Download, ExternalLink, Loader2, Pause, SkipForward, SkipBack } from 'lucide-react';
import Link from 'next/link';

interface VideoMetadata {
  id: string;
  url: string;
  status?: string;
  processStatus?: string;
  isOriginal?: boolean;
  qualities?: Array<{
    name: string;
    bandwidth: number;
    resolution: string;
  }>;
  files?: Array<{
    name: string;
    url: string;
    size: number;
  }>;
  processedAt?: string;
  error?: string;
}

interface Segment {
  duration: number;
  uri: string;
  index: number;
  byteRange?: {
    length: number;
    offset: number;
  };
}

interface ParsedManifest {
  version: number;
  targetDuration: number;
  segments: Segment[];
  totalDuration: number;
  qualityLevels?: Array<{
    bandwidth: number;
    resolution: string;
    uri: string;
  }>;
}

// Import HLS.js dynamically to avoid SSR issues
let Hls: any = null;
if (typeof window !== 'undefined') {
  import('hls.js').then((module) => {
    Hls = module.default;
  });
}

export default function VideoAnalyzePage() {
  const params = useParams();
  const videoId = params.id as string;
  const [videoData, setVideoData] = useState<VideoMetadata | null>(null);
  const [selectedManifest, setSelectedManifest] = useState<string>('');
  const [manifestContent, setManifestContent] = useState<string>('');
  const [parsedManifest, setParsedManifest] = useState<ParsedManifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);

  // Fetch video metadata
  useEffect(() => {
    async function fetchVideoData() {
      try {
        const response = await fetch(`/api/video/${videoId}/status`);
        if (!response.ok) throw new Error('Failed to fetch video data');
        const data = await response.json();
        console.log('Video data:', data);
        
        // If we have a master.m3u8 URL but no files array, create a synthetic files array
        if ((!data.files || data.files.length === 0) && data.url && data.url.includes('master.m3u8')) {
          console.log('Creating synthetic files array from master URL');
          const baseUrl = data.url.substring(0, data.url.lastIndexOf('/'));
          
          // Create synthetic file entries for Google Transcoder output
          data.files = [
            {
              name: `${videoId}/master.m3u8`,
              url: data.url,
              size: 1024 // Unknown size
            }
          ];
          
          // Add quality-specific playlists based on Google Transcoder naming
          const qualities = ['1080p', '720p', '480p', '360p'];
          qualities.forEach((quality) => {
            data.files.push({
              name: `${videoId}/hls-${quality}.m3u8`,
              url: `${baseUrl}/hls-${quality}.m3u8`,
              size: 1024 // Unknown size
            });
          });
        }
        
        setVideoData(data);
        
        // If we have files array, set master manifest as default
        if (data.files?.length > 0) {
          const masterFile = data.files.find((f: any) => f.name.includes('master.m3u8'));
          if (masterFile) {
            setSelectedManifest(masterFile.url);
          }
        } else if (data.url) {
          // If no files but we have a URL, use it directly
          setSelectedManifest(data.url);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load video data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchVideoData();
  }, [videoId]);

  // Fetch and parse manifest content
  useEffect(() => {
    if (!selectedManifest) return;
    
    async function fetchManifest() {
      try {
        const response = await fetch(selectedManifest);
        if (!response.ok) throw new Error('Failed to fetch manifest');
        const content = await response.text();
        setManifestContent(content);
        
        // Parse the manifest
        const parsed = parseManifest(content, selectedManifest);
        console.log('Parsed manifest:', parsed);
        console.log('Number of segments:', parsed.segments.length);
        console.log('Total duration:', parsed.totalDuration);
        setParsedManifest(parsed);
      } catch (err) {
        console.error('Error fetching manifest:', err);
      }
    }
    
    fetchManifest();
  }, [selectedManifest]);

  // Parse HLS manifest
  function parseManifest(content: string, manifestUrl: string): ParsedManifest {
    const lines = content.split('\n').filter(line => line.trim());
    const parsed: ParsedManifest = {
      version: 3,
      targetDuration: 0,
      segments: [],
      totalDuration: 0,
    };
    
    // Check if this is a master playlist
    if (content.includes('#EXT-X-STREAM-INF')) {
      parsed.qualityLevels = [];
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('#EXT-X-STREAM-INF')) {
          const bandwidthMatch = lines[i].match(/BANDWIDTH=(\d+)/);
          const resolutionMatch = lines[i].match(/RESOLUTION=([^,\s]+)/);
          
          // For Google Transcoder output, extract quality from the URI
          if (i + 1 < lines.length && !lines[i + 1].startsWith('#')) {
            const uri = lines[i + 1];
            let resolution = resolutionMatch?.[1] || 'Unknown';
            let qualityName = 'Unknown';
            
            // Extract quality from Google Transcoder naming (hls-1080p.m3u8, etc.)
            const qualityMatch = uri.match(/hls-(\d+p)\.m3u8/);
            if (qualityMatch) {
              qualityName = qualityMatch[1];
              // Map quality to resolution if not provided
              const resolutionMap: Record<string, string> = {
                '1080p': '1920x1080',
                '720p': '1280x720',
                '480p': '854x480',
                '360p': '640x360',
              };
              if (!resolutionMatch && resolutionMap[qualityName]) {
                resolution = resolutionMap[qualityName];
              }
            }
            
            parsed.qualityLevels.push({
              bandwidth: parseInt(bandwidthMatch?.[1] || '0'),
              resolution: resolution,
              uri: uri,
            });
          }
        }
      }
    } else {
      // Parse media playlist
      let segmentIndex = 0;
      let byteRangeStart = 0;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('#EXT-X-VERSION')) {
          parsed.version = parseInt(lines[i].split(':')[1]);
        } else if (lines[i].startsWith('#EXT-X-TARGETDURATION')) {
          parsed.targetDuration = parseInt(lines[i].split(':')[1]);
        } else if (lines[i].startsWith('#EXTINF')) {
          const duration = parseFloat(lines[i].split(':')[1].split(',')[0]);
          
          // Check if next line is BYTERANGE (Google Transcoder format)
          let byteRange = null;
          let uriLineOffset = 1;
          
          if (i + 1 < lines.length && lines[i + 1].startsWith('#EXT-X-BYTERANGE')) {
            const rangeMatch = lines[i + 1].match(/#EXT-X-BYTERANGE:(\d+)(@(\d+))?/);
            if (rangeMatch) {
              const length = parseInt(rangeMatch[1]);
              const offset = rangeMatch[3] ? parseInt(rangeMatch[3]) : byteRangeStart;
              byteRange = { length, offset };
              byteRangeStart = offset + length;
              uriLineOffset = 2; // URI is 2 lines after EXTINF
            }
          }
          
          // Get the URI (either 1 or 2 lines after EXTINF)
          if (i + uriLineOffset < lines.length && !lines[i + uriLineOffset].startsWith('#')) {
            const segment: Segment = {
              duration,
              uri: lines[i + uriLineOffset],
              index: segmentIndex++,
              ...(byteRange && { byteRange })
            };
            
            parsed.segments.push(segment);
            parsed.totalDuration += duration;
          }
        }
      }
    }
    
    return parsed;
  }

  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function formatBytes(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  // Download file helper
  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  // Initialize HLS player when a playlist is selected
  useEffect(() => {
    if (!selectedManifest || !videoRef.current || !Hls || !selectedManifest.endsWith('.m3u8')) return;

    const video = videoRef.current;
    
    // Only load quality-specific playlists, not the master
    const isQualityPlaylist = selectedManifest.includes('hls-') && !selectedManifest.includes('master');
    if (!isQualityPlaylist && videoData?.url) {
      // If master playlist is selected, try to auto-select first quality
      return;
    }
    
    if (Hls.isSupported()) {
      // Destroy existing instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      
      const hls = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: false,
      });
      hlsRef.current = hls;
      
      hls.loadSource(selectedManifest);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('HLS manifest loaded for:', selectedManifest);
        video.play().catch(e => console.log('Autoplay prevented:', e));
      });

      hls.on(Hls.Events.ERROR, (event: any, data: any) => {
        if (data.fatal) {
          console.error('Fatal HLS error:', data);
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

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // For Safari native HLS support
      video.src = selectedManifest;
    }
  }, [selectedManifest, Hls, videoData?.url]);

  // Update current time and detect current segment
  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    
    const updateTime = () => {
      setCurrentTime(video.currentTime);
      
      // Find current segment based on time
      if (parsedManifest?.segments) {
        let accumulatedTime = 0;
        for (let i = 0; i < parsedManifest.segments.length; i++) {
          if (video.currentTime >= accumulatedTime && 
              video.currentTime < accumulatedTime + parsedManifest.segments[i].duration) {
            setCurrentSegmentIndex(i);
            break;
          }
          accumulatedTime += parsedManifest.segments[i].duration;
        }
      }
    };

    const updateDuration = () => {
      setDuration(video.duration);
    };

    const updatePlayState = () => {
      setIsPlaying(!video.paused);
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('play', updatePlayState);
    video.addEventListener('pause', updatePlayState);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('play', updatePlayState);
      video.removeEventListener('pause', updatePlayState);
    };
  }, [parsedManifest]);

  // Jump to segment
  const jumpToSegment = (segmentIndex: number) => {
    if (!videoRef.current || !parsedManifest?.segments) return;
    
    let targetTime = 0;
    for (let i = 0; i < segmentIndex; i++) {
      targetTime += parsedManifest.segments[i].duration;
    }
    
    videoRef.current.currentTime = targetTime;
    setSelectedSegment(parsedManifest.segments[segmentIndex]);
  };

  // Playback controls
  const togglePlayPause = () => {
    if (!videoRef.current) return;
    
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  const skipToNextSegment = () => {
    if (currentSegmentIndex !== null && parsedManifest?.segments) {
      const nextIndex = Math.min(currentSegmentIndex + 1, parsedManifest.segments.length - 1);
      jumpToSegment(nextIndex);
    }
  };

  const skipToPreviousSegment = () => {
    if (currentSegmentIndex !== null) {
      const prevIndex = Math.max(currentSegmentIndex - 1, 0);
      jumpToSegment(prevIndex);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-white">Loading video data...</div>
      </div>
    );
  }

  if (error || !videoData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <Card className="bg-red-500/20 border-red-500/30">
          <CardContent className="pt-6">
            <p className="text-red-300">{error || 'Video not found'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" className="text-white hover:bg-white/20">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <Zap className="h-8 w-8 text-yellow-400" />
                HLS Stream Analyzer
              </h1>
              <p className="text-gray-300">Video ID: {videoId}</p>
            </div>
          </div>
          <Link href={videoData.url || '#'} target="_blank">
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Play className="mr-2 h-4 w-4" />
              Play Stream
            </Button>
          </Link>
        </div>

        {/* Video Player */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Play className="h-5 w-5" />
              HLS Stream Player
            </CardTitle>
            <CardDescription className="text-gray-300">
              {selectedManifest ? `Playing: ${selectedManifest.split('/').pop()}` : 'Select a quality playlist to play'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Video Element */}
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  className="w-full h-full"
                  controls={false}
                />
                {currentSegmentIndex !== null && (
                  <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
                    Segment #{currentSegmentIndex}
                  </div>
                )}
              </div>

              {/* Custom Controls */}
              <div className="space-y-3">
                {/* Progress Bar */}
                <div className="bg-white/10 rounded-full h-2 relative cursor-pointer"
                     onClick={(e) => {
                       if (!videoRef.current) return;
                       const rect = e.currentTarget.getBoundingClientRect();
                       const x = e.clientX - rect.left;
                       const percentage = x / rect.width;
                       videoRef.current.currentTime = percentage * duration;
                     }}>
                  <div className="bg-purple-500 h-full rounded-full transition-all"
                       style={{ width: `${(currentTime / duration) * 100}%` }} />
                  {/* Segment markers */}
                  {parsedManifest?.segments.map((segment, idx) => {
                    const startPercent = (parsedManifest.segments
                      .slice(0, idx)
                      .reduce((acc, s) => acc + s.duration, 0) / parsedManifest.totalDuration) * 100;
                    
                    return (
                      <div
                        key={idx}
                        className="absolute top-0 bottom-0 border-l border-white/20"
                        style={{ left: `${startPercent}%` }}
                      />
                    );
                  })}
                </div>

                {/* Time Display */}
                <div className="flex justify-between text-sm text-gray-300">
                  <span>{formatDuration(currentTime)}</span>
                  <span>{formatDuration(duration)}</span>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={skipToPreviousSegment}
                    disabled={currentSegmentIndex === 0}
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="lg"
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={togglePlayPause}
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="h-6 w-6" />
                    )}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={skipToNextSegment}
                    disabled={currentSegmentIndex === (parsedManifest?.segments.length || 0) - 1}
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>

                {/* Current Segment Info */}
                {currentSegmentIndex !== null && parsedManifest?.segments[currentSegmentIndex] && (
                  <div className="bg-white/5 rounded-lg p-3 text-sm">
                    <p className="text-gray-400">Now Playing</p>
                    <p className="text-white font-mono">
                      Segment #{currentSegmentIndex} • {parsedManifest.segments[currentSegmentIndex].duration.toFixed(3)}s
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* File List */}
          <div className="lg:col-span-1">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <List className="h-5 w-5" />
                  Stream Files
                </CardTitle>
                <CardDescription className="text-gray-300">
                  {videoData.files?.length || (videoData.isOriginal ? 1 : 0)} files generated
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {videoData.files && videoData.files.length > 0 ? (
                  videoData.files.map((file) => (
                    <div
                      key={file.name}
                      className={`p-3 rounded-lg transition-colors ${
                        selectedManifest === file.url
                          ? 'bg-purple-600/30 border-purple-500'
                          : 'bg-white/5 hover:bg-white/10'
                      } border border-white/20`}
                    >
                      <div 
                        onClick={() => setSelectedManifest(file.url)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-purple-400" />
                          <span className="text-sm text-white font-mono">
                            {file.name.split('/').pop()}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {formatBytes(file.size)}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-purple-300 hover:text-purple-200 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadFile(file.url, file.name.split('/').pop() || 'file');
                          }}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                        <Link href={file.url} target="_blank" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-purple-300 hover:text-purple-200 text-xs"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Open
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : videoData.isOriginal && videoData.url ? (
                  // Show original video file
                  <div className="p-3 bg-white/5 rounded-lg border border-white/20">
                    <div className="flex items-center gap-2 mb-2">
                      <FileVideo className="h-4 w-4 text-purple-400" />
                      <span className="text-sm text-white">Original Video</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">
                      {videoData.error || 'Video served without transcoding'}
                    </p>
                    <div className="flex gap-2">
                      <Link href={videoData.url} target="_blank">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-purple-300 hover:text-purple-200 text-xs"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Open Video
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-400">
                    <p className="text-sm">No files available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Video Info */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 mt-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileVideo className="h-5 w-5" />
                  Stream Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Processed At</p>
                  <p className="text-white">
                    {videoData.processedAt ? new Date(videoData.processedAt).toLocaleString() : 'Not processed yet'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Quality Levels</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {videoData.qualities?.map((q) => (
                      <span
                        key={q.name}
                        className="px-2 py-1 bg-purple-600/30 text-purple-300 rounded text-xs"
                      >
                        {q.name}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Manifest Content */}
          <div className="lg:col-span-2">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Manifest Analysis
                </CardTitle>
                <CardDescription className="text-gray-300">
                  {selectedManifest ? selectedManifest.split('/').pop() : 'Select a manifest file'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedManifest && selectedManifest.endsWith('.m3u8') ? (
                  parsedManifest && (
                    <div className="space-y-6">
                      {/* Manifest Overview */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white/5 p-4 rounded-lg">
                          <p className="text-sm text-gray-400">Version</p>
                          <p className="text-xl font-mono text-white">
                            {parsedManifest.version}
                          </p>
                        </div>
                        {parsedManifest.targetDuration > 0 && (
                          <div className="bg-white/5 p-4 rounded-lg">
                            <p className="text-sm text-gray-400">Target Duration</p>
                            <p className="text-xl font-mono text-white">
                              {parsedManifest.targetDuration}s
                            </p>
                          </div>
                        )}
                        {parsedManifest.totalDuration > 0 && (
                          <div className="bg-white/5 p-4 rounded-lg">
                            <p className="text-sm text-gray-400">Total Duration</p>
                            <p className="text-xl font-mono text-white">
                              {formatDuration(parsedManifest.totalDuration)}
                            </p>
                          </div>
                        )}
                        {parsedManifest.segments.length > 0 && (
                          <div className="bg-white/5 p-4 rounded-lg">
                            <p className="text-sm text-gray-400">Segments</p>
                            <p className="text-xl font-mono text-white">
                              {parsedManifest.segments.length}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Quality Levels for Master Playlist */}
                      {parsedManifest.qualityLevels && (
                        <div>
                          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            Quality Levels
                          </h3>
                          <div className="space-y-2">
                            {parsedManifest.qualityLevels.map((level, idx) => (
                              <div
                                key={idx}
                                className="bg-white/5 p-3 rounded-lg flex items-center justify-between"
                              >
                                <div>
                                  <span className="text-white font-mono">
                                    {level.resolution}
                                  </span>
                                  <span className="text-gray-400 ml-3">
                                    {(level.bandwidth / 1000000).toFixed(2)} Mbps
                                  </span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-purple-300 hover:text-purple-200"
                                  onClick={() => {
                                    const fullUrl = new URL(level.uri, selectedManifest).href;
                                    setSelectedManifest(fullUrl);
                                  }}
                                >
                                  View Playlist
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Segments for Media Playlist */}
                      {parsedManifest.segments.length > 0 && (
                        <div>
                          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <HardDrive className="h-4 w-4" />
                            Segments Timeline
                          </h3>
                          
                          {/* Visual Timeline */}
                          <div className="bg-black/30 rounded-lg p-4 mb-4">
                            <div className="relative h-16 bg-white/5 rounded overflow-hidden">
                              {parsedManifest.segments.map((segment, idx) => {
                                const startPercent = (parsedManifest.segments
                                  .slice(0, idx)
                                  .reduce((acc, s) => acc + s.duration, 0) / parsedManifest.totalDuration) * 100;
                                const widthPercent = (segment.duration / parsedManifest.totalDuration) * 100;
                                
                                // Create color based on segment index for variety
                                const hue = (idx * 137.5) % 360; // Golden angle for good color distribution
                                const color = `hsl(${hue}, 70%, 50%)`;
                                
                                return (
                                  <div
                                    key={segment.index}
                                    className={`absolute h-full transition-all cursor-pointer group hover:z-10 ${
                                      currentSegmentIndex === idx ? 'ring-2 ring-white z-20' : ''
                                    }`}
                                    style={{
                                      left: `${startPercent}%`,
                                      width: `${widthPercent}%`,
                                      backgroundColor: color,
                                      borderRight: '1px solid rgba(0,0,0,0.3)',
                                      opacity: currentSegmentIndex === idx ? 1 : 0.8,
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                    onMouseLeave={(e) => e.currentTarget.style.opacity = currentSegmentIndex === idx ? '1' : '0.8'}
                                    onClick={() => {
                                      setSelectedSegment(segment);
                                      jumpToSegment(idx);
                                    }}
                                    title={`Segment #${segment.index}: ${segment.duration.toFixed(3)}s • Click to jump`}
                                  >
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                      <span className="text-xs text-white font-bold drop-shadow-lg">
                                        #{segment.index}
                                      </span>
                                    </div>
                                    {currentSegmentIndex === idx && (
                                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white text-black px-2 py-1 rounded text-xs font-bold">
                                        Playing
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex justify-between mt-2 text-xs text-gray-400">
                              <span>0:00</span>
                              <span>{formatDuration(parsedManifest.totalDuration)}</span>
                            </div>
                          </div>
                          
                          {/* Selected Segment Details */}
                          {selectedSegment && (
                            <div className="bg-white/5 rounded-lg p-4 mb-4 border border-purple-500/30">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="text-white font-semibold">Segment Details</h4>
                                <button
                                  onClick={() => setSelectedSegment(null)}
                                  className="text-gray-400 hover:text-white"
                                >
                                  <span className="text-sm">✕</span>
                                </button>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                <div>
                                  <p className="text-gray-400">Index</p>
                                  <p className="text-white font-mono">#{selectedSegment.index}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400">Duration</p>
                                  <p className="text-white font-mono">{selectedSegment.duration.toFixed(3)}s</p>
                                </div>
                                <div>
                                  <p className="text-gray-400">Start Time</p>
                                  <p className="text-white font-mono">
                                    {formatDuration(
                                      parsedManifest.segments
                                        .slice(0, selectedSegment.index)
                                        .reduce((acc, s) => acc + s.duration, 0)
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-400">End Time</p>
                                  <p className="text-white font-mono">
                                    {formatDuration(
                                      parsedManifest.segments
                                        .slice(0, selectedSegment.index + 1)
                                        .reduce((acc, s) => acc + s.duration, 0)
                                    )}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-3">
                                <p className="text-gray-400 text-sm mb-1">Filename</p>
                                <p className="text-white font-mono text-xs break-all bg-black/30 p-2 rounded">
                                  {selectedSegment.uri}
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {/* Segment List */}
                          <div className="bg-black/30 rounded-lg p-4 max-h-64 overflow-y-auto">
                            <div className="space-y-1">
                              {parsedManifest.segments.map((segment, idx) => (
                                <div
                                  key={segment.index}
                                  className={`flex items-center gap-3 text-sm hover:bg-white/5 p-2 rounded cursor-pointer transition-colors ${
                                    currentSegmentIndex === idx ? 'bg-purple-600/20 border-l-2 border-purple-500' : ''
                                  }`}
                                  onClick={() => {
                                    setSelectedSegment(segment);
                                    jumpToSegment(idx);
                                  }}
                                  title="Click to jump to this segment"
                                >
                                  <span className={`w-12 ${currentSegmentIndex === idx ? 'text-purple-300 font-bold' : 'text-gray-500'}`}>
                                    #{segment.index}
                                  </span>
                                  <Clock className="h-3 w-3 text-gray-400" />
                                  <span className="text-purple-300 font-mono">
                                    {segment.duration.toFixed(3)}s
                                  </span>
                                  <span className="text-gray-300 truncate flex-1">
                                    {segment.uri}
                                  </span>
                                  {currentSegmentIndex === idx && (
                                    <span className="text-xs bg-purple-600/30 text-purple-300 px-2 py-1 rounded">
                                      Playing
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Raw Manifest */}
                      <div>
                        <h3 className="text-white font-semibold mb-3">Raw Manifest</h3>
                        <pre className="bg-black/30 text-gray-300 p-4 rounded-lg overflow-x-auto text-xs font-mono">
                          {manifestContent}
                        </pre>
                      </div>
                    </div>
                  )
                ) : selectedManifest && !selectedManifest.endsWith('.m3u8') ? (
                  // Non-HLS video content
                  <div className="space-y-4">
                    <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                      <p className="text-yellow-300 text-sm">
                        This is a direct video file, not an HLS stream. No manifest analysis available.
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <h3 className="text-white font-semibold mb-2">Video Information</h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-400">Type:</span>
                          <span className="text-white ml-2">Original Video File</span>
                        </div>
                        <div>
                          <span className="text-gray-400">URL:</span>
                          <span className="text-white ml-2 font-mono text-xs break-all">{selectedManifest}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    <p>Select a file to analyze</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 