'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileVideo, List, Clock, HardDrive, Zap, FileText, Play, Download, ExternalLink, Loader2, Pause, SkipForward, SkipBack, Terminal, CheckCircle, XCircle, AlertCircle, Cpu, Film, Music, BarChart3, BookOpen, Info } from 'lucide-react';
import Link from 'next/link';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { FfprobeData, FfprobeFormat, FfprobeStream } from 'fluent-ffmpeg';
import Hls from 'hls.js';

// Info popover component
interface InfoPopoverProps {
  title: string;
  description: string;
  specLink?: string;
  specSection?: string;
}

const InfoPopover: React.FC<InfoPopoverProps> = ({
  title,
  description,
  specLink,
  specSection,
}) => (
  <Popover>
    <PopoverTrigger asChild>
      <button className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-600 hover:bg-gray-500 transition-colors">
        <Info className="h-2.5 w-2.5 text-gray-200" />
      </button>
    </PopoverTrigger>
    <PopoverContent className="w-80 bg-gray-800 border-gray-700">
      <div className="space-y-2">
        <h4 className="font-semibold text-white">{title}</h4>
        <p className="text-sm text-gray-300">{description}</p>
        {specLink && (
          <Link
            href={specLink}
            target="_blank"
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <span>HLS Spec {specSection && `§${specSection}`}</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        )}
      </div>
    </PopoverContent>
  </Popover>
);

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
  initSegment?: string; // URL of the initialization segment for fMP4
}

interface ProbeData {
  raw: FfprobeData;
  analysis: {
    format: FfprobeFormat & { isFmp4?: boolean };
    video: FfprobeStream;
    audio: FfprobeStream;
    packets: any;
    frames: any;
    hls: {
      compliant: boolean;
      issues: string[];
      recommendations: string[];
      specs: Array<{
        section: string;
        description: string;
        url: string;
      }>;
    };
  };
  segmentUrl: string;
}

interface BatchProbeData {
  results: Array<{
    url: string;
    success: boolean;
    error?: string;
    raw?: FfprobeData;
    analysis?: {
      format: FfprobeFormat;
      video: FfprobeStream;
      audio: FfprobeStream;
    };
  }>;
  aggregateAnalysis: {
    totalSegments: number;
    consistency: {
      duration: { min: number; max: number; avg: number; consistent: boolean };
      bitrate: { min: number; max: number; avg: number; consistent: boolean };
      resolution: string[];
      codecs: { video: string[]; audio: string[] };
    };
    averages: {
      duration: number;
      bitrate: number;
      keyframeInterval: number;
    };
    issues: {
      total: number;
      byType: Record<string, number>;
    };
    recommendations: string[];
  };
  batchMode: boolean;
}

// Import HLS.js dynamically to avoid SSR issues
let HlsClass: typeof Hls | null = null;
if (typeof window !== 'undefined') {
  void import('hls.js').then((module) => {
    HlsClass = module.default;
  });
}

export default function VideoAnalyzePage() {
  const params = useParams<{ id: string }>();
  const videoId = params.id;
  const [videoData, setVideoData] = useState<VideoMetadata | null>(null);
  const [selectedManifest, setSelectedManifest] = useState<string>('');
  const [manifestContent, setManifestContent] = useState<string>('');
  const [parsedManifest, setParsedManifest] = useState<ParsedManifest | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState<number | null>(
    null
  );
  const [probeData, setProbeData] = useState<ProbeData | null>(null);
  const [probingSegment, setProbingSegment] = useState(false);
  const [showProbeResults, setShowProbeResults] = useState(false);
  const [batchProbeData, setBatchProbeData] = useState<BatchProbeData | null>(
    null
  );
  const [probingBatch, setProbingBatch] = useState(false);
  const [showBatchResults, setShowBatchResults] = useState(false);
  const [detailedAnalysis, setDetailedAnalysis] = useState(false);
  const [probeCache, setProbeCache] = useState<Record<string, ProbeData>>({});
  const [autoplayEnabled, setAutoplayEnabled] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Helper function to resolve URLs when using the HLS proxy
  const resolveUrl = (relativeUrl: string, baseUrl: string): string => {
    // If the URL is already absolute, return it as-is
    if (
      relativeUrl.startsWith('http://') ??
      relativeUrl.startsWith('https://')
    ) {
      return relativeUrl;
    }

    // If the base URL is a proxy URL, extract the original URL and resolve against it
    if (baseUrl.startsWith('/api/hls-proxy')) {
      try {
        const params = new URLSearchParams(baseUrl.split('?')[1]);
        const originalUrl = params.get('url');

        if (originalUrl) {
          const baseUrlObj = new URL(originalUrl);
          const basePath = originalUrl.substring(
            0,
            originalUrl.lastIndexOf('/') + 1
          );

          let resolvedUrl: string;
          if (relativeUrl.startsWith('/')) {
            // Absolute path from root
            resolvedUrl = `${baseUrlObj.protocol}//${baseUrlObj.host}${relativeUrl}`;
          } else {
            // Relative path
            resolvedUrl = basePath + relativeUrl;
          }

          // Return the resolved URL through the proxy
          return `/api/hls-proxy?url=${encodeURIComponent(resolvedUrl)}`;
        }
      } catch (e) {
        console.error('Error extracting URL from proxy:', e);
      }
    }

    // For regular URLs, use the URL constructor
    try {
      return new URL(relativeUrl, baseUrl).href;
    } catch (e) {
      console.error('Error constructing URL:', e);
      return relativeUrl;
    }
  };

  // Fetch video metadata
  useEffect(() => {
    async function fetchVideoData() {
      try {
        const response = await fetch(`/api/video/${videoId}/status`);
        if (!response.ok) throw new Error('Failed to fetch video data');
        const data = await response.json();
        console.log('Video data:', data);

        // If we have a master.m3u8 URL but no files array, create a synthetic files array
        if (
          (!data.files || data.files.length === 0) &&
          data.url?.includes('master.m3u8')
        ) {
          console.log('Creating synthetic files array from master URL');
          const baseUrl = data.url.substring(0, data.url.lastIndexOf('/'));

          // Create synthetic file entries for Google Transcoder output
          data.files = [
            {
              name: `${videoId}/master.m3u8`,
              url: data.url,
              size: 1024, // Unknown size
            },
          ];

          // Add quality-specific playlists based on Google Transcoder naming
          const qualities = ['1080p', '720p', '480p', '360p'];
          qualities.forEach((quality) => {
            data.files.push({
              name: `${videoId}/hls-${quality}.m3u8`,
              url: `${baseUrl}/hls-${quality}.m3u8`,
              size: 1024, // Unknown size
            });
          });
        }

        setVideoData(data);

        // If we have files array, set master manifest as default
        if (data.files?.length > 0) {
          const masterFile = data.files.find(
            (f: { name: string; url: string; size: number }) =>
              f.name.includes('master.m3u8')
          );
          if (masterFile) {
            setSelectedManifest(masterFile.url);
          }
        } else if (data.url) {
          // If no files but we have a URL, use it directly
          setSelectedManifest(data.url);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load video data'
        );
      } finally {
        setLoading(false);
      }
    }

    void fetchVideoData();
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

    void fetchManifest();
  }, [selectedManifest]);

  // Parse HLS manifest
  function parseManifest(content: string, manifestUrl: string): ParsedManifest {
    const lines = content.split('\n').filter((line) => line.trim());
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
          const bandwidthMatch = /BANDWIDTH=(\d+)/.exec(lines[i]);
          const resolutionMatch = /RESOLUTION=([^,\s]+)/.exec(lines[i]);

          // For Google Transcoder output, extract quality from the URI
          if (i + 1 < lines.length && !lines[i + 1].startsWith('#')) {
            const uri = lines[i + 1];
            let resolution = resolutionMatch?.[1] ?? 'Unknown';
            let qualityName = 'Unknown';

            // Extract quality from Google Transcoder naming (hls-1080p.m3u8, etc.)
            const qualityMatch = /hls-(\d+p)\.m3u8/.exec(uri);
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
              bandwidth: parseInt(bandwidthMatch?.[1] ?? '0'),
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
      let initSegment: string | null = null;

      // Check for fMP4 initialization segment
      for (const line of lines) {
        if (line.startsWith('#EXT-X-MAP')) {
          const uriMatch = /URI="([^"]+)"/.exec(line);
          if (uriMatch) {
            initSegment = uriMatch[1];
          }
          break;
        }
      }

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

          if (
            i + 1 < lines.length &&
            lines[i + 1].startsWith('#EXT-X-BYTERANGE')
          ) {
            const rangeMatch = /#EXT-X-BYTERANGE:(\d+)(@(\d+))?/.exec(
              lines[i + 1]
            );
            if (rangeMatch) {
              const length = parseInt(rangeMatch[1]);
              const offset = rangeMatch[3]
                ? parseInt(rangeMatch[3])
                : byteRangeStart;
              byteRange = { length, offset };
              byteRangeStart = offset + length;
              uriLineOffset = 2; // URI is 2 lines after EXTINF
            }
          }

          // Get the URI (either 1 or 2 lines after EXTINF)
          if (
            i + uriLineOffset < lines.length &&
            !lines[i + uriLineOffset].startsWith('#')
          ) {
            const segment: Segment = {
              duration,
              uri: lines[i + uriLineOffset],
              index: segmentIndex++,
              ...(byteRange && { byteRange }),
            };

            parsed.segments.push(segment);
            parsed.totalDuration += duration;
          }
        } else if (lines[i].startsWith('#EXT-X-MEDIA')) {
          // Handle fMP4 media tags - these can contain segments in URI attributes
          const uriMatch = /URI="([^"]+)"/.exec(lines[i]);
          if (uriMatch && /\.(mp4|m4s)$/i.exec(uriMatch[1])) {
            // This is likely a segment, add it with a default duration
            const segment: Segment = {
              duration: parsed.targetDuration ?? 6, // Use target duration as estimate
              uri: uriMatch[1],
              index: segmentIndex++,
            };
            parsed.segments.push(segment);
            parsed.totalDuration += segment.duration;
          }
        } else if (
          !lines[i].startsWith('#') &&
          lines[i].trim() &&
          /\.(mp4|m4s)$/i.exec(lines[i])
        ) {
          // Handle standalone fMP4 segment files without EXTINF tags
          // This happens in some fMP4 playlists
          const segment: Segment = {
            duration: parsed.targetDuration ?? 6, // Use target duration as estimate
            uri: lines[i].trim(),
            index: segmentIndex++,
          };
          parsed.segments.push(segment);
          parsed.totalDuration += segment.duration;
        }
      }

      // If we found an init segment but no regular segments, it might be a different format
      if (initSegment && parsed.segments.length === 0) {
        console.log(
          'Found init segment but no media segments, checking for different format'
        );

        // Look for segment files without EXTINF tags (common in fMP4)
        for (const line of lines) {
          if (
            !line.startsWith('#') &&
            line.trim() &&
            (/\.(mp4|m4s)$/i.exec(line) || /fileSequence\d+/.exec(line))
          ) {
            const segment: Segment = {
              duration: parsed.targetDuration ?? 6,
              uri: line.trim(),
              index: segmentIndex++,
            };
            parsed.segments.push(segment);
            parsed.totalDuration += segment.duration;
          }
        }
      }

      // Store the initialization segment URL if found
      if (initSegment) {
        parsed.initSegment = initSegment;
      }
    }

    console.log('Parsed manifest:', parsed);
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
    if (
      !selectedManifest ||
      !videoRef.current ||
      !Hls ||
      !selectedManifest.endsWith('.m3u8')
    )
      return;

    const video = videoRef.current;

    // Only load quality-specific playlists, not the master
    const isQualityPlaylist =
      selectedManifest.includes('hls-') && !selectedManifest.includes('master');
    if (!isQualityPlaylist && videoData?.url) {
      // If master playlist is selected, try to auto-select first quality
      return;
    }

    if (HlsClass?.isSupported()) {
      // Destroy existing instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new HlsClass({
        debug: false,
        enableWorker: true,
        lowLatencyMode: false,
      });
      hlsRef.current = hls;

      hls.loadSource(selectedManifest);
      hls.attachMedia(video);

      hls.on(HlsClass.Events.MANIFEST_PARSED, () => {
        console.log('HLS manifest loaded for:', selectedManifest);
        video.play().catch((e) => console.log('Autoplay prevented:', e));
      });

      hls.on(HlsClass.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error('Fatal HLS error:', data);
          switch (data.type) {
            case HlsClass?.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case HlsClass?.ErrorTypes.MEDIA_ERROR:
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
  }, [selectedManifest, HlsClass, videoData?.url]);

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
          if (
            video.currentTime >= accumulatedTime &&
            video.currentTime <
              accumulatedTime + parsedManifest.segments[i].duration
          ) {
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

    // Only autoplay if enabled
    if (autoplayEnabled && videoRef.current.paused) {
      void videoRef.current.play();
    }
  };

  // Playback controls
  const togglePlayPause = () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      void videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  const skipToNextSegment = () => {
    if (currentSegmentIndex !== null && parsedManifest?.segments) {
      const nextIndex = Math.min(
        currentSegmentIndex + 1,
        parsedManifest.segments.length - 1
      );
      jumpToSegment(nextIndex);
    }
  };

  const skipToPreviousSegment = () => {
    if (currentSegmentIndex !== null) {
      const prevIndex = Math.max(currentSegmentIndex - 1, 0);
      jumpToSegment(prevIndex);
    }
  };

  // Probe segment with ffprobe
  const probeSegment = async (segment: Segment, forceRefresh = false) => {
    const cacheKey = `${segment.index}-${segment.uri}`;

    // Check cache first unless force refresh
    if (!forceRefresh && probeCache[cacheKey]) {
      console.log('Using cached probe data for segment', segment.index);
      setProbeData(probeCache[cacheKey]);
      setShowProbeResults(true);
      return;
    }

    setProbingSegment(true);
    setShowProbeResults(true);
    setProbeData(null);

    try {
      const segmentUrl = segment.uri.startsWith('http')
        ? segment.uri
        : resolveUrl(segment.uri, selectedManifest);

      // Resolve init segment URL if present
      let initSegmentUrl = undefined;
      if (parsedManifest?.initSegment) {
        initSegmentUrl = parsedManifest.initSegment.startsWith('http')
          ? parsedManifest.initSegment
          : resolveUrl(parsedManifest.initSegment, selectedManifest);
      }

      const response = await fetch(`/api/video/${videoId}/probe-segment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          segmentUrl,
          initSegmentUrl, // Pass init segment URL for fMP4
          detailed: detailedAnalysis,
          byteRange: segment.byteRange,
          segmentDuration: segment.duration,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to probe segment');
      }

      const data: ProbeData = await response.json();
      setProbeData(data);

      // Cache the result
      setProbeCache((prev) => ({
        ...prev,
        [cacheKey]: data,
      }));
    } catch (error) {
      console.error('Error probing segment:', error);
      setProbeData(null);
    } finally {
      setProbingSegment(false);
    }
  };

  // Probe all segments in batch
  const probeBatchSegments = async () => {
    if (!parsedManifest) return; // Add null check

    setProbingBatch(true);
    setBatchProbeData(null);

    try {
      // Resolve init segment URL if present
      let initSegmentUrl = undefined;
      if (parsedManifest.initSegment) {
        initSegmentUrl = parsedManifest.initSegment.startsWith('http')
          ? parsedManifest.initSegment
          : resolveUrl(parsedManifest.initSegment, selectedManifest);
      }

      // Prepare segment URLs with metadata
      const segmentUrls = parsedManifest.segments.map((segment) => {
        const url = segment.uri.startsWith('http')
          ? segment.uri
          : resolveUrl(segment.uri, selectedManifest);

        return {
          url,
          byteRange: segment.byteRange,
          duration: segment.duration,
        };
      });

      console.log('[Batch Probe] Analyzing', segmentUrls.length, 'segments');

      const response = await fetch(`/api/video/${videoId}/probe-segment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          segmentUrls,
          initSegmentUrl, // Pass init segment URL for fMP4
          batchMode: true,
          detailed: false, // Always use basic mode for batch to avoid timeouts
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to probe segments');
      }

      const data: BatchProbeData = await response.json();
      setBatchProbeData(data);

      // Cache individual results
      data.results.forEach((result, index) => {
        if (
          result.success &&
          result.raw &&
          result.analysis &&
          parsedManifest.segments[index]
        ) {
          const segment = parsedManifest.segments[index];
          const cacheKey = `${segment.index}-${segment.uri}`;
          const analysis = result.analysis;
          const probeData: ProbeData = {
            raw: result.raw,
            analysis: {
              format: analysis.format,
              video: analysis.video,
              audio: analysis.audio,
              packets: null,
              frames: null,
              hls: {
                compliant: true,
                issues: [],
                recommendations: [],
                specs: [],
              },
            },
            segmentUrl: result.url,
          };
          setProbeCache((prev) => ({
            ...prev,
            [cacheKey]: probeData,
          }));
        }
      });
    } catch (error) {
      console.error('Error probing batch segments:', error);
      setBatchProbeData(null);
    } finally {
      setProbingBatch(false);
    }
  };

  // Export analysis data
  const exportAnalysisData = () => {
    const data = {
      timestamp: new Date().toISOString(),
      videoId,
      manifest: selectedManifest,
      parsedManifest,
      probeData,
      batchProbeData,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hls-analysis-${videoId}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Update useEffect to check cache when selecting a segment
  useEffect(() => {
    if (selectedSegment) {
      const cacheKey = `${selectedSegment.index}-${selectedSegment.uri}`;
      if (probeCache[cacheKey]) {
        setProbeData(probeCache[cacheKey]);
        setShowProbeResults(true);
      } else {
        // Clear previous probe data if no cache exists for this segment
        setProbeData(null);
        setShowProbeResults(false);
      }
    } else {
      // Clear probe data when no segment is selected
      setProbeData(null);
      setShowProbeResults(false);
    }
  }, [selectedSegment, probeCache]);

  // Clear cache when changing manifests
  useEffect(() => {
    setProbeCache({});
    setProbeData(null);
    setBatchProbeData(null);
    setShowProbeResults(false);
    setShowBatchResults(false);
  }, [selectedManifest]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading video data...</div>
      </div>
    );
  }

  if (error || !videoData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="bg-red-500/20 border-red-500/30">
          <CardContent className="pt-6">
            <p className="text-red-300">{error ?? 'Video not found'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
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
                HLS Playlist Analyzer
              </h1>
              <p className="text-gray-300">Video ID: {videoId}</p>
            </div>
          </div>
          <Link href={videoData.url ?? '#'} target="_blank">
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Play className="mr-2 h-4 w-4" />
              Play Video
            </Button>
          </Link>
        </div>

        {/* Video Player */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Play className="h-5 w-5" />
              HLS Playlist Player
            </CardTitle>
            <CardDescription className="text-gray-300">
              {selectedManifest
                ? `Playing: ${selectedManifest.split('/').pop()}`
                : 'Select a quality playlist to play'}
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
                <div
                  className="bg-white/10 rounded-full h-2 relative cursor-pointer"
                  onClick={(e) => {
                    if (!videoRef.current) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const percentage = x / rect.width;
                    videoRef.current.currentTime = percentage * duration;
                  }}
                >
                  <div
                    className="bg-purple-500 h-full rounded-full transition-all"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                  {/* Segment markers */}
                  {parsedManifest?.segments.map((segment, idx) => {
                    const startPercent =
                      (parsedManifest.segments
                        .slice(0, idx)
                        .reduce((acc, s) => acc + s.duration, 0) /
                        parsedManifest.totalDuration) *
                      100;

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
                    disabled={
                      currentSegmentIndex ===
                      (parsedManifest?.segments.length ?? 0) - 1
                    }
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>

                {/* Current Segment Info */}
                {currentSegmentIndex !== null &&
                  parsedManifest?.segments[currentSegmentIndex] && (
                    <div className="bg-white/5 rounded-lg p-3 text-sm">
                      <p className="text-gray-400">Now Playing</p>
                      <p className="text-white font-mono">
                        Segment #{currentSegmentIndex} •{' '}
                        {parsedManifest.segments[
                          currentSegmentIndex
                        ].duration.toFixed(3)}
                        s
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
                  HLS Files
                </CardTitle>
                <CardDescription className="text-gray-300">
                  {videoData.files?.length ?? (videoData.isOriginal ? 1 : 0)}{' '}
                  files generated
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {videoData.files && videoData.files.length > 0 ? (
                  videoData.files.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
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
                            void downloadFile(
                              file.url,
                              file.name.split('/').pop() ?? 'file'
                            );
                          }}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                        <Link
                          href={file.url}
                          target="_blank"
                          onClick={(e) => e.stopPropagation()}
                        >
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
                      {videoData.error ?? 'Video served without transcoding'}
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
                  Video Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Processed At</p>
                  <p className="text-white">
                    {videoData.processedAt
                      ? new Date(videoData.processedAt).toLocaleString()
                      : 'Not processed yet'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Quality Levels</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {videoData.qualities?.map((q, index) => (
                      <span
                        key={`${q.name}-${q.bandwidth ?? index}`}
                        className="px-2 py-1 bg-purple-600/30 text-purple-300 rounded text-xs"
                      >
                        {q.name}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Raw Manifest */}
            {manifestContent && selectedManifest?.endsWith('.m3u8') && (
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 mt-6">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Raw Manifest
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-black/30 text-gray-300 p-4 rounded-lg overflow-x-auto text-xs font-mono max-h-96">
                    {manifestContent}
                  </pre>
                </CardContent>
              </Card>
            )}
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
                  {selectedManifest
                    ? selectedManifest.split('/').pop()
                    : 'Select a manifest file'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedManifest?.endsWith('.m3u8') ? (
                  parsedManifest && (
                    <div className="space-y-6">
                      {/* Manifest Overview */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white/5 p-4 rounded-lg">
                          <p className="text-sm text-gray-400 flex items-center gap-1">
                            Version
                            <InfoPopover
                              title="HLS Version"
                              description="The version of the HLS protocol used in this playlist. Higher versions support more features but may have less device compatibility."
                              specLink="https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.1.2"
                              specSection="4.3.1.2"
                            />
                          </p>
                          <p className="text-xl font-mono text-white">
                            {parsedManifest.version}
                          </p>
                        </div>
                        {parsedManifest.targetDuration > 0 && (
                          <div className="bg-white/5 p-4 rounded-lg">
                            <p className="text-sm text-gray-400 flex items-center gap-1">
                              Target Duration
                              <InfoPopover
                                title="Target Duration"
                                description="The maximum duration in seconds of any media segment. This value helps players buffer appropriately and must be at least as large as the longest segment."
                                specLink="https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.3.1"
                                specSection="4.3.3.1"
                              />
                            </p>
                            <p className="text-xl font-mono text-white">
                              {parsedManifest.targetDuration}s
                            </p>
                          </div>
                        )}
                        {parsedManifest.totalDuration > 0 && (
                          <div className="bg-white/5 p-4 rounded-lg">
                            <p className="text-sm text-gray-400 flex items-center gap-1">
                              Total Duration
                              <InfoPopover
                                title="Total Duration"
                                description="The sum of all segment durations. This represents the complete length of the media stream."
                                specLink="https://datatracker.ietf.org/doc/html/rfc8216#section-3"
                                specSection="3"
                              />
                            </p>
                            <p className="text-xl font-mono text-white">
                              {formatDuration(parsedManifest.totalDuration)}
                            </p>
                          </div>
                        )}
                        {parsedManifest.segments.length > 0 && (
                          <div className="bg-white/5 p-4 rounded-lg">
                            <p className="text-sm text-gray-400 flex items-center gap-1">
                              Segments
                              <InfoPopover
                                title="Media Segments"
                                description="The number of media segments in this playlist. Each segment contains a portion of the media stream that can be independently downloaded and played."
                                specLink="https://datatracker.ietf.org/doc/html/rfc8216#section-3"
                                specSection="3"
                              />
                            </p>
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
                                    {(level.bandwidth / 1000000).toFixed(2)}{' '}
                                    Mbps
                                  </span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-purple-300 hover:text-purple-200"
                                  onClick={() => {
                                    const fullUrl = resolveUrl(
                                      level.uri,
                                      selectedManifest
                                    );
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
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-white font-semibold flex items-center gap-2">
                              <HardDrive className="h-4 w-4" />
                              Segments Timeline
                            </h3>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-purple-600 hover:bg-purple-700"
                                onClick={probeBatchSegments}
                                disabled={probingBatch}
                              >
                                {probingBatch ? (
                                  <>
                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                    Analyzing...
                                  </>
                                ) : (
                                  <>
                                    <BarChart3 className="h-3 w-3 mr-1" />
                                    Analyze All Segments
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-purple-300 hover:text-purple-200"
                                onClick={exportAnalysisData}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Export
                              </Button>
                            </div>
                          </div>

                          {/* Visual Timeline */}
                          <div className="bg-black/30 rounded-lg p-4 mb-4">
                            <div className="relative h-16 bg-white/5 rounded overflow-hidden">
                              {parsedManifest.segments.map((segment, idx) => {
                                const startPercent =
                                  (parsedManifest.segments
                                    .slice(0, idx)
                                    .reduce((acc, s) => acc + s.duration, 0) /
                                    parsedManifest.totalDuration) *
                                  100;
                                const widthPercent =
                                  (segment.duration /
                                    parsedManifest.totalDuration) *
                                  100;

                                // Create color based on segment index for variety
                                const hue = (idx * 137.5) % 360; // Golden angle for good color distribution
                                const color = `hsl(${hue}, 70%, 50%)`;

                                return (
                                  <div
                                    key={segment.index}
                                    className={`absolute h-full transition-all cursor-pointer group hover:z-10 ${
                                      currentSegmentIndex === idx
                                        ? 'ring-2 ring-white z-20'
                                        : ''
                                    }`}
                                    style={{
                                      left: `${startPercent}%`,
                                      width: `${widthPercent}%`,
                                      backgroundColor: color,
                                      borderRight: '1px solid rgba(0,0,0,0.3)',
                                      opacity:
                                        currentSegmentIndex === idx ? 1 : 0.8,
                                    }}
                                    onMouseEnter={(e) =>
                                      (e.currentTarget.style.opacity = '1')
                                    }
                                    onMouseLeave={(e) =>
                                      (e.currentTarget.style.opacity =
                                        currentSegmentIndex === idx
                                          ? '1'
                                          : '0.8')
                                    }
                                    onClick={() => {
                                      setSelectedSegment(segment);
                                      jumpToSegment(idx);
                                    }}
                                    title={`Segment #${segment.index}: ${segment.duration.toFixed(3)}s • Click to jump`}
                                  >
                                    {/* Analyzed indicator */}
                                    {probeCache[
                                      `${segment.index}-${segment.uri}`
                                    ] && (
                                      <div className="absolute top-0 right-0 w-2 h-2 bg-green-400 rounded-full m-1" />
                                    )}
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
                              <span>
                                {formatDuration(parsedManifest.totalDuration)}
                              </span>
                            </div>
                          </div>

                          {/* Selected Segment Details */}
                          {selectedSegment && (
                            <div className="bg-white/5 rounded-lg p-4 mb-4 border border-purple-500/30">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="text-white font-semibold">
                                  Segment Details
                                </h4>
                                <button
                                  onClick={() => {
                                    setSelectedSegment(null);
                                    setShowProbeResults(false);
                                    setProbeData(null);
                                  }}
                                  className="text-gray-400 hover:text-white"
                                >
                                  <span className="text-sm">✕</span>
                                </button>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                <div>
                                  <p className="text-gray-400">Index</p>
                                  <p className="text-white font-mono">
                                    #{selectedSegment.index}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-400">Duration</p>
                                  <p className="text-white font-mono">
                                    {selectedSegment.duration.toFixed(3)}s
                                  </p>
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
                                <p className="text-gray-400 text-sm mb-1">
                                  Filename
                                </p>
                                <p className="text-white font-mono text-xs break-all bg-black/30 p-2 rounded">
                                  {selectedSegment.uri}
                                </p>
                              </div>
                              {selectedSegment.byteRange && (
                                <div className="mt-3">
                                  <p className="text-gray-400 text-sm mb-1">
                                    Byte Range
                                  </p>
                                  <p className="text-white font-mono text-xs bg-black/30 p-2 rounded">
                                    {selectedSegment.byteRange.length} bytes @
                                    offset {selectedSegment.byteRange.offset}
                                  </p>
                                </div>
                              )}
                              <div className="mt-3 flex gap-2">
                                <Button
                                  size="sm"
                                  className="bg-purple-600 hover:bg-purple-700"
                                  onClick={() =>
                                    probeSegment(selectedSegment, true)
                                  }
                                  disabled={probingSegment}
                                >
                                  {probingSegment ? (
                                    <>
                                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                      Probing...
                                    </>
                                  ) : (
                                    <>
                                      <Terminal className="h-3 w-3 mr-1" />
                                      {probeCache[
                                        `${selectedSegment.index}-${selectedSegment.uri}`
                                      ]
                                        ? 'Re-analyze with FFprobe'
                                        : 'Probe with FFprobe'}
                                    </>
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-purple-300 hover:text-purple-200"
                                  onClick={() => {
                                    // Jump to segment if not already there
                                    if (
                                      currentSegmentIndex !==
                                      selectedSegment.index
                                    ) {
                                      jumpToSegment(selectedSegment.index);
                                    }
                                    // Toggle play/pause
                                    togglePlayPause();
                                  }}
                                >
                                  {isPlaying &&
                                  currentSegmentIndex ===
                                    selectedSegment.index ? (
                                    <>
                                      <Pause className="h-3 w-3 mr-1" />
                                      Pause
                                    </>
                                  ) : (
                                    <>
                                      <Play className="h-3 w-3 mr-1" />
                                      Play
                                    </>
                                  )}
                                </Button>
                              </div>

                              {/* Analysis Options */}
                              <div className="mt-3 flex items-center gap-4">
                                <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={detailedAnalysis}
                                    onChange={(e) =>
                                      setDetailedAnalysis(e.target.checked)
                                    }
                                    className="w-3 h-3 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                                  />
                                  <span>Detailed frame analysis (slower)</span>
                                </label>
                                <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={autoplayEnabled}
                                    onChange={(e) =>
                                      setAutoplayEnabled(e.target.checked)
                                    }
                                    className="w-3 h-3 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                                  />
                                  <span>Autoplay on segment select</span>
                                </label>
                              </div>
                            </div>
                          )}

                          {/* FFprobe Results */}
                          {showProbeResults && (
                            <div className="bg-white/5 rounded-lg p-4 mb-4 border border-purple-500/30">
                              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                                <Terminal className="h-4 w-4" />
                                FFprobe Analysis
                                {!detailedAnalysis && (
                                  <span className="text-xs text-gray-400 ml-2">
                                    (Basic Mode)
                                  </span>
                                )}
                              </h4>

                              {probingSegment ? (
                                <div className="flex items-center justify-center py-8">
                                  <Loader2 className="h-6 w-6 text-purple-400 animate-spin" />
                                  <span className="ml-2 text-gray-300">
                                    Analyzing segment...
                                  </span>
                                </div>
                              ) : probeData ? (
                                <div className="space-y-4">
                                  {/* HLS Compliance Status */}
                                  <div className="bg-black/30 rounded-lg p-3">
                                    <h5 className="text-sm font-semibold text-gray-300 mb-2">
                                      HLS Compliance
                                    </h5>
                                    <div className="flex items-center gap-2 mb-2">
                                      {probeData.analysis.hls.compliant ? (
                                        <CheckCircle className="h-4 w-4 text-green-400" />
                                      ) : (
                                        <XCircle className="h-4 w-4 text-red-400" />
                                      )}
                                      <span
                                        className={`text-sm ${probeData.analysis.hls.compliant ? 'text-green-400' : 'text-red-400'}`}
                                      >
                                        {probeData.analysis.hls.compliant
                                          ? 'HLS Compliant'
                                          : 'HLS Compliance Issues Found'}
                                      </span>
                                    </div>
                                    {probeData.analysis.hls.issues &&
                                      probeData.analysis.hls.issues.length >
                                        0 && (
                                        <div className="mt-2">
                                          {probeData.analysis.hls.issues.map(
                                            (issue: string, idx: number) => (
                                              <div
                                                key={idx}
                                                className="flex items-start gap-1 text-xs text-red-400 mt-1"
                                              >
                                                <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                                <span>{issue}</span>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      )}
                                  </div>

                                  {/* Format Information */}
                                  <div className="bg-black/30 rounded-lg p-3">
                                    <h5 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-1">
                                      <HardDrive className="h-3 w-3" />
                                      Format Information
                                    </h5>
                                    {probeData.analysis.format.isFmp4 && (
                                      <div className="bg-blue-500/20 border border-blue-500/30 rounded p-2 mb-2">
                                        <p className="text-xs text-blue-300 flex items-center gap-1">
                                          <AlertCircle className="h-3 w-3" />
                                          fMP4 Segment (Fragmented MP4)
                                        </p>
                                      </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      <div>
                                        <span className="text-gray-400 flex items-center gap-1">
                                          Duration:
                                          <InfoPopover
                                            title="Segment Duration"
                                            description="The exact duration of this segment. Should be close to the target duration specified in the playlist."
                                            specLink="https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.3.1"
                                            specSection="4.3.3.1"
                                          />
                                        </span>
                                        <span className="text-white ml-1 font-mono">
                                          {(
                                            probeData.analysis.format
                                              .duration ?? 0
                                          ).toFixed(3)}
                                          s
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-gray-400 flex items-center gap-1">
                                          Size:
                                          <InfoPopover
                                            title="Segment Size"
                                            description="The file size of this segment. Affects bandwidth requirements and download time."
                                          />
                                        </span>
                                        <span className="text-white ml-1 font-mono">
                                          {formatBytes(
                                            probeData.analysis.format.size ?? 0
                                          )}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-gray-400 flex items-center gap-1">
                                          Bitrate:
                                          <InfoPopover
                                            title="Average Bitrate"
                                            description="The average bitrate of this segment. Should match the declared bandwidth in the master playlist."
                                            specLink="https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.4.2"
                                            specSection="4.3.4.2"
                                          />
                                        </span>
                                        <span className="text-white ml-1 font-mono">
                                          {(probeData.analysis.format
                                            .bit_rate ?? 0) > 0
                                            ? (
                                                (probeData.analysis.format
                                                  .bit_rate ?? 0) / 1000
                                              ).toFixed(0) + ' kbps'
                                            : 'N/A'}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-gray-400">
                                          Format:
                                        </span>
                                        <span className="text-white ml-1 font-mono">
                                          {probeData.analysis.format
                                            .format_name ?? 'Unknown'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Video Stream Information */}
                                  {probeData.analysis.video &&
                                    Object.keys(probeData.analysis.video)
                                      .length > 0 && (
                                      <div className="bg-black/30 rounded-lg p-3">
                                        <h5 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-1">
                                          <Film className="h-3 w-3" />
                                          Video Stream
                                        </h5>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                          <div>
                                            <span className="text-gray-400 flex items-center gap-1">
                                              Codec:
                                              <InfoPopover
                                                title="Video Codec"
                                                description="The video compression format. HLS supports H.264 (AVC) for broad compatibility and H.265 (HEVC) for better efficiency."
                                                specLink="https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.4.2"
                                                specSection="4.3.4.2"
                                              />
                                            </span>
                                            <span className="text-white ml-1 font-mono">
                                              {
                                                probeData.analysis.video
                                                  .codec_name
                                              }{' '}
                                              (
                                              {probeData.analysis.video.profile}
                                              )
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-gray-400 flex items-center gap-1">
                                              Resolution:
                                              <InfoPopover
                                                title="Video Resolution"
                                                description="The video dimensions in pixels (width × height). Higher resolutions provide better quality but require more bandwidth."
                                              />
                                            </span>
                                            <span className="text-white ml-1 font-mono">
                                              {probeData.analysis.video.width}x
                                              {probeData.analysis.video.height}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-gray-400 flex items-center gap-1">
                                              Frame Rate:
                                              <InfoPopover
                                                title="Frame Rate"
                                                description="Frames per second. Common values are 24, 25, 30, or 60 fps. Higher rates provide smoother motion."
                                              />
                                            </span>
                                            <span className="text-white ml-1 font-mono">
                                              {
                                                probeData.analysis.video
                                                  .avg_frame_rate
                                              }
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-gray-400 flex items-center gap-1">
                                              Pixel Format:
                                              <InfoPopover
                                                title="Pixel Format"
                                                description="The color encoding format. YUV420P is standard for video compression, providing good quality with efficient storage."
                                              />
                                            </span>
                                            <span className="text-white ml-1 font-mono">
                                              {probeData.analysis.video.pix_fmt}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-gray-400 flex items-center gap-1">
                                              Level:
                                              <InfoPopover
                                                title="Codec Level"
                                                description="The H.264/H.265 level defines maximum bitrate and resolution. Higher levels support larger resolutions but may have compatibility issues."
                                                specLink="https://www.itu.int/rec/T-REC-H.264"
                                              />
                                            </span>
                                            <span className="text-white ml-1 font-mono">
                                              {probeData.analysis.video.level}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-gray-400 flex items-center gap-1">
                                              Ref Frames:
                                              <InfoPopover
                                                title="Reference Frames"
                                                description="Number of previous frames used for compression. More reference frames improve quality but increase decoder complexity."
                                              />
                                            </span>
                                            <span className="text-white ml-1 font-mono">
                                              {probeData.analysis.video.refs}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                  {/* Audio Stream Information */}
                                  {probeData.analysis.audio &&
                                    Object.keys(probeData.analysis.audio)
                                      .length > 0 && (
                                      <div className="bg-black/30 rounded-lg p-3">
                                        <h5 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-1">
                                          <Music className="h-3 w-3" />
                                          Audio Stream
                                        </h5>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                          <div>
                                            <span className="text-gray-400 flex items-center gap-1">
                                              Codec:
                                              <InfoPopover
                                                title="Audio Codec"
                                                description="The audio compression format. AAC is most common for HLS, with MP3, AC-3, and E-AC-3 also supported."
                                                specLink="https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.4.2"
                                                specSection="4.3.4.2"
                                              />
                                            </span>
                                            <span className="text-white ml-1 font-mono">
                                              {
                                                probeData.analysis.audio
                                                  .codec_name
                                              }
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-gray-400 flex items-center gap-1">
                                              Sample Rate:
                                              <InfoPopover
                                                title="Sample Rate"
                                                description="Audio samples per second. 48000 Hz is standard for video, 44100 Hz for music. Higher rates capture more audio detail."
                                              />
                                            </span>
                                            <span className="text-white ml-1 font-mono">
                                              {
                                                probeData.analysis.audio
                                                  .sample_rate
                                              }{' '}
                                              Hz
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-gray-400 flex items-center gap-1">
                                              Channels:
                                              <InfoPopover
                                                title="Audio Channels"
                                                description="Number and layout of audio channels. Stereo (2 channels) is most common, with 5.1 surround supported for premium content."
                                              />
                                            </span>
                                            <span className="text-white ml-1 font-mono">
                                              {
                                                probeData.analysis.audio
                                                  .channels
                                              }{' '}
                                              (
                                              {
                                                probeData.analysis.audio
                                                  .channel_layout
                                              }
                                              )
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-gray-400 flex items-center gap-1">
                                              Bitrate:
                                              <InfoPopover
                                                title="Audio Bitrate"
                                                description="The amount of data used per second for audio. Higher bitrates provide better quality. 128-192 kbps is typical for stereo AAC."
                                              />
                                            </span>
                                            <span className="text-white ml-1 font-mono">
                                              {probeData.analysis.audio.bit_rate
                                                ? (
                                                    Number(
                                                      probeData.analysis.audio
                                                        .bit_rate
                                                    ) / 1000
                                                  ).toFixed(0) + ' kbps'
                                                : 'N/A'}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                  {/* Packet/Frame Analysis */}
                                  <div className="bg-black/30 rounded-lg p-3">
                                    <h5 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-1">
                                      <Cpu className="h-3 w-3" />
                                      Packet/Frame Analysis
                                    </h5>
                                    {probeData.analysis.frames?.estimated ? (
                                      <div className="text-xs space-y-1">
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">
                                            Video Frames:
                                          </span>
                                          <span className="text-white font-mono">
                                            {probeData.analysis.frames.video}
                                          </span>
                                        </div>
                                        <p className="text-yellow-300 text-xs italic mt-2">
                                          {probeData.analysis.frames.note}
                                        </p>
                                        <p className="text-gray-500 text-xs">
                                          Enable &quot;Detailed frame
                                          analysis&quot; for complete
                                          frame/packet information
                                        </p>
                                      </div>
                                    ) : (
                                      <div className="space-y-2">
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                          <div>
                                            <span className="text-gray-400">
                                              Total Frames:
                                            </span>
                                            <span className="text-white ml-1 font-mono">
                                              {probeData.analysis.frames
                                                ?.total ?? 'N/A'}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-gray-400">
                                              Video Frames:
                                            </span>
                                            <span className="text-white ml-1 font-mono">
                                              {probeData.analysis.frames
                                                ?.video ?? 'N/A'}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-gray-400">
                                              Keyframes:
                                            </span>
                                            <span className="text-white ml-1 font-mono">
                                              {probeData.analysis.frames
                                                ?.keyFrames ?? 'N/A'}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-gray-400">
                                              Avg Keyframe Interval:
                                            </span>
                                            <span className="text-white ml-1 font-mono">
                                              {probeData.analysis.frames
                                                ?.avgKeyFrameInterval
                                                ? (
                                                    probeData.analysis.frames
                                                      .avgKeyFrameInterval /
                                                    1000000
                                                  ).toFixed(2) + 's'
                                                : 'N/A'}
                                            </span>
                                          </div>
                                        </div>
                                        {probeData.analysis.frames
                                          ?.keyFramePositions && (
                                          <div className="mt-2">
                                            <span className="text-gray-400 text-xs">
                                              Keyframe Positions:
                                            </span>
                                            <div className="text-white font-mono text-xs mt-1 grid grid-cols-3 gap-1">
                                              {probeData.analysis.frames.keyFramePositions
                                                .slice(0, 6)
                                                .map((kf: any, idx: number) => (
                                                  <span
                                                    key={idx}
                                                    className="bg-black/50 px-1 py-0.5 rounded"
                                                  >
                                                    {kf.pts_time}s
                                                  </span>
                                                ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  {/* Recommendations */}
                                  {probeData.analysis.hls.recommendations
                                    .length > 0 && (
                                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                                      <h5 className="text-sm font-semibold text-yellow-300 mb-2 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        Recommendations
                                      </h5>
                                      <ul className="space-y-1">
                                        {probeData.analysis.hls.recommendations.map(
                                          (rec, idx) => (
                                            <li
                                              key={idx}
                                              className="text-xs text-yellow-200 flex items-start gap-1"
                                            >
                                              <span className="text-yellow-400">
                                                •
                                              </span>
                                              <span>{rec}</span>
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    </div>
                                  )}

                                  {/* HLS Spec References */}
                                  {probeData.analysis.hls.specs &&
                                    probeData.analysis.hls.specs.length > 0 && (
                                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                                        <h5 className="text-sm font-semibold text-blue-300 mb-2 flex items-center gap-1">
                                          <BookOpen className="h-3 w-3" />
                                          HLS Specification References
                                        </h5>
                                        <div className="space-y-1">
                                          {probeData.analysis.hls.specs.map(
                                            (
                                              ref: {
                                                section: string;
                                                description: string;
                                                url: string;
                                              },
                                              idx: number
                                            ) => (
                                              <div
                                                key={idx}
                                                className="text-xs"
                                              >
                                                <Link
                                                  href={ref.url}
                                                  target="_blank"
                                                  className="text-blue-300 hover:text-blue-200 flex items-start gap-1"
                                                >
                                                  <span className="text-blue-400">
                                                    §{ref.section}
                                                  </span>
                                                  <span>{ref.description}</span>
                                                  <ExternalLink className="h-2 w-2 flex-shrink-0 mt-0.5" />
                                                </Link>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}

                                  {/* Raw Data Toggle */}
                                  <details className="bg-black/30 rounded-lg p-3">
                                    <summary className="text-sm font-semibold text-gray-300 cursor-pointer hover:text-white">
                                      View Raw FFprobe Output
                                    </summary>
                                    <pre className="mt-2 text-xs text-gray-400 overflow-x-auto">
                                      {JSON.stringify(probeData.raw, null, 2)}
                                    </pre>
                                  </details>
                                </div>
                              ) : (
                                <div className="text-center text-gray-400 py-4">
                                  <p className="text-sm">
                                    Select a segment and click &quot;Probe with
                                    FFprobe&quot; to analyze
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Batch Analysis Results */}
                          {showBatchResults && batchProbeData && (
                            <div className="bg-white/5 rounded-lg p-4 mb-4 border border-purple-500/30 mt-4">
                              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                                <BarChart3 className="h-4 w-4" />
                                Stream Analysis Report
                              </h4>

                              {probingBatch ? (
                                <div className="flex items-center justify-center py-8">
                                  <Loader2 className="h-6 w-6 text-purple-400 animate-spin" />
                                  <span className="ml-2 text-gray-300">
                                    Analyzing {parsedManifest.segments.length}{' '}
                                    segments...
                                  </span>
                                </div>
                              ) : batchProbeData.aggregateAnalysis ? (
                                <div className="space-y-4">
                                  {/* Overview Stats */}
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="bg-black/30 rounded-lg p-3">
                                      <p className="text-xs text-gray-400">
                                        Total Segments
                                      </p>
                                      <p className="text-lg font-mono text-white">
                                        {
                                          batchProbeData.aggregateAnalysis
                                            .totalSegments
                                        }
                                      </p>
                                    </div>
                                    <div className="bg-black/30 rounded-lg p-3">
                                      <p className="text-xs text-gray-400">
                                        Avg Duration
                                      </p>
                                      <p className="text-lg font-mono text-white">
                                        {batchProbeData.aggregateAnalysis.averages.duration.toFixed(
                                          2
                                        )}
                                        s
                                      </p>
                                    </div>
                                    <div className="bg-black/30 rounded-lg p-3">
                                      <p className="text-xs text-gray-400">
                                        Avg Bitrate
                                      </p>
                                      <p className="text-lg font-mono text-white">
                                        {(
                                          batchProbeData.aggregateAnalysis
                                            .averages.bitrate / 1000000
                                        ).toFixed(2)}{' '}
                                        Mbps
                                      </p>
                                    </div>
                                    <div className="bg-black/30 rounded-lg p-3">
                                      <p className="text-xs text-gray-400">
                                        Total Issues
                                      </p>
                                      <p className="text-lg font-mono text-white">
                                        {
                                          batchProbeData.aggregateAnalysis
                                            .issues.total
                                        }
                                      </p>
                                    </div>
                                  </div>

                                  {/* Consistency Analysis */}
                                  <div className="bg-black/30 rounded-lg p-3">
                                    <h5 className="text-sm font-semibold text-gray-300 mb-2">
                                      Consistency Analysis
                                    </h5>
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-400">
                                          Duration Consistency
                                        </span>
                                        <div className="flex items-center gap-2">
                                          {batchProbeData.aggregateAnalysis
                                            .consistency.duration.consistent ? (
                                            <CheckCircle className="h-3 w-3 text-green-400" />
                                          ) : (
                                            <XCircle className="h-3 w-3 text-red-400" />
                                          )}
                                          <span className="text-white font-mono">
                                            {batchProbeData.aggregateAnalysis.consistency.duration.min.toFixed(
                                              2
                                            )}
                                            s -{' '}
                                            {batchProbeData.aggregateAnalysis.consistency.duration.max.toFixed(
                                              2
                                            )}
                                            s
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-400">
                                          Bitrate Consistency
                                        </span>
                                        <div className="flex items-center gap-2">
                                          {batchProbeData.aggregateAnalysis
                                            .consistency.bitrate.consistent ? (
                                            <CheckCircle className="h-3 w-3 text-green-400" />
                                          ) : (
                                            <XCircle className="h-3 w-3 text-red-400" />
                                          )}
                                          <span className="text-white font-mono">
                                            {(
                                              batchProbeData.aggregateAnalysis
                                                .consistency.bitrate.min /
                                              1000000
                                            ).toFixed(1)}{' '}
                                            -{' '}
                                            {(
                                              batchProbeData.aggregateAnalysis
                                                .consistency.bitrate.max /
                                              1000000
                                            ).toFixed(1)}{' '}
                                            Mbps
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-400">
                                          Resolutions
                                        </span>
                                        <span className="text-white font-mono">
                                          {batchProbeData.aggregateAnalysis.consistency.resolution.join(
                                            ', '
                                          ) || 'N/A'}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-400">
                                          Video Codecs
                                        </span>
                                        <span className="text-white font-mono">
                                          {batchProbeData.aggregateAnalysis.consistency.codecs.video.join(
                                            ', '
                                          ) || 'N/A'}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-400">
                                          Audio Codecs
                                        </span>
                                        <span className="text-white font-mono">
                                          {batchProbeData.aggregateAnalysis.consistency.codecs.audio.join(
                                            ', '
                                          ) || 'N/A'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Issues Breakdown */}
                                  {batchProbeData.aggregateAnalysis.issues
                                    .total > 0 && (
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                                      <h5 className="text-sm font-semibold text-red-300 mb-2">
                                        Issues Found
                                      </h5>
                                      <div className="space-y-1">
                                        {Object.entries(
                                          batchProbeData.aggregateAnalysis
                                            .issues.byType
                                        ).map(([type, count]) => (
                                          <div
                                            key={type}
                                            className="flex items-center justify-between text-xs"
                                          >
                                            <span className="text-red-200">
                                              {type}
                                            </span>
                                            <span className="text-red-300 font-mono">
                                              {count} segments
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Aggregate Recommendations */}
                                  {batchProbeData.aggregateAnalysis
                                    .recommendations.length > 0 && (
                                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                                      <h5 className="text-sm font-semibold text-yellow-300 mb-2">
                                        Stream-wide Recommendations
                                      </h5>
                                      <ul className="space-y-1">
                                        {batchProbeData.aggregateAnalysis.recommendations.map(
                                          (rec, idx) => (
                                            <li
                                              key={idx}
                                              className="text-xs text-yellow-200 flex items-start gap-1"
                                            >
                                              <span className="text-yellow-400">
                                                •
                                              </span>
                                              <span>{rec}</span>
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Failed Segments */}
                                  {batchProbeData.results.some(
                                    (r) => !r.success
                                  ) && (
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                                      <h5 className="text-sm font-semibold text-red-300 mb-2">
                                        Failed Segments
                                      </h5>
                                      <div className="space-y-1">
                                        {batchProbeData.results
                                          .filter((r) => !r.success)
                                          .map((result, idx) => (
                                            <div
                                              key={idx}
                                              className="text-xs text-red-200"
                                            >
                                              <span className="font-mono">
                                                {result.url.split('/').pop()}
                                              </span>
                                              : {result.error}
                                            </div>
                                          ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : null}
                            </div>
                          )}

                          {/* Segment List */}
                          <div className="bg-black/30 rounded-lg p-4 max-h-64 overflow-y-auto">
                            <div className="space-y-1">
                              {parsedManifest.segments.map((segment, idx) => {
                                const isAnalyzed =
                                  !!probeCache[
                                    `${segment.index}-${segment.uri}`
                                  ];
                                return (
                                  <div
                                    key={segment.index}
                                    className={`flex items-center gap-3 text-sm hover:bg-white/5 p-2 rounded cursor-pointer transition-colors ${
                                      currentSegmentIndex === idx
                                        ? 'bg-purple-600/20 border-l-2 border-purple-500'
                                        : ''
                                    }`}
                                    onClick={() => {
                                      setSelectedSegment(segment);
                                      jumpToSegment(idx);
                                    }}
                                    title="Click to jump to this segment"
                                  >
                                    <span
                                      className={`w-12 ${currentSegmentIndex === idx ? 'text-purple-300 font-bold' : 'text-gray-500'}`}
                                    >
                                      #{segment.index}
                                    </span>
                                    {isAnalyzed && (
                                      <CheckCircle className="h-3 w-3 text-green-400" />
                                    )}
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
                                );
                              })}
                            </div>
                          </div>

                          {/* Analysis Progress Indicator */}
                          {Object.keys(probeCache).length > 0 && (
                            <div className="mt-2 text-xs text-gray-400">
                              Analyzed {Object.keys(probeCache).length} of{' '}
                              {parsedManifest.segments.length} segments
                              {Object.keys(probeCache).length ===
                                parsedManifest.segments.length && (
                                <span className="text-green-400 ml-2">
                                  ✓ All segments analyzed
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                ) : selectedManifest && !selectedManifest.endsWith('.m3u8') ? (
                  // Non-HLS video content
                  <div className="space-y-4">
                    <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                      <p className="text-yellow-300 text-sm">
                        This is a direct video file, not an HLS stream. No
                        manifest analysis available.
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <h3 className="text-white font-semibold mb-2">
                        Video Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-400">Type:</span>
                          <span className="text-white ml-2">
                            Original Video File
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">URL:</span>
                          <span className="text-white ml-2 font-mono text-xs break-all">
                            {selectedManifest}
                          </span>
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