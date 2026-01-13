'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import type { FfprobeData, FfprobeStream } from 'fluent-ffmpeg';
import {
  Loader2,
  AlertCircle,
  FileVideo,
  FileAudio,
  Image as ImageIcon,
  BarChart3,
  Film,
  Package,
  Code,
  Settings,
  Clock,
  ArrowLeft,
  Music,
  Info,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  FileDown,
  FileCode,
  Binary,
  Network,
} from 'lucide-react';
import Link from 'next/link';
import { HexViewer } from '@/components/bitstream/hex-viewer';
import { BinaryVisualizer } from '@/components/bitstream/binary-visualizer';
import { StructureTree } from '@/components/bitstream/structure-tree';
import { ParameterSetViewer } from '@/components/bitstream/parameter-set-viewer';
import { NALTimeline } from '@/components/bitstream/nal-timeline';
import { ErrorBoundary } from '@/components/what-the-ffmpeg/error-boundary';
import { ErrorDisplay } from '@/components/what-the-ffmpeg/error-display';
import {
  HelpTooltip,
  HelpIcon,
  WTF_HELP,
} from '@/components/what-the-ffmpeg/help-tooltips';
import { retry } from '@/lib/utils/retry';
import {
  OverviewSkeleton,
  StreamsSkeleton,
  FramesSkeleton,
  PacketsSkeleton,
  TimelineSkeleton,
  BitstreamSkeleton,
  CodecSkeleton,
} from '@/components/what-the-ffmpeg/skeleton-loaders';

interface FileMetadata {
  fileId: string;
  videoId: string;
  filename: string;
  size: number;
  fileType?: string;
  type?: string;
  status: string;
  uploadedAt: string;
  analysisStatus: string;
}

// Using FfprobeData from fluent-ffmpeg types
type ProbeData = FfprobeData;

interface FrameData {
  media_type?: string;
  stream_index?: number;
  key_frame?: number;
  pkt_pts?: number;
  pkt_pts_time?: number;
  pkt_dts?: number;
  pkt_dts_time?: number;
  pkt_duration?: number;
  pkt_duration_time?: number;
  pkt_size?: number;
  pict_type?: string;
  coded_picture_number?: number;
  display_picture_number?: number;
  [key: string]: unknown; // Allow other FFProbe fields
}

interface PacketData {
  stream_index?: number;
  pts?: number;
  pts_time?: number;
  dts?: number;
  dts_time?: number;
  duration?: number;
  duration_time?: number;
  size?: string;
  flags?: string;
  codec_type?: string;
  [key: string]: unknown; // Allow other FFProbe fields
}

interface NALUnit {
  type: number;
  typeName: string;
  size: number;
  offset: number;
  data: string;
}

interface BitstreamData {
  success: boolean;
  bitstream?: string | null;
  format: string;
  codec?: string;
  nalUnits?: NALUnit[];
  parameterSets?: {
    sps?: NALUnit[];
    pps?: NALUnit[];
    vps?: NALUnit[];
  };
  statistics?: {
    totalSize: number;
    nalUnitCount: number;
  };
  message?: string;
  isChunked?: boolean;
  currentChunk?: {
    start: number;
    end: number;
  };
  totalSize?: number;
  suggestedChunkSize?: number;
}

function FileAnalysisPage() {
  const params = useParams();
  const fileId = params.fileId as string;
  const [activeTab, setActiveTab] = React.useState('overview');

  const [fileMetadata, setFileMetadata] = React.useState<FileMetadata | null>(
    null
  );
  const [probeData, setProbeData] = React.useState<ProbeData | null>(null);
  const [framesData, setFramesData] = React.useState<FrameData[]>([]);
  const [packetsData, setPacketsData] = React.useState<PacketData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [loadingFrames, setLoadingFrames] = React.useState(false);
  const [loadingPackets, setLoadingPackets] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Frame navigation state
  const [currentFrameIndex, setCurrentFrameIndex] = React.useState(0);
  const [frameJumpValue, setFrameJumpValue] = React.useState('');
  const [framePreviewUrl, setFramePreviewUrl] = React.useState<string | null>(
    null
  );
  const [loadingFramePreview, setLoadingFramePreview] = React.useState(false);
  const [framePreviewError, setFramePreviewError] = React.useState(false);

  // Packet filtering state
  const [packetFilterStream, setPacketFilterStream] =
    React.useState<string>('all');
  const [packetFilterMinSize, setPacketFilterMinSize] =
    React.useState<string>('');
  const [packetFilterMaxSize, setPacketFilterMaxSize] =
    React.useState<string>('');
  const [packetPage, setPacketPage] = React.useState(0);
  const packetsPerPage = 50;
  const timelineRef = React.useRef<HTMLDivElement>(null);

  // Bitstream state
  const [bitstreamData, setBitstreamData] =
    React.useState<BitstreamData | null>(null);
  const [loadingBitstream, setLoadingBitstream] = React.useState(false);
  const [bitstreamError, setBitstreamError] = React.useState<string | null>(
    null
  );
  const [bitstreamTab, setBitstreamTab] = React.useState('hex');
  const [selectedOffset, setSelectedOffset] = React.useState<number | null>(
    null
  );
  const [bitstreamAttempted, setBitstreamAttempted] = React.useState(false);

  // Helper to safely convert time values to numbers
  const toNumber = (value: unknown): number | undefined => {
    if (value === undefined || value === null) return undefined;
    const num = typeof value === 'string' ? parseFloat(value) : Number(value);
    return isNaN(num) ? undefined : num;
  };

  // Compute derived values
  const currentFrame = framesData[currentFrameIndex];
  const videoStream = probeData?.streams?.find(
    (s: FfprobeStream) => s.codec_type === 'video'
  );

  // Load bitstream data (with optional chunking for large files)
  const loadBitstream = React.useCallback(
    async (byteRange?: { start: number; end?: number }) => {
      if (!videoStream || loadingBitstream) return;

      const abortController = new AbortController();
      const timeoutId = setTimeout(() => {
        abortController.abort();
      }, 180000); // 3 minute timeout

      try {
        setLoadingBitstream(true);
        setBitstreamError(null);
        setBitstreamAttempted(true);

        console.log(
          '[Bitstream] Starting fetch...',
          byteRange
            ? `chunk ${byteRange.start}-${byteRange.end ?? 'end'}`
            : 'full'
        );
        const response = await fetch('/api/what-the-ffmpeg/bitstream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileId,
            streamIndex: 0,
            format: 'hex',
            codecSpecific: true,
            maxSize: 5 * 1024 * 1024, // 5MB limit
            byteRange, // Request specific chunk if provided
          }),
          signal: abortController.signal,
        });

        console.log('[Bitstream] Response received, status:', response.status);

        if (response.ok) {
          console.log('[Bitstream] Parsing JSON...');
          const text = await response.text();
          console.log('[Bitstream] Text received, length:', text.length);

          // Warn if response is very large
          if (text.length > 10000000) {
            // > 10MB
            console.warn(
              '[Bitstream] Very large response detected:',
              text.length,
              'bytes'
            );
          }

          // Parse JSON - this may take time for large files
          let result;
          try {
            // For very large JSON, parse in chunks if possible
            result = JSON.parse(text);
          } catch (parseErr) {
            console.error('[Bitstream] JSON parse error:', parseErr);
            throw new Error(
              `Failed to parse bitstream data: ${parseErr instanceof Error ? parseErr.message : 'Unknown error'}. The file may be too large (${Math.round((text.length / 1024 / 1024) * 10) / 10}MB).`
            );
          }

          console.log('[Bitstream] JSON parsed, success:', result.success);

          if (result.success) {
            // Handle large files that require chunking
            if (result.message && result.bitstream === null) {
              // File is too large - we'll load metadata and first chunk
              console.log('[Bitstream] Large file detected:', result.message);

              // Load first chunk (1MB)
              const chunkSize = result.suggestedChunkSize ?? 1024 * 1024;
              const firstChunkResponse = await fetch(
                '/api/what-the-ffmpeg/bitstream',
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    fileId,
                    streamIndex: 0,
                    format: 'hex',
                    codecSpecific: false, // Don't parse NAL units for chunks
                    byteRange: { start: 0, end: chunkSize },
                  }),
                }
              );

              if (firstChunkResponse.ok) {
                const chunkResult = await firstChunkResponse.json();
                if (chunkResult.success) {
                  setBitstreamData({
                    ...result,
                    bitstream: chunkResult.bitstream,
                    isChunked: true,
                    currentChunk: { start: 0, end: chunkSize },
                    totalSize: result.statistics.totalSize,
                  });
                  console.log('[Bitstream] First chunk loaded');
                } else {
                  setBitstreamData(result); // Store metadata at least
                }
              } else {
                setBitstreamData(result); // Store metadata at least
              }
            } else {
              // Normal file - store all data
              const dataToStore = {
                ...result,
                bitstream: result.bitstream,
                isChunked: false,
              };

              setBitstreamData(dataToStore);
              console.log(
                '[Bitstream] Data set in state, size:',
                result.bitstream?.length ?? 0,
                'hex chars'
              );
            }
          } else {
            setBitstreamError(result.error ?? 'Failed to load bitstream');
          }
        } else {
          const errorText = await response.text().catch(() => '');
          let errorMessage = 'Failed to load bitstream';
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.error ?? errorMessage;
          } catch {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
          setBitstreamError(errorMessage);
        }
      } catch (err) {
        console.error('[Bitstream] Error:', err);
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            setBitstreamError(
              'Request timed out. The bitstream file is very large. Please try again or contact support.'
            );
          } else {
            setBitstreamError(err.message ?? 'Failed to load bitstream');
          }
        } else {
          setBitstreamError('Failed to load bitstream');
        }
      } finally {
        clearTimeout(timeoutId);
        // Ensure loading state is cleared, even if there's a delay
        setTimeout(() => {
          setLoadingBitstream(false);
          console.log('[Bitstream] Loading state cleared');
        }, 0);
      }
    },
    [fileId, videoStream, loadingBitstream]
  );

  const handleOffsetClick = (offset: number) => {
    setSelectedOffset(offset);
    setBitstreamTab('hex'); // Switch to hex view when clicking on offset
  };

  // Auto-load bitstream when video stream is available and bitstream tab is active
  // Only attempt once - don't retry on error automatically
  React.useEffect(() => {
    if (
      videoStream &&
      activeTab === 'bitstream' &&
      !bitstreamData &&
      !loadingBitstream &&
      !bitstreamAttempted
    ) {
      void loadBitstream();
    }
  }, [
    videoStream,
    activeTab,
    bitstreamData,
    loadingBitstream,
    bitstreamAttempted,
    loadBitstream,
  ]);

  // Safety mechanism: ensure loading state clears after timeout
  React.useEffect(() => {
    if (loadingBitstream) {
      const safetyTimeout = setTimeout(() => {
        console.warn(
          '[Bitstream] Safety timeout: forcing loading state to false'
        );
        setLoadingBitstream(false);
      }, 200000); // 3.3 minutes - longer than the fetch timeout

      return () => clearTimeout(safetyTimeout);
    }
  }, [loadingBitstream]);

  // Scroll timeline to show current frame when it changes
  React.useEffect(() => {
    if (
      timelineRef.current &&
      framesData.length > 0 &&
      currentFrameIndex >= 0
    ) {
      const frameWidth = timelineRef.current.scrollWidth / framesData.length;
      const scrollPosition =
        currentFrameIndex * frameWidth -
        timelineRef.current.clientWidth / 2 +
        frameWidth / 2;
      timelineRef.current.scrollTo({
        left: Math.max(0, scrollPosition),
        behavior: 'smooth',
      });
    }
  }, [currentFrameIndex, framesData.length]);

  React.useEffect(() => {
    void loadFileData();
  }, [fileId]);

  // Load frame preview when frame changes
  React.useEffect(() => {
    if (currentFrame && fileId && videoStream) {
      void loadFramePreview();
    }
  }, [currentFrameIndex, fileId, framesData.length, probeData]);

  const loadFramePreview = async () => {
    if (!currentFrame || !fileId) return;

    // Only extract frames from video streams (frames should always be from video)
    // Don't pass streamIndex - let the backend always use the first video stream
    try {
      setLoadingFramePreview(true);
      setFramePreviewError(false);
      const response = await fetch('/api/what-the-ffmpeg/frames/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId,
          frameNumber: currentFrameIndex,
          time:
            toNumber(currentFrame.pkt_pts_time) ??
            toNumber(currentFrame.pts_time) ??
            undefined,
          // Don't pass streamIndex - backend will always use first video stream
        }),
      });

      const result = await response.json();
      if (result.success && result.frameUrl) {
        setFramePreviewUrl(result.frameUrl);
        setFramePreviewError(false);
      } else {
        // Generate a placeholder based on frame data
        setFramePreviewUrl(null);
        setFramePreviewError(true);
      }
    } catch (err) {
      console.warn('Failed to load frame preview:', err);
      setFramePreviewUrl(null);
      setFramePreviewError(true);
    } finally {
      setLoadingFramePreview(false);
    }
  };

  const loadFileData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load file metadata with retry
      const metadata = await retry(
        async () => {
          const metadataResponse = await fetch(
            `/api/what-the-ffmpeg/${fileId}/metadata`
          );
          if (!metadataResponse.ok) {
            throw new Error('Failed to load file metadata');
          }
          return await metadataResponse.json();
        },
        {
          maxRetries: 3,
          retryDelay: 1000,
        }
      );

      setFileMetadata(metadata);

      // Load probe data if available (non-blocking, no retry for initial load)
      try {
        const probeResponse = await fetch('/api/what-the-ffmpeg/probe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileId,
            options: {
              showFormat: true,
              showStreams: true,
            },
          }),
        });

        if (probeResponse.ok) {
          const probeResult = await probeResponse.json();
          if (probeResult.success) {
            setProbeData(probeResult.data);
          }
        }
      } catch (probeError) {
        console.warn('Failed to load probe data:', probeError);
        // Don't set error for probe data failure on initial load
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load file data');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (includeFrames = false) => {
    try {
      setAnalyzing(true);
      setError(null);

      await retry(
        async () => {
          const response = await fetch('/api/what-the-ffmpeg/probe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileId,
              options: {
                showFormat: true,
                showStreams: true,
                showFrames: includeFrames,
                showPackets: false,
              },
            }),
          });

          if (!response.ok) {
            throw new Error('Analysis failed');
          }

          const result = await response.json();
          if (result.success) {
            setProbeData(result.data);
            if (includeFrames && result.data.frames) {
              setFramesData(result.data.frames);
            }
          } else {
            throw new Error(result.error ?? 'Analysis failed');
          }
        },
        {
          maxRetries: 3,
          retryDelay: 1000,
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const loadFrames = async () => {
    try {
      setLoadingFrames(true);
      setError(null);

      await retry(
        async () => {
          const response = await fetch('/api/what-the-ffmpeg/probe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileId,
              options: {
                showFormat: true,
                showStreams: true,
                showFrames: true,
                showPackets: false,
                page: 0,
                pageSize: 100,
              },
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to load frames');
          }

          const result = await response.json();
          if (result.success && result.data.frames) {
            setFramesData(result.data.frames);
            setProbeData(result.data);
          } else {
            throw new Error(result.error ?? 'Failed to load frames');
          }
        },
        {
          maxRetries: 3,
          retryDelay: 1000,
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load frames');
    } finally {
      setLoadingFrames(false);
    }
  };

  const loadPackets = async () => {
    try {
      setLoadingPackets(true);
      setError(null);

      await retry(
        async () => {
          const response = await fetch('/api/what-the-ffmpeg/probe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileId,
              options: {
                showFormat: true,
                showStreams: true,
                showFrames: false,
                showPackets: true,
                page: packetPage,
                pageSize: packetsPerPage,
              },
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to load packets');
          }

          const result = await response.json();
          if (result.success) {
            // Packets might be in result.data.packets array
            if (result.data.packets && Array.isArray(result.data.packets)) {
              setPacketsData(result.data.packets);
            } else {
              // If no packets array, set empty array and show message
              setPacketsData([]);
              setError(
                'No packet data available. The file may not contain packet information, or packet analysis may not be supported for this format.'
              );
            }
            setProbeData(result.data);
          } else {
            throw new Error(result.error ?? 'Failed to load packets');
          }
        },
        {
          maxRetries: 3,
          retryDelay: 1000,
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load packets');
    } finally {
      setLoadingPackets(false);
    }
  };

  const getFileIcon = (type?: string) => {
    if (!type) return <FileVideo className="h-8 w-8 text-gray-400" />;
    if (type.startsWith('video/'))
      return <FileVideo className="h-8 w-8 text-orange-400" />;
    if (type.startsWith('audio/'))
      return <FileAudio className="h-8 w-8 text-blue-400" />;
    if (type.startsWith('image/'))
      return <ImageIcon className="h-8 w-8 text-green-400" />;
    return <FileVideo className="h-8 w-8 text-gray-400" />;
  };

  const formatBytes = (bytes: string | number): string => {
    const numBytes = typeof bytes === 'string' ? parseInt(bytes) : bytes;
    if (numBytes < 1024) return numBytes + ' B';
    if (numBytes < 1024 * 1024) return (numBytes / 1024).toFixed(2) + ' KB';
    return (numBytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDuration = (seconds: string | number): string => {
    const numSeconds =
      typeof seconds === 'string' ? parseFloat(seconds) : seconds;
    const hours = Math.floor(numSeconds / 3600);
    const minutes = Math.floor((numSeconds % 3600) / 60);
    const secs = Math.floor(numSeconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatNumber = (value: string | number | undefined): number => {
    if (value === undefined || value === null) return 0;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return value;
  };

  const getStreamTypeIcon = (codecType: string) => {
    switch (codecType) {
      case 'video':
        return <Film className="h-5 w-5 text-orange-400" />;
      case 'audio':
        return <Music className="h-5 w-5 text-blue-400" />;
      case 'subtitle':
        return <FileVideo className="h-5 w-5 text-green-400" />;
      default:
        return <Code className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStreamTypeColor = (codecType: string) => {
    switch (codecType) {
      case 'video':
        return 'border-orange-400/50 bg-orange-400/10';
      case 'audio':
        return 'border-blue-400/50 bg-blue-400/10';
      case 'subtitle':
        return 'border-green-400/50 bg-green-400/10';
      default:
        return 'border-gray-400/50 bg-gray-400/10';
    }
  };

  const handleFrameJump = () => {
    const frameNum = parseInt(frameJumpValue);
    if (!isNaN(frameNum) && frameNum >= 0 && frameNum < framesData.length) {
      setCurrentFrameIndex(frameNum);
      setFrameJumpValue('');
    }
  };

  const getFrameTypeColor = (pictType: string) => {
    switch (pictType) {
      case 'I':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'P':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'B':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'S':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  // Load file data on mount
  React.useEffect(() => {
    void loadFileData();
  }, [fileId]);

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 bg-linear-to-br from-gray-900 via-orange-900 to-yellow-900 animate-gradient -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <OverviewSkeleton />
        </div>
      </div>
    );
  }

  if (error && !fileMetadata) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ErrorDisplay
            error={error}
            onRetry={() => {
              setError(null);
              void loadFileData();
            }}
            title="Failed to Load File"
          />
          <div className="mt-4">
            <Link href="/what-the-ffmpeg">
              <Button variant="ghost" className="text-white hover:bg-white/20">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Upload
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Override purple background with orange/yellow theme */}
      <div className="fixed inset-0 bg-linear-to-br from-gray-900 via-orange-900 to-yellow-900 animate-gradient -z-10" />
      <div className="fixed inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-0">
        {/* Header */}
        <div className="mb-8">
          <Link href="/what-the-ffmpeg">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/20 mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Upload
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {fileMetadata &&
                getFileIcon(fileMetadata.fileType ?? fileMetadata.type)}
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {fileMetadata?.filename ?? 'File Analysis'}
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  {fileMetadata && formatBytes(fileMetadata.size)}
                  {probeData?.format?.duration &&
                    ` • ${formatDuration(probeData.format.duration)}`}
                </p>
              </div>
            </div>
            {probeData && (
              <Button
                onClick={() => {
                  const exportData = {
                    metadata: fileMetadata,
                    probeData: {
                      format: probeData.format,
                      streams: probeData.streams,
                      frames: framesData.length > 0 ? framesData : undefined,
                      packets: packetsData.length > 0 ? packetsData : undefined,
                    },
                    exportDate: new Date().toISOString(),
                  };
                  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                    type: 'application/json',
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${fileId}-analysis-${new Date().toISOString().split('T')[0]}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                variant="outline"
                className="text-white border-white/20 hover:bg-white/10"
              >
                <FileDown className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            )}
          </div>
        </div>;

        {
          /* Error Display */
        }
        {
          error && (
            <ErrorDisplay
              error={error}
              onRetry={() => {
                setError(null);
                if (activeTab === 'frames') {
                  void loadFrames();
                } else if (activeTab === 'packets') {
                  void loadPackets();
                } else if (activeTab === 'bitstream') {
                  void loadBitstream();
                } else {
                  void handleAnalyze(false);
                }
              }}
              onDismiss={() => setError(null)}
              dismissible
              className="mb-6"
            />
          )
        }

        {
          /* Tabs Navigation */
        }
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 bg-linear-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30 mb-6">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-yellow-600/30 data-[state=active]:text-white"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="streams"
              className="data-[state=active]:bg-yellow-600/30 data-[state=active]:text-white"
            >
              <Film className="h-4 w-4 mr-2" />
              Streams
            </TabsTrigger>
            <TabsTrigger
              value="frames"
              className="data-[state=active]:bg-yellow-600/30 data-[state=active]:text-white"
            >
              <Film className="h-4 w-4 mr-2" />
              Frames & Timeline
            </TabsTrigger>
            <TabsTrigger
              value="codec"
              className="data-[state=active]:bg-yellow-600/30 data-[state=active]:text-white"
            >
              <Settings className="h-4 w-4 mr-2" />
              Codec
            </TabsTrigger>
            <TabsTrigger
              value="packets"
              className="data-[state=active]:bg-yellow-600/30 data-[state=active]:text-white"
            >
              <Package className="h-4 w-4 mr-2" />
              Packets
            </TabsTrigger>
            <TabsTrigger
              value="bitstream"
              className="data-[state=active]:bg-yellow-600/30 data-[state=active]:text-white"
            >
              <Code className="h-4 w-4 mr-2" />
              Bitstream
            </TabsTrigger>
          </TabsList>
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {analyzing ? (
              <OverviewSkeleton />
            ) : !probeData ? (
              <Card className="bg-linear-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-300 mb-4">
                    No analysis data available yet
                  </p>
                  <Button
                    onClick={() => handleAnalyze(false)}
                    disabled={analyzing}
                    className="bg-linear-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Start Analysis
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-400 mb-1">Format</p>
                        <HelpTooltip content={WTF_HELP.overview.format} />
                      </div>
                      <p className="text-white font-mono text-lg">
                        {probeData.format?.format_name ?? 'Unknown'}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-400 mb-1">Streams</p>
                        <HelpTooltip content="Number of media streams (video, audio, subtitles) in the file." />
                      </div>
                      <p className="text-white font-mono text-lg">
                        {probeData.streams?.length ?? 0}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-400 mb-1">Bitrate</p>
                        <HelpTooltip content={WTF_HELP.overview.bitrate} />
                      </div>
                      <p className="text-white font-mono text-lg">
                        {probeData.format?.bit_rate
                          ? `${(formatNumber(probeData.format.bit_rate) / 1000000).toFixed(2)} Mbps`
                          : 'Unknown'}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Format Information */}
                {probeData.format && (
                  <Card className="bg-linear-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Code className="h-5 w-5" />
                        Format Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-400 mb-1">
                              Format Name
                            </p>
                            <HelpTooltip content={WTF_HELP.overview.format} />
                          </div>
                          <p className="text-white font-mono text-lg">
                            {probeData.format.format_name ?? 'Unknown'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">
                            Format Long Name
                          </p>
                          <p className="text-white font-mono">
                            {probeData.format.format_long_name ?? 'Unknown'}
                          </p>
                        </div>
                        {probeData.format.duration && (
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-gray-400 mb-1">
                                Duration
                              </p>
                              <HelpTooltip
                                content={WTF_HELP.overview.duration}
                              />
                            </div>
                            <p className="text-white font-mono text-lg">
                              {formatDuration(probeData.format.duration)}
                            </p>
                          </div>
                        )}
                        {probeData.format.size && (
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-gray-400 mb-1">
                                File Size
                              </p>
                              <HelpTooltip content={WTF_HELP.overview.size} />
                            </div>
                            <p className="text-white font-mono">
                              {formatBytes(probeData.format.size)}
                            </p>
                          </div>
                        )}
                        {probeData.format.bit_rate && (
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-gray-400 mb-1">
                                Bitrate
                              </p>
                              <HelpTooltip
                                content={WTF_HELP.overview.bitrate}
                              />
                            </div>
                            <p className="text-white font-mono text-lg">
                              {(
                                formatNumber(probeData.format.bit_rate) /
                                1000000
                              ).toFixed(2)}{' '}
                              Mbps
                            </p>
                          </div>
                        )}
                        {probeData.format.nb_streams && (
                          <div>
                            <p className="text-sm text-gray-400 mb-1">
                              Number of Streams
                            </p>
                            <p className="text-white font-mono text-lg">
                              {probeData.format.nb_streams}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Streams Preview */}
                {probeData.streams && probeData.streams.length > 0 && (
                  <Card className="bg-linear-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Film className="h-5 w-5" />
                        Streams ({probeData.streams.length})
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        Click on the Streams tab for detailed analysis
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {probeData.streams
                          .slice(0, 3)
                          .map((stream: FfprobeStream, index: number) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-2 bg-white/5 backdrop-blur-lg rounded border border-white/10"
                            >
                              {getStreamTypeIcon(
                                stream.codec_type ?? 'unknown'
                              )}
                              <span className="text-white text-sm">
                                Stream #{stream.index} -{' '}
                                {stream.codec_type?.toUpperCase() ?? 'UNKNOWN'}{' '}
                                - {stream.codec_name ?? 'Unknown'}
                              </span>
                            </div>
                          ))}
                        {probeData.streams.length > 3 && (
                          <p className="text-gray-400 text-sm mt-2">
                            +{probeData.streams.length - 3} more streams
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>
          {/* Streams Tab - Phase 2 Implementation */}
          <TabsContent value="streams" className="space-y-6">
            {loading && !probeData ? (
              <StreamsSkeleton />
            ) : !probeData ? (
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-300 mb-4">No stream data available</p>
                  <Button
                    onClick={() => handleAnalyze(false)}
                    disabled={analyzing}
                    className="bg-linear-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Analyze Streams
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : probeData.streams && probeData.streams.length > 0 ? (
              <>
                {/* Stream Summary */}
                <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Stream Summary
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      {probeData.streams.length} stream
                      {probeData.streams.length !== 1 ? 's' : ''} found
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-400">
                          {
                            probeData.streams.filter(
                              (s: FfprobeStream) => s.codec_type === 'video'
                            ).length
                          }
                        </p>
                        <p className="text-sm text-gray-400">Video</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-400">
                          {
                            probeData.streams.filter(
                              (s: FfprobeStream) => s.codec_type === 'audio'
                            ).length
                          }
                        </p>
                        <p className="text-sm text-gray-400">Audio</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-400">
                          {
                            probeData.streams.filter(
                              (s: FfprobeStream) => s.codec_type === 'subtitle'
                            ).length
                          }
                        </p>
                        <p className="text-sm text-gray-400">Subtitle</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-400">
                          {
                            probeData.streams.filter(
                              (s: FfprobeStream) =>
                                !['video', 'audio', 'subtitle'].includes(
                                  s.codec_type ?? ''
                                )
                            ).length
                          }
                        </p>
                        <p className="text-sm text-gray-400">Other</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Individual Streams - Enhanced Phase 2 */}
                {probeData.streams.map(
                  (stream: FfprobeStream, index: number) => (
                    <Card
                      key={index}
                      className={`bg-linear-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border border-yellow-500/30 ${getStreamTypeColor(stream.codec_type ?? 'unknown')}`}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getStreamTypeIcon(stream.codec_type ?? 'unknown')}
                            <div>
                              <CardTitle className="text-white text-xl">
                                Stream #{stream.index} -{' '}
                                {stream.codec_type?.toUpperCase() ?? 'UNKNOWN'}
                              </CardTitle>
                              <CardDescription className="text-gray-300">
                                {stream.codec_long_name ??
                                  stream.codec_name ??
                                  'Unknown codec'}
                              </CardDescription>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {/* Codec Information */}
                          <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                              Codec
                            </h3>
                            <div className="space-y-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-xs text-gray-500 mb-1">
                                    Codec Name
                                  </p>
                                  <HelpTooltip
                                    content={WTF_HELP.streams.codec}
                                  />
                                </div>
                                <p className="text-white font-mono text-lg">
                                  {stream.codec_name ?? 'Unknown'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">
                                  Codec Long Name
                                </p>
                                <p className="text-white font-mono text-sm">
                                  {stream.codec_long_name ?? 'Unknown'}
                                </p>
                              </div>
                              {stream.codec_tag_string && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">
                                    Codec Tag
                                  </p>
                                  <p className="text-white font-mono">
                                    {stream.codec_tag_string}
                                  </p>
                                </div>
                              )}
                              {stream.profile && (
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs text-gray-500 mb-1">
                                      Profile
                                    </p>
                                    <HelpTooltip
                                      content={WTF_HELP.streams.profile}
                                    />
                                  </div>
                                  <p className="text-white font-mono">
                                    {stream.profile}
                                  </p>
                                </div>
                              )}
                              {stream.level && (
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs text-gray-500 mb-1">
                                      Level
                                    </p>
                                    <HelpTooltip
                                      content={WTF_HELP.streams.level}
                                    />
                                  </div>
                                  <p className="text-white font-mono">
                                    {stream.level}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Video-specific properties */}
                          {stream.codec_type === 'video' && (
                            <div className="space-y-3">
                              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                                Video Properties
                              </h3>
                              <div className="space-y-2">
                                {stream.width && stream.height && (
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="text-xs text-gray-500 mb-1">
                                        Resolution
                                      </p>
                                      <HelpTooltip
                                        content={WTF_HELP.streams.resolution}
                                      />
                                    </div>
                                    <p className="text-white font-mono text-lg">
                                      {stream.width} × {stream.height}
                                    </p>
                                  </div>
                                )}
                                {stream.r_frame_rate && (
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="text-xs text-gray-500 mb-1">
                                        Frame Rate
                                      </p>
                                      <HelpTooltip
                                        content={WTF_HELP.streams.framerate}
                                      />
                                    </div>
                                    <p className="text-white font-mono">
                                      {stream.r_frame_rate}
                                    </p>
                                  </div>
                                )}
                                {stream.pix_fmt && (
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">
                                      Pixel Format
                                    </p>
                                    <p className="text-white font-mono">
                                      {stream.pix_fmt}
                                    </p>
                                  </div>
                                )}
                                {stream.display_aspect_ratio && (
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">
                                      Aspect Ratio
                                    </p>
                                    <p className="text-white font-mono">
                                      {stream.display_aspect_ratio}
                                    </p>
                                  </div>
                                )}
                                {stream.color_space && (
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">
                                      Color Space
                                    </p>
                                    <p className="text-white font-mono">
                                      {stream.color_space}
                                    </p>
                                  </div>
                                )}
                                {stream.color_range && (
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">
                                      Color Range
                                    </p>
                                    <p className="text-white font-mono">
                                      {stream.color_range}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Audio-specific properties */}
                          {stream.codec_type === 'audio' && (
                            <div className="space-y-3">
                              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                                Audio Properties
                              </h3>
                              <div className="space-y-2">
                                {stream.sample_rate && (
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">
                                      Sample Rate
                                    </p>
                                    <p className="text-white font-mono text-lg">
                                      {stream.sample_rate} Hz
                                    </p>
                                  </div>
                                )}
                                {stream.channels && (
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">
                                      Channels
                                    </p>
                                    <p className="text-white font-mono text-lg">
                                      {stream.channels}
                                    </p>
                                  </div>
                                )}
                                {stream.channel_layout && (
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">
                                      Channel Layout
                                    </p>
                                    <p className="text-white font-mono">
                                      {stream.channel_layout}
                                    </p>
                                  </div>
                                )}
                                {stream.sample_fmt && (
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">
                                      Sample Format
                                    </p>
                                    <p className="text-white font-mono">
                                      {stream.sample_fmt}
                                    </p>
                                  </div>
                                )}
                                {stream.bits_per_sample && (
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">
                                      Bits Per Sample
                                    </p>
                                    <p className="text-white font-mono">
                                      {stream.bits_per_sample}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Common properties */}
                          <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                              Properties
                            </h3>
                            <div className="space-y-2">
                              {stream.bit_rate && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">
                                    Bitrate
                                  </p>
                                  <p className="text-white font-mono">
                                    {(
                                      formatNumber(stream.bit_rate) / 1000
                                    ).toFixed(0)}{' '}
                                    kbps
                                  </p>
                                </div>
                              )}
                              {stream.duration && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">
                                    Duration
                                  </p>
                                  <p className="text-white font-mono">
                                    {formatDuration(stream.duration)}
                                  </p>
                                </div>
                              )}
                              {stream.start_time && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">
                                    Start Time
                                  </p>
                                  <p className="text-white font-mono">
                                    {formatDuration(stream.start_time)}
                                  </p>
                                </div>
                              )}
                              {stream.nb_frames && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">
                                    Frame Count
                                  </p>
                                  <p className="text-white font-mono">
                                    {stream.nb_frames}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
              </>
            ) : (
              <Card className="bg-linear-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-300">No streams found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          {/* Frames Tab - Phase 3 Implementation */}
          <TabsContent value="frames" className="space-y-6">
            {loadingFrames ? (
              <FramesSkeleton />
            ) : !videoStream ? (
              <Card className="bg-linear-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-300 mb-4">No video stream found</p>
                  <p className="text-gray-400 text-sm">
                    Frame analysis is only available for video files
                  </p>
                </CardContent>
              </Card>
            ) : framesData.length === 0 ? (
              <Card className="bg-linear-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-300 mb-4">Frame data not loaded</p>
                  <Button
                    onClick={loadFrames}
                    disabled={loadingFrames}
                    className="bg-linear-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
                  >
                    {loadingFrames ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading Frames...
                      </>
                    ) : (
                      <>
                        <Film className="mr-2 h-4 w-4" />
                        Load Frame Data
                      </>
                    )}
                  </Button>
                  <p className="text-gray-400 text-xs mt-2">
                    This may take a while for large files
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Frame Timeline - Interactive */}
                {framesData.length > 0 && (
                  <Card className="bg-linear-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          Frame Timeline
                        </CardTitle>
                        <CardDescription className="text-gray-300">
                          {framesData.length} frames • Click any frame to jump
                          to it
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div
                        ref={timelineRef}
                        className="relative bg-white/5 backdrop-blur-lg rounded border border-white/10 overflow-x-auto"
                      >
                        <div
                          className="relative h-20 min-w-full"
                          style={{
                            width: `${Math.max(framesData.length * 4, 100)}px`,
                          }}
                        >
                          {framesData.map((frame: FrameData, idx: number) => {
                            const duration = formatNumber(
                              probeData?.format?.duration ?? 0
                            );
                            const frameTime =
                              toNumber(frame.pkt_pts_time) ??
                              toNumber(frame.pts_time) ??
                              0;
                            const isSelected = idx === currentFrameIndex;

                            return (
                              <div
                                key={idx}
                                onClick={() => setCurrentFrameIndex(idx)}
                                className={`absolute h-full border-r border-white/5 cursor-pointer transition-all hover:brightness-125 ${
                                  isSelected
                                    ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-gray-900 z-10'
                                    : ''
                                } ${
                                  frame.pict_type === 'I'
                                    ? 'bg-green-500/60 hover:bg-green-500/80'
                                    : frame.pict_type === 'P'
                                      ? 'bg-blue-500/60 hover:bg-blue-500/80'
                                      : frame.pict_type === 'B'
                                        ? 'bg-orange-500/60 hover:bg-orange-500/80'
                                        : 'bg-white/10 hover:bg-white/20'
                                }`}
                                style={{
                                  left: `${(idx / framesData.length) * 100}%`,
                                  width: `${(1 / framesData.length) * 100}%`,
                                }}
                                title={`Frame ${idx + 1}: ${frame.pict_type ?? '?'} at ${frameTime.toFixed(3)}s - Click to jump`}
                              >
                                {isSelected && (
                                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-yellow-400 font-semibold whitespace-nowrap">
                                    Frame {idx + 1}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          {/* Time markers */}
                          <div className="absolute bottom-0 left-0 right-0 h-6 bg-white/10 backdrop-blur-lg flex items-center justify-between px-2 text-xs text-gray-400">
                            <span>0s</span>
                            <span>
                              {probeData?.format?.duration
                                ? formatDuration(probeData.format.duration)
                                : '0:00'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-green-500/60 rounded"></div>
                          <span>I-Frames</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-blue-500/60 rounded"></div>
                          <span>P-Frames</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-orange-500/60 rounded"></div>
                          <span>B-Frames</span>
                        </div>
                        <div className="flex items-center gap-1 ml-auto">
                          <div className="w-3 h-3 border-2 border-yellow-400 rounded"></div>
                          <span>Selected Frame</span>
                        </div>
                      </div>
                      {framesData.length > 100 && (
                        <p className="text-xs text-gray-500 mt-2">
                          Scroll horizontally to see all {framesData.length}{' '}
                          frames
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}
                {/* Frame Navigation */}
                <Card className="bg-linear-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Film className="h-5 w-5" />
                      Frame Navigation
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Frame {currentFrameIndex + 1} of {framesData.length}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 flex-wrap">
                      <Button
                        onClick={() =>
                          setCurrentFrameIndex(
                            Math.max(0, currentFrameIndex - 1)
                          )
                        }
                        disabled={currentFrameIndex === 0}
                        className="bg-yellow-600/80 hover:bg-yellow-600 text-white border-yellow-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Jump to frame..."
                          value={frameJumpValue}
                          onChange={(e) => setFrameJumpValue(e.target.value)}
                          className="w-32 bg-white/10 backdrop-blur-lg border-white/20 text-white"
                          min={0}
                          max={framesData.length - 1}
                        />
                        <Button
                          onClick={handleFrameJump}
                          className="bg-yellow-600/80 hover:bg-yellow-600 text-white border-yellow-500/50"
                        >
                          Jump
                        </Button>
                      </div>
                      <Button
                        onClick={() =>
                          setCurrentFrameIndex(
                            Math.min(
                              framesData.length - 1,
                              currentFrameIndex + 1
                            )
                          )
                        }
                        disabled={currentFrameIndex === framesData.length - 1}
                        className="bg-yellow-600/80 hover:bg-yellow-600 text-white border-yellow-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <div className="ml-auto text-sm text-gray-400">
                        {videoStream.r_frame_rate &&
                          `Frame Rate: ${videoStream.r_frame_rate}`}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/* Current Frame Details */}
                {currentFrame && (
                  <Card className="bg-linear-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white flex items-center gap-2">
                          <Film className="h-5 w-5" />
                          Frame #{currentFrameIndex + 1}
                          {currentFrame.coded_picture_number !== undefined && (
                            <span className="text-gray-400 text-sm font-normal">
                              (Coded: {currentFrame.coded_picture_number})
                            </span>
                          )}
                        </CardTitle>
                        <div
                          className={`px-3 py-1 rounded border ${getFrameTypeColor(currentFrame.pict_type ?? '')}`}
                        >
                          <span className="font-mono font-bold">
                            {currentFrame.pict_type ?? '?'}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Frame Visualization */}
                      <div className="mb-6">
                        <div
                          className="relative w-full bg-black/50 rounded-lg border border-white/20 overflow-hidden"
                          style={{
                            aspectRatio:
                              videoStream?.width && videoStream?.height
                                ? `${videoStream.width}/${videoStream.height}`
                                : '16/9',
                          }}
                        >
                          {loadingFramePreview ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center">
                                <Loader2 className="h-8 w-8 animate-spin text-yellow-400 mx-auto mb-2" />
                                <p className="text-gray-400 text-sm">
                                  Loading frame...
                                </p>
                              </div>
                            </div>
                          ) : framePreviewUrl && !framePreviewError ? (
                            <img
                              src={framePreviewUrl}
                              alt={`Frame ${currentFrameIndex + 1}`}
                              className="w-full h-full object-contain"
                              onError={() => {
                                console.warn('Failed to load frame image');
                                setFramePreviewError(true);
                                setFramePreviewUrl(null);
                              }}
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center p-6">
                                <Film className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                                <p className="text-gray-400 text-sm mb-1">
                                  Frame Preview
                                </p>
                                <p className="text-gray-500 text-xs">
                                  {videoStream?.width && videoStream?.height
                                    ? `${videoStream.width} × ${videoStream.height}`
                                    : 'Preview unavailable'}
                                </p>
                                {currentFrame.pict_type && (
                                  <div
                                    className={`mt-3 inline-block px-3 py-1 rounded border ${getFrameTypeColor(currentFrame.pict_type)}`}
                                  >
                                    <span className="font-mono text-sm font-bold">
                                      {currentFrame.pict_type}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        {framePreviewUrl && (
                          <p className="text-xs text-gray-500 mt-2 text-center">
                            Frame at{' '}
                            {toNumber(currentFrame.pkt_pts_time) !== undefined
                              ? toNumber(currentFrame.pkt_pts_time)!.toFixed(3)
                              : 'N/A'}
                            s
                          </p>
                        )}
                      </div>

                      {/* Frame Metadata */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-400 mb-1">
                            Frame Type
                          </p>
                          <p className="text-white font-mono text-lg">
                            {currentFrame.pict_type ?? 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {currentFrame.key_frame === 1
                              ? 'Keyframe'
                              : 'Non-keyframe'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">PTS</p>
                          <p className="text-white font-mono">
                            {currentFrame.pkt_pts ?? 'N/A'}
                          </p>
                          {toNumber(currentFrame.pkt_pts_time) !==
                            undefined && (
                            <p className="text-xs text-gray-500 mt-1">
                              {toNumber(currentFrame.pkt_pts_time)!.toFixed(3)}s
                            </p>
                          )}
                        </div>
                        {currentFrame.pkt_dts !== undefined && (
                          <div>
                            <p className="text-sm text-gray-400 mb-1">DTS</p>
                            <p className="text-white font-mono">
                              {currentFrame.pkt_dts}
                            </p>
                            {toNumber(currentFrame.pkt_dts_time) !==
                              undefined && (
                              <p className="text-xs text-gray-500 mt-1">
                                {toNumber(currentFrame.pkt_dts_time)!.toFixed(
                                  3
                                )}
                                s
                              </p>
                            )}
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-gray-400 mb-1">
                            Packet Size
                          </p>
                          <p className="text-white font-mono">
                            {currentFrame.pkt_size ?? 'N/A'} bytes
                          </p>
                        </div>
                        {toNumber(currentFrame.pkt_duration_time) !==
                          undefined && (
                          <div>
                            <p className="text-sm text-gray-400 mb-1">
                              Duration
                            </p>
                            <p className="text-white font-mono">
                              {toNumber(
                                currentFrame.pkt_duration_time
                              )!.toFixed(3)}
                              s
                            </p>
                          </div>
                        )}
                        {currentFrame.stream_index !== undefined && (
                          <div>
                            <p className="text-sm text-gray-400 mb-1">
                              Stream Index
                            </p>
                            <p className="text-white font-mono">
                              {currentFrame.stream_index}
                            </p>
                          </div>
                        )}
                        {currentFrame.media_type && (
                          <div>
                            <p className="text-sm text-gray-400 mb-1">
                              Media Type
                            </p>
                            <p className="text-white font-mono">
                              {currentFrame.media_type}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
                {/* Frame Statistics */};
                <Card className="bg-linear-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Frame Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">
                          Total Frames
                        </p>
                        <p className="text-white font-mono text-2xl">
                          {framesData.length}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">I-Frames</p>
                        <p className="text-white font-mono text-2xl text-green-400">
                          {framesData.filter((f) => f.pict_type === 'I').length}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">P-Frames</p>
                        <p className="text-white font-mono text-2xl text-blue-400">
                          {framesData.filter((f) => f.pict_type === 'P').length}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">B-Frames</p>
                        <p className="text-white font-mono text-2xl text-orange-400">
                          {framesData.filter((f) => f.pict_type === 'B').length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/* Additional Timeline Visualizations */}
                {probeData?.format?.duration && (
                  <>
                    {/* Stream Timeline */}
                    {probeData.streams && probeData.streams.length > 0 && (
                      <Card className="bg-linear-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center gap-2">
                            <Film className="h-5 w-5" />
                            Stream Timeline
                          </CardTitle>
                          <CardDescription className="text-gray-300">
                            {probeData.streams.length} stream
                            {probeData.streams.length !== 1 ? 's' : ''}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {probeData.streams.map(
                              (stream: FfprobeStream, idx: number) => {
                                const duration = formatNumber(
                                  probeData.format.duration
                                );
                                const streamDuration = stream.duration
                                  ? formatNumber(stream.duration)
                                  : duration;
                                const startTime = stream.start_time
                                  ? formatNumber(stream.start_time)
                                  : 0;
                                const leftPercent =
                                  (startTime / duration) * 100;
                                const widthPercent =
                                  (streamDuration / duration) * 100;

                                return (
                                  <div key={idx} className="relative">
                                    <div className="flex items-center gap-3 mb-1">
                                      {getStreamTypeIcon(
                                        stream.codec_type ?? 'unknown'
                                      )}
                                      <span className="text-white text-sm">
                                        Stream #{stream.index} -{' '}
                                        {stream.codec_type?.toUpperCase() ??
                                          'UNKNOWN'}{' '}
                                        ({stream.codec_name})
                                      </span>
                                    </div>
                                    <div className="relative h-8 bg-white/5 backdrop-blur-lg rounded border border-white/10 overflow-hidden">
                                      <div
                                        className={`absolute h-full ${getStreamTypeColor(stream.codec_type ?? 'unknown')}`}
                                        style={{
                                          left: `${leftPercent}%`,
                                          width: `${widthPercent}%`,
                                        }}
                                      />
                                      <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-mono">
                                        {formatDuration(streamDuration)}
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Packet Timeline */}
                    {packetsData.length > 0 && (
                      <Card className="bg-linear-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Packet Timeline
                          </CardTitle>
                          <CardDescription className="text-gray-300">
                            {packetsData.length} packets (showing up to 500)
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="relative h-12 bg-white/5 backdrop-blur-lg rounded border border-white/10 overflow-hidden">
                            <div className="absolute inset-0">
                              {packetsData
                                .slice(0, 500)
                                .map((packet: any, idx: number) => {
                                  const duration = formatNumber(
                                    probeData.format.duration
                                  );
                                  const packetTime = packet.pts_time
                                    ? parseFloat(packet.pts_time)
                                    : 0;
                                  const leftPercent =
                                    (packetTime / duration) * 100;
                                  const packetSize = parseInt(
                                    packet.size ?? '0'
                                  );
                                  const maxSize = Math.max(
                                    ...packetsData.map(
                                      (p: any) =>
                                        parseInt(
                                          (p.size as string) ?? '0',
                                          10
                                        ) ?? 0
                                    )
                                  );
                                  const heightPercent =
                                    maxSize > 0
                                      ? (packetSize / maxSize) * 100
                                      : 0;

                                  return (
                                    <div
                                      key={idx}
                                      className="absolute bg-yellow-500/40 border-l border-yellow-500/60"
                                      style={{
                                        left: `${leftPercent}%`,
                                        width: '2px',
                                        height: `${Math.max(heightPercent, 5)}%`,
                                        bottom: 0,
                                      }}
                                      title={`Packet ${idx + 1}: ${packetSize} bytes at ${packetTime.toFixed(3)}s`}
                                    />
                                  );
                                })}
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-4 bg-white/10 backdrop-blur-lg flex items-center justify-between px-2 text-xs text-gray-400">
                              <span>0s</span>
                              <span>
                                {formatDuration(probeData.format.duration)}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 mt-2">
                            Height represents packet size
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Keyframe Distribution */}
                    <Card className="bg-linear-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Film className="h-5 w-5" />
                          Keyframe Distribution
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white/5 backdrop-blur-lg rounded p-3 border border-white/10">
                            <p className="text-xs text-gray-400 mb-1">
                              Total Keyframes
                            </p>
                            <p className="text-white font-mono text-xl">
                              {
                                framesData.filter(
                                  (f: FrameData) => f.key_frame === 1
                                ).length
                              }
                            </p>
                          </div>
                          <div className="bg-white/5 backdrop-blur-lg rounded p-3 border border-white/10">
                            <p className="text-xs text-gray-400 mb-1">
                              Keyframe Interval
                            </p>
                            <p className="text-white font-mono text-xl">
                              {(() => {
                                const keyframes = framesData.filter(
                                  (f: FrameData) => f.key_frame === 1
                                );
                                if (keyframes.length < 2) return 'N/A';
                                const intervals = [];
                                for (let i = 1; i < keyframes.length; i++) {
                                  const prev =
                                    toNumber(keyframes[i - 1].pkt_pts_time) ??
                                    0;
                                  const curr =
                                    toNumber(keyframes[i].pkt_pts_time) ?? 0;
                                  intervals.push(curr - prev);
                                }
                                const avg =
                                  intervals.reduce((a, b) => a + b, 0) /
                                  intervals.length;
                                return `${avg.toFixed(2)}s`;
                              })()}
                            </p>
                          </div>
                          <div className="bg-white/5 backdrop-blur-lg rounded p-3 border border-white/10">
                            <p className="text-xs text-gray-400 mb-1">
                              GOP Size
                            </p>
                            <p className="text-white font-mono text-xl">
                              {(() => {
                                const keyframes = framesData.filter(
                                  (f: FrameData) => f.key_frame === 1
                                );
                                if (keyframes.length < 2) return 'N/A';
                                return Math.round(
                                  framesData.length / keyframes.length
                                );
                              })()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Sync Analysis */}
                    {probeData.streams && probeData.streams.length > 1 && (
                      <Card className="bg-linear-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Sync Analysis
                          </CardTitle>
                          <CardDescription className="text-gray-300">
                            Audio/Video synchronization analysis
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {probeData.streams
                              ?.filter(
                                (s: FfprobeStream) => s.codec_type === 'video'
                              )
                              .map(
                                (videoStream: FfprobeStream, idx: number) => {
                                  const audioStreams =
                                    probeData.streams?.filter(
                                      (s: FfprobeStream) =>
                                        s.codec_type === 'audio'
                                    ) ?? [];
                                  return audioStreams.map(
                                    (
                                      audioStream: FfprobeStream,
                                      audioIdx: number
                                    ) => {
                                      const videoStart = videoStream.start_time
                                        ? formatNumber(videoStream.start_time)
                                        : 0;
                                      const audioStart = audioStream.start_time
                                        ? formatNumber(audioStream.start_time)
                                        : 0;
                                      const syncOffset =
                                        audioStart - videoStart;

                                      return (
                                        <div
                                          key={`${idx}-${audioIdx}`}
                                          className="bg-white/5 backdrop-blur-lg rounded p-4 border border-white/10"
                                        >
                                          <div className="flex items-center justify-between mb-2">
                                            <span className="text-white text-sm">
                                              Video Stream #{videoStream.index}{' '}
                                              ↔ Audio Stream #
                                              {audioStream.index}
                                            </span>
                                            <span
                                              className={`text-sm font-mono ${
                                                Math.abs(syncOffset) < 0.1
                                                  ? 'text-green-400'
                                                  : Math.abs(syncOffset) < 0.5
                                                    ? 'text-yellow-400'
                                                    : 'text-red-400'
                                              }`}
                                            >
                                              {syncOffset > 0 ? '+' : ''}
                                              {syncOffset.toFixed(3)}s
                                            </span>
                                          </div>
                                          <div className="text-xs text-gray-400">
                                            {Math.abs(syncOffset) < 0.1
                                              ? '✓ Synchronized'
                                              : Math.abs(syncOffset) < 0.5
                                                ? '⚠ Minor sync offset'
                                                : '✗ Significant sync offset'}
                                          </div>
                                        </div>
                                      );
                                    }
                                  );
                                }
                              )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Quality Metrics */}
                    {videoStream && (
                      <Card className="bg-linear-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Quality Metrics
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {videoStream.bit_rate && (
                              <div className="bg-white/5 backdrop-blur-lg rounded p-3 border border-white/10">
                                <p className="text-xs text-gray-400 mb-1">
                                  Bitrate
                                </p>
                                <p className="text-white font-mono text-lg">
                                  {(
                                    formatNumber(videoStream.bit_rate) / 1000
                                  ).toFixed(0)}{' '}
                                  kbps
                                </p>
                              </div>
                            )}
                            {videoStream.width && videoStream.height && (
                              <div className="bg-white/5 backdrop-blur-lg rounded p-3 border border-white/10">
                                <p className="text-xs text-gray-400 mb-1">
                                  Resolution
                                </p>
                                <p className="text-white font-mono text-lg">
                                  {videoStream.width} × {videoStream.height}
                                </p>
                              </div>
                            )}
                            {videoStream.r_frame_rate && (
                              <div className="bg-white/5 backdrop-blur-lg rounded p-3 border border-white/10">
                                <p className="text-xs text-gray-400 mb-1">
                                  Frame Rate
                                </p>
                                <p className="text-white font-mono text-lg">
                                  {videoStream.r_frame_rate}
                                </p>
                              </div>
                            )}
                            {framesData.length > 0 && (
                              <div className="bg-white/5 backdrop-blur-lg rounded p-3 border border-white/10">
                                <p className="text-xs text-gray-400 mb-1">
                                  Avg Frame Size
                                </p>
                                <p className="text-white font-mono text-lg">
                                  {formatBytes(
                                    Math.round(
                                      framesData.reduce(
                                        (sum, f) => sum + (f.pkt_size ?? 0),
                                        0
                                      ) / framesData.length
                                    )
                                  )}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </>
            )}
          </TabsContent>
          {/* Codec Tab */}
          <TabsContent value="codec" className="space-y-6">
            {loading && !probeData ? (
              <CodecSkeleton />
            ) : !probeData ? (
              <Card className="bg-linear-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-300 mb-4">No codec data available</p>
                  <Button
                    onClick={() => handleAnalyze(false)}
                    disabled={analyzing}
                    className="bg-linear-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Analyze Codecs
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {probeData.streams
                  ?.filter((s: FfprobeStream) => s.codec_type === 'video')
                  .map((stream: FfprobeStream, idx: number) => (
                    <Card
                      key={idx}
                      className="bg-white/10 backdrop-blur-lg border-white/20"
                    >
                      <CardHeader>
                        <CardTitle className="text-white">
                          Video Codec: {stream.codec_name?.toUpperCase()}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Codec</p>
                            <p className="text-white font-mono">
                              {stream.codec_name ?? 'Unknown'}
                            </p>
                          </div>
                          {stream.profile && (
                            <div>
                              <p className="text-sm text-gray-400 mb-1">
                                Profile
                              </p>
                              <p className="text-white font-mono">
                                {stream.profile}
                              </p>
                            </div>
                          )}
                          {stream.level && (
                            <div>
                              <p className="text-sm text-gray-400 mb-1">
                                Level
                              </p>
                              <p className="text-white font-mono">
                                {stream.level}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                {probeData.streams
                  ?.filter((s: FfprobeStream) => s.codec_type === 'audio')
                  .map((stream: FfprobeStream, idx: number) => (
                    <Card
                      key={idx}
                      className="bg-white/10 backdrop-blur-lg border-white/20"
                    >
                      <CardHeader>
                        <CardTitle className="text-white">
                          Audio Codec: {stream.codec_name?.toUpperCase()}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Codec</p>
                            <p className="text-white font-mono">
                              {stream.codec_name ?? 'Unknown'}
                            </p>
                          </div>
                          {stream.sample_rate && (
                            <div>
                              <p className="text-sm text-gray-400 mb-1">
                                Sample Rate
                              </p>
                              <p className="text-white font-mono">
                                {stream.sample_rate} Hz
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </>
            )}
          </TabsContent>
          {/* Packets Tab - Phase 4 Implementation */};
          <TabsContent value="packets" className="space-y-6">
            {loadingPackets ? (
              <PacketsSkeleton />
            ) : packetsData.length === 0 ? (
              <Card className="bg-linear-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-300 mb-4">Packet data not loaded</p>
                  <Button
                    onClick={loadPackets}
                    disabled={loadingPackets}
                    className="bg-linear-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
                  >
                    {loadingPackets ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading Packets...
                      </>
                    ) : (
                      <>
                        <Package className="mr-2 h-4 w-4" />
                        Load Packet Data
                      </>
                    )}
                  </Button>
                  <p className="text-gray-400 text-xs mt-2">
                    This may take a while for large files
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Packet Statistics */}
                <Card className="bg-linear-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Packet Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">
                          Total Packets
                        </p>
                        <p className="text-white font-mono text-2xl">
                          {packetsData.length}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Total Size</p>
                        <p className="text-white font-mono text-lg">
                          {formatBytes(
                            packetsData.reduce(
                              (sum, p) => sum + (parseInt(String(p.size)) ?? 0),
                              0
                            )
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Avg Size</p>
                        <p className="text-white font-mono text-lg">
                          {formatBytes(
                            Math.round(
                              packetsData.reduce(
                                (sum, p) =>
                                  sum + (parseInt(String(p.size)) ?? 0),
                                0
                              ) / packetsData.length
                            )
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Streams</p>
                        <p className="text-white font-mono text-lg">
                          {
                            new Set(
                              packetsData.map((p: PacketData) => p.stream_index)
                            ).size
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Packet Filters */}
                <Card className="bg-linear-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Filters
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">
                          Stream
                        </label>
                        <select
                          value={packetFilterStream}
                          onChange={(e) => {
                            setPacketFilterStream(e.target.value);
                            setPacketPage(0);
                          }}
                          className="w-full bg-white/10 backdrop-blur-lg border border-white/20 text-white rounded px-3 py-2"
                        >
                          <option value="all">All Streams</option>
                          {probeData?.streams?.map((s: FfprobeStream) => (
                            <option key={s.index} value={s.index}>
                              Stream #{s.index} - {s.codec_type?.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">
                          Min Size (bytes)
                        </label>
                        <Input
                          type="number"
                          placeholder="Min size..."
                          value={packetFilterMinSize}
                          onChange={(e) => {
                            setPacketFilterMinSize(e.target.value);
                            setPacketPage(0);
                          }}
                          className="bg-white/10 backdrop-blur-lg border-white/20 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">
                          Max Size (bytes)
                        </label>
                        <Input
                          type="number"
                          placeholder="Max size..."
                          value={packetFilterMaxSize}
                          onChange={(e) => {
                            setPacketFilterMaxSize(e.target.value);
                            setPacketPage(0);
                          }}
                          className="bg-white/10 backdrop-blur-lg border-white/20 text-white"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Filtered Packets List */}
                {(() => {
                  let filteredPackets = packetsData;

                  if (packetFilterStream !== 'all') {
                    filteredPackets = filteredPackets.filter(
                      (p: PacketData) =>
                        p.stream_index === parseInt(packetFilterStream)
                    );
                  }

                  if (packetFilterMinSize) {
                    const minSize = parseInt(packetFilterMinSize);
                    if (!isNaN(minSize)) {
                      filteredPackets = filteredPackets.filter(
                        (p: PacketData) =>
                          (parseInt(String(p.size)) ?? 0) >= minSize
                      );
                    }
                  }

                  if (packetFilterMaxSize) {
                    const maxSize = parseInt(packetFilterMaxSize);
                    if (!isNaN(maxSize)) {
                      filteredPackets = filteredPackets.filter(
                        (p: PacketData) =>
                          (parseInt(String(p.size)) ?? 0) <= maxSize
                      );
                    }
                  }

                  const totalPages = Math.ceil(
                    filteredPackets.length / packetsPerPage
                  );
                  const paginatedPackets = filteredPackets.slice(
                    packetPage * packetsPerPage,
                    (packetPage + 1) * packetsPerPage
                  );

                  return (
                    <>
                      <Card className="bg-linear-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-white flex items-center gap-2">
                              <Package className="h-5 w-5" />
                              Packets ({filteredPackets.length})
                            </CardTitle>
                            <div className="text-sm text-gray-400">
                              Page {packetPage + 1} of {totalPages}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 max-h-[600px] overflow-y-auto">
                            {paginatedPackets.map(
                              (packet: PacketData, index: number) => (
                                <Card
                                  key={index}
                                  className="bg-white/5 backdrop-blur-lg border-white/10"
                                >
                                  <CardContent className="p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                      <div>
                                        <p className="text-xs text-gray-500 mb-1">
                                          Packet #
                                          {packetPage * packetsPerPage +
                                            index +
                                            1}
                                        </p>
                                        <p className="text-white font-mono text-sm">
                                          Stream: {packet.stream_index ?? 'N/A'}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500 mb-1">
                                          Size
                                        </p>
                                        <p className="text-white font-mono">
                                          {packet.size ?? 'N/A'} bytes
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500 mb-1">
                                          PTS
                                        </p>
                                        <p className="text-white font-mono text-sm">
                                          {packet.pts ?? 'N/A'}
                                          {packet.pts_time && (
                                            <span className="text-gray-500 ml-1">
                                              ({formatDuration(packet.pts_time)}
                                              )
                                            </span>
                                          )}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500 mb-1">
                                          Duration
                                        </p>
                                        <p className="text-white font-mono text-sm">
                                          {packet.duration ?? 'N/A'}
                                          {packet.duration_time && (
                                            <span className="text-gray-500 ml-1">
                                              (
                                              {formatDuration(
                                                packet.duration_time
                                              )}
                                              )
                                            </span>
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                    {packet.flags && (
                                      <div className="mt-2 pt-2 border-t border-white/10">
                                        <p className="text-xs text-gray-500 mb-1">
                                          Flags
                                        </p>
                                        <p className="text-white font-mono text-xs">
                                          {packet.flags}
                                        </p>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              )
                            )}
                          </div>

                          {/* Pagination */}
                          {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                              <Button
                                onClick={() =>
                                  setPacketPage(Math.max(0, packetPage - 1))
                                }
                                disabled={packetPage === 0}
                                variant="outline"
                                className="text-white border-white/20"
                              >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                              </Button>
                              <span className="text-gray-400 text-sm">
                                Showing {packetPage * packetsPerPage + 1} -{' '}
                                {Math.min(
                                  (packetPage + 1) * packetsPerPage,
                                  filteredPackets.length
                                )}{' '}
                                of {filteredPackets.length}
                              </span>
                              <Button
                                onClick={() =>
                                  setPacketPage(
                                    Math.min(totalPages - 1, packetPage + 1)
                                  )
                                }
                                disabled={packetPage >= totalPages - 1}
                                variant="outline"
                                className="text-white border-white/20"
                              >
                                Next
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </>
                  );
                })()}
              </>
            )}
          </TabsContent>
          {/* Bitstream Tab */};
          <TabsContent value="bitstream" className="space-y-6">
            {loadingBitstream ? (
              <BitstreamSkeleton />
            ) : !videoStream ? (
              <Card className="bg-linear-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-300 mb-4">No video stream found</p>
                  <p className="text-gray-400 text-sm">
                    Bitstream analysis is only available for video files
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Codec Info Card */}
                <Card className="bg-linear-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Bitstream Analysis
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Codec:{' '}
                      {videoStream.codec_name?.toUpperCase() ?? 'Unknown'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {['h264', 'hevc', 'h265'].includes(
                        (videoStream.codec_name ?? '').toLowerCase()
                      ) ? (
                        <div className="bg-green-500/20 border border-green-500/50 rounded p-4">
                          <p className="text-green-400 font-semibold mb-2">
                            NAL Unit Analysis Supported
                          </p>
                          <p className="text-gray-300 text-sm">
                            This codec supports NAL unit parsing, parameter set
                            extraction (SPS/PPS/VPS), and slice header analysis.
                          </p>
                        </div>
                      ) : (
                        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded p-4">
                          <p className="text-yellow-400 font-semibold mb-2">
                            Limited Bitstream Support
                          </p>
                          <p className="text-gray-300 text-sm">
                            Advanced bitstream parsing (NAL units, parameter
                            sets) is optimized for H.264/H.265 codecs. Basic hex
                            viewer and bitstream extraction are available for
                            all codecs.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Bitstream Viewer */}
                {loadingBitstream ? (
                  <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                    <CardContent className="p-12 text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-orange-400 mx-auto mb-4" />
                      <p className="text-gray-300">Loading bitstream data...</p>
                    </CardContent>
                  </Card>
                ) : bitstreamError ? (
                  <Card className="bg-red-500/20 backdrop-blur-lg border-red-500/30">
                    <CardContent className="p-6">
                      <Alert className="bg-transparent border-0">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle className="text-white">Error</AlertTitle>
                        <AlertDescription className="text-gray-300">
                          {bitstreamError}
                        </AlertDescription>
                      </Alert>
                      <Button
                        onClick={() => {
                          setBitstreamAttempted(false);
                          setBitstreamError(null);
                          void loadBitstream();
                        }}
                        className="mt-4 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                      >
                        Retry
                      </Button>
                    </CardContent>
                  </Card>
                ) : bitstreamData ? (
                  <>
                    {/* Chunked file warning */}
                    {bitstreamData.isChunked && (
                      <Card className="bg-blue-500/20 backdrop-blur-lg border-blue-500/30">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-blue-400 font-semibold mb-1">
                                Large File - Chunked Loading
                              </p>
                              <p className="text-gray-300 text-sm">
                                This file is very large (
                                {Math.round(
                                  ((bitstreamData.totalSize ?? 0) /
                                    1024 /
                                    1024) *
                                    10
                                ) / 10}
                                MB). Only the first chunk is loaded. Use the
                                controls below to navigate through the
                                bitstream.
                              </p>
                              {bitstreamData.currentChunk && (
                                <p className="text-gray-400 text-xs mt-2">
                                  Current chunk:{' '}
                                  {bitstreamData.currentChunk.start} -{' '}
                                  {bitstreamData.currentChunk.end ?? 'end'}{' '}
                                  bytes
                                </p>
                              )}
                            </div>
                            <Button
                              onClick={async () => {
                                if (!bitstreamData.currentChunk) return;
                                const chunkSize =
                                  (bitstreamData.currentChunk.end ?? 0) -
                                  bitstreamData.currentChunk.start;
                                const nextStart =
                                  bitstreamData.currentChunk.end ?? 0;
                                const nextEnd = Math.min(
                                  nextStart + chunkSize,
                                  bitstreamData.totalSize ?? Infinity
                                );

                                setLoadingBitstream(true);
                                try {
                                  const response = await fetch(
                                    '/api/what-the-ffmpeg/bitstream',
                                    {
                                      method: 'POST',
                                      headers: {
                                        'Content-Type': 'application/json',
                                      },
                                      body: JSON.stringify({
                                        fileId,
                                        streamIndex: 0,
                                        format: 'hex',
                                        codecSpecific: false,
                                        byteRange: {
                                          start: nextStart,
                                          end: nextEnd,
                                        },
                                      }),
                                    }
                                  );

                                  if (response.ok) {
                                    const result = await response.json();
                                    if (result.success && result.bitstream) {
                                      // Append chunk to existing data
                                      setBitstreamData({
                                        ...bitstreamData,
                                        bitstream:
                                          (bitstreamData.bitstream ?? '') +
                                          result.bitstream,
                                        currentChunk: {
                                          start: nextStart,
                                          end: nextEnd,
                                        },
                                      });
                                    }
                                  }
                                } catch (err) {
                                  console.error('Failed to load chunk:', err);
                                } finally {
                                  setLoadingBitstream(false);
                                }
                              }}
                              variant="outline"
                              size="sm"
                              className="text-white border-white/20 hover:bg-white/10"
                              disabled={
                                loadingBitstream ||
                                !bitstreamData.currentChunk ||
                                (bitstreamData.currentChunk.end ?? 0) >=
                                  (bitstreamData.totalSize ?? 0)
                              }
                            >
                              Load Next Chunk
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <Tabs
                      value={bitstreamTab}
                      onValueChange={setBitstreamTab}
                      className="space-y-6"
                    >
                      <TabsList className="bg-white/10 border-white/20">
                        <TabsTrigger
                          value="hex"
                          className="text-white data-[state=active]:bg-white/20"
                        >
                          <FileCode className="h-4 w-4 mr-2" />
                          Hex Dump
                        </TabsTrigger>
                        <TabsTrigger
                          value="binary"
                          className="text-white data-[state=active]:bg-white/20"
                        >
                          <Binary className="h-4 w-4 mr-2" />
                          Binary
                        </TabsTrigger>
                        {['h264', 'hevc', 'h265'].includes(
                          (videoStream.codec_name ?? '').toLowerCase()
                        ) &&
                          bitstreamData.nalUnits && (
                            <>
                              <TabsTrigger
                                value="tree"
                                className="text-white data-[state=active]:bg-white/20"
                              >
                                <Network className="h-4 w-4 mr-2" />
                                Structure Tree
                              </TabsTrigger>
                              <TabsTrigger
                                value="parameters"
                                className="text-white data-[state=active]:bg-white/20"
                              >
                                <Code className="h-4 w-4 mr-2" />
                                Parameter Sets
                              </TabsTrigger>
                              <TabsTrigger
                                value="timeline"
                                className="text-white data-[state=active]:bg-white/20"
                              >
                                <Clock className="h-4 w-4 mr-2" />
                                Timeline
                              </TabsTrigger>
                            </>
                          )}
                      </TabsList>

                      <TabsContent value="hex">
                        {bitstreamData.bitstream ? (
                          <HexViewer
                            hexData={bitstreamData.bitstream}
                            nalUnits={bitstreamData.nalUnits}
                            onOffsetClick={handleOffsetClick}
                          />
                        ) : (
                          <Card className="bg-yellow-500/20 backdrop-blur-lg border-yellow-500/30">
                            <CardContent className="p-6 text-center">
                              <p className="text-yellow-400 font-semibold mb-2">
                                Bitstream Too Large
                              </p>
                              <p className="text-gray-300 text-sm mb-4">
                                {bitstreamData.message ??
                                  'This file is too large to load entirely. Use chunked loading to view specific ranges.'}
                              </p>
                              {bitstreamData.statistics?.totalSize && (
                                <p className="text-gray-400 text-xs">
                                  Total size:{' '}
                                  {Math.round(
                                    (bitstreamData.statistics.totalSize /
                                      1024 /
                                      1024) *
                                      10
                                  ) / 10}
                                  MB
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        )}
                      </TabsContent>

                      <TabsContent value="binary">
                        {bitstreamData.bitstream ? (
                          <BinaryVisualizer
                            hexData={bitstreamData.bitstream}
                            nalUnits={bitstreamData.nalUnits}
                            onOffsetClick={handleOffsetClick}
                          />
                        ) : (
                          <Card className="bg-yellow-500/20 backdrop-blur-lg border-yellow-500/30">
                            <CardContent className="p-6 text-center">
                              <p className="text-yellow-400 font-semibold mb-2">
                                Bitstream Too Large
                              </p>
                              <p className="text-gray-300 text-sm mb-4">
                                {bitstreamData.message ??
                                  'This file is too large to load entirely. Use chunked loading to view specific ranges.'}
                              </p>
                              {bitstreamData.statistics?.totalSize && (
                                <p className="text-gray-400 text-xs">
                                  Total size:{' '}
                                  {Math.round(
                                    (bitstreamData.statistics.totalSize /
                                      1024 /
                                      1024) *
                                      10
                                  ) / 10}
                                  MB
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        )}
                      </TabsContent>

                      {['h264', 'hevc', 'h265'].includes(
                        (videoStream.codec_name ?? '').toLowerCase()
                      ) &&
                        bitstreamData.nalUnits && (
                          <>
                            <TabsContent value="tree">
                              <StructureTree
                                nalUnits={bitstreamData.nalUnits}
                                parameterSets={bitstreamData.parameterSets}
                                onNALClick={handleOffsetClick}
                              />
                            </TabsContent>

                            <TabsContent value="parameters">
                              <ParameterSetViewer
                                parameterSets={bitstreamData.parameterSets}
                                codec={
                                  videoStream.codec_name?.toLowerCase() ===
                                  'h264'
                                    ? 'h264'
                                    : videoStream.codec_name?.toLowerCase() ===
                                          'h265' ||
                                        videoStream.codec_name?.toLowerCase() ===
                                          'hevc'
                                      ? 'h265'
                                      : undefined
                                }
                                onOffsetClick={handleOffsetClick}
                              />
                            </TabsContent>

                            <TabsContent value="timeline">
                              <NALTimeline
                                nalUnits={bitstreamData.nalUnits}
                                onNALClick={handleOffsetClick}
                              />
                            </TabsContent>
                          </>
                        )}
                    </Tabs>
                  </>
                ) : (
                  <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                    <CardContent className="p-6 text-center">
                      <p className="text-gray-300 mb-4">
                        Bitstream data not loaded
                      </p>
                      <Button
                        onClick={() => {
                          setBitstreamAttempted(false);
                          setBitstreamError(null);
                          void loadBitstream();
                        }}
                        className="bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                      >
                        Load Bitstream
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Statistics */}
                {bitstreamData?.statistics && (
                  <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white">Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-400 mb-1">
                            Total Size
                          </p>
                          <p className="text-white font-mono text-lg">
                            {bitstreamData.statistics.totalSize.toLocaleString()}{' '}
                            bytes
                          </p>
                        </div>
                        {bitstreamData.statistics.nalUnitCount > 0 && (
                          <div>
                            <p className="text-sm text-gray-400 mb-1">
                              NAL Units
                            </p>
                            <p className="text-white font-mono text-lg">
                              {bitstreamData.statistics.nalUnitCount}
                            </p>
                          </div>
                        )}
                        {bitstreamData.codec && (
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Codec</p>
                            <p className="text-white font-mono text-lg">
                              {bitstreamData.codec.toUpperCase()}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Format</p>
                          <p className="text-white font-mono text-lg">
                            {bitstreamData.format.toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>;
      </div>
    </div>
  );
}

export default function FileAnalysisPageWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <FileAnalysisPage />
    </ErrorBoundary>
  );
}
