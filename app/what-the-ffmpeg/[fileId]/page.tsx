'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
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
  FileDown
} from 'lucide-react';
import Link from 'next/link';

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

interface ProbeData {
  format?: any;
  streams?: any[];
  frames?: any[];
  packets?: any[];
}

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
  [key: string]: any; // Allow other FFProbe fields
}

export default function FileAnalysisPage() {
  const params = useParams();
  const fileId = params.fileId as string;
  const [activeTab, setActiveTab] = React.useState('overview');

  const [fileMetadata, setFileMetadata] = React.useState<FileMetadata | null>(null);
  const [probeData, setProbeData] = React.useState<ProbeData | null>(null);
  const [framesData, setFramesData] = React.useState<FrameData[]>([]);
  const [packetsData, setPacketsData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [loadingFrames, setLoadingFrames] = React.useState(false);
  const [loadingPackets, setLoadingPackets] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  // Frame navigation state
  const [currentFrameIndex, setCurrentFrameIndex] = React.useState(0);
  const [frameJumpValue, setFrameJumpValue] = React.useState('');
  const [framePreviewUrl, setFramePreviewUrl] = React.useState<string | null>(null);
  const [loadingFramePreview, setLoadingFramePreview] = React.useState(false);
  const [framePreviewError, setFramePreviewError] = React.useState(false);
  
  // Packet filtering state
  const [packetFilterStream, setPacketFilterStream] = React.useState<string>('all');
  const [packetFilterMinSize, setPacketFilterMinSize] = React.useState<string>('');
  const [packetFilterMaxSize, setPacketFilterMaxSize] = React.useState<string>('');
  const [packetPage, setPacketPage] = React.useState(0);
  const packetsPerPage = 50;
  const timelineRef = React.useRef<HTMLDivElement>(null);

  // Compute derived values
  const currentFrame = framesData[currentFrameIndex];
  const videoStream = probeData?.streams?.find((s: any) => s.codec_type === 'video');

  // Scroll timeline to show current frame when it changes
  React.useEffect(() => {
    if (timelineRef.current && framesData.length > 0 && currentFrameIndex >= 0) {
      const frameWidth = timelineRef.current.scrollWidth / framesData.length;
      const scrollPosition = (currentFrameIndex * frameWidth) - (timelineRef.current.clientWidth / 2) + (frameWidth / 2);
      timelineRef.current.scrollTo({
        left: Math.max(0, scrollPosition),
        behavior: 'smooth'
      });
    }
  }, [currentFrameIndex, framesData.length]);

  React.useEffect(() => {
    loadFileData();
  }, [fileId]);

  // Load frame preview when frame changes
  React.useEffect(() => {
    if (currentFrame && fileId && videoStream) {
      loadFramePreview();
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
          time: currentFrame.pkt_pts_time || currentFrame.pts_time,
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

      // Load file metadata
      const metadataResponse = await fetch(`/api/what-the-ffmpeg/${fileId}/metadata`);
      if (!metadataResponse.ok) {
        throw new Error('Failed to load file metadata');
      }
      const metadata = await metadataResponse.json();
      setFileMetadata(metadata);

      // Load probe data if available
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
        throw new Error(result.error || 'Analysis failed');
      }
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
      }
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
          setError('No packet data available. The file may not contain packet information, or packet analysis may not be supported for this format.');
        }
        setProbeData(result.data);
        setPacketPage(0); // Reset to first page
      } else {
        throw new Error(result.error || 'Failed to load packets');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load packets');
    } finally {
      setLoadingPackets(false);
    }
  };

  const getFileIcon = (type?: string) => {
    if (!type) return <FileVideo className="h-8 w-8 text-gray-400" />;
    if (type.startsWith('video/')) return <FileVideo className="h-8 w-8 text-orange-400" />;
    if (type.startsWith('audio/')) return <FileAudio className="h-8 w-8 text-blue-400" />;
    if (type.startsWith('image/')) return <ImageIcon className="h-8 w-8 text-green-400" />;
    return <FileVideo className="h-8 w-8 text-gray-400" />;
  };

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-400 mx-auto mb-4" />
          <p className="text-gray-300">Loading file data...</p>
        </div>
      </div>
    );
  }

  if (error && !fileMetadata) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Alert className="bg-red-500/20 border-red-500/50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
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
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-orange-900 to-yellow-900 animate-gradient -z-10" />
      <div className="fixed inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-0">
        {/* Header */}
        <div className="mb-8">
          <Link href="/what-the-ffmpeg">
            <Button variant="ghost" className="text-white hover:bg-white/20 mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Upload
            </Button>
          </Link>
          <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {fileMetadata && getFileIcon(fileMetadata.fileType || fileMetadata.type)}
            <div>
              <h1 className="text-3xl font-bold text-white">
                {fileMetadata?.filename || 'File Analysis'}
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                {fileMetadata && formatBytes(fileMetadata.size)}
                {probeData?.format?.duration && ` • ${formatDuration(parseFloat(probeData.format.duration))}`}
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
                  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
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
        </div>

        {/* Error Display */}
        {error && (
          <Alert className="bg-red-500/20 border-red-500/50 mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30 mb-6">
            <TabsTrigger value="overview" className="data-[state=active]:bg-yellow-600/30 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="streams" className="data-[state=active]:bg-yellow-600/30 data-[state=active]:text-white">
              <Film className="h-4 w-4 mr-2" />
              Streams
            </TabsTrigger>
            <TabsTrigger value="frames" className="data-[state=active]:bg-yellow-600/30 data-[state=active]:text-white">
              <Film className="h-4 w-4 mr-2" />
              Frames & Timeline
            </TabsTrigger>
            <TabsTrigger value="codec" className="data-[state=active]:bg-yellow-600/30 data-[state=active]:text-white">
              <Settings className="h-4 w-4 mr-2" />
              Codec
            </TabsTrigger>
            <TabsTrigger value="packets" className="data-[state=active]:bg-yellow-600/30 data-[state=active]:text-white">
              <Package className="h-4 w-4 mr-2" />
              Packets
            </TabsTrigger>
            <TabsTrigger value="bitstream" className="data-[state=active]:bg-yellow-600/30 data-[state=active]:text-white">
              <Code className="h-4 w-4 mr-2" />
              Bitstream
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {!probeData ? (
              <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-300 mb-4">No analysis data available yet</p>
                  <Button
                    onClick={() => handleAnalyze(false)}
                    disabled={analyzing}
                    className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
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
                <p className="text-sm text-gray-400 mb-1">Format</p>
                <p className="text-white font-mono text-lg">
                  {probeData.format?.format_name || 'Unknown'}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-4">
                <p className="text-sm text-gray-400 mb-1">Streams</p>
                <p className="text-white font-mono text-lg">
                  {probeData.streams?.length || 0}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-4">
                <p className="text-sm text-gray-400 mb-1">Bitrate</p>
                <p className="text-white font-mono text-lg">
                  {probeData.format?.bit_rate 
                    ? `${(parseInt(probeData.format.bit_rate) / 1000000).toFixed(2)} Mbps`
                    : 'Unknown'}
                </p>
              </CardContent>
            </Card>
          </div>

                {/* Format Information */}
                {probeData.format && (
                  <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Code className="h-5 w-5" />
                        Format Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Format Name</p>
                          <p className="text-white font-mono text-lg">
                            {probeData.format.format_name || 'Unknown'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Format Long Name</p>
                          <p className="text-white font-mono">
                            {probeData.format.format_long_name || 'Unknown'}
                          </p>
                        </div>
                        {probeData.format.duration && (
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Duration</p>
                            <p className="text-white font-mono text-lg">
                              {formatDuration(parseFloat(probeData.format.duration))}
                            </p>
          </div>
                        )}
                        {probeData.format.size && (
                          <div>
                            <p className="text-sm text-gray-400 mb-1">File Size</p>
                            <p className="text-white font-mono">
                              {formatBytes(parseInt(probeData.format.size))}
                            </p>
                          </div>
                        )}
                        {probeData.format.bit_rate && (
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Bitrate</p>
                            <p className="text-white font-mono text-lg">
                              {(parseInt(probeData.format.bit_rate) / 1000000).toFixed(2)} Mbps
                            </p>
                          </div>
                        )}
                        {probeData.format.nb_streams && (
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Number of Streams</p>
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
                  <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
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
                        {probeData.streams.slice(0, 3).map((stream: any, index: number) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-white/5 backdrop-blur-lg rounded border border-white/10">
                            {getStreamTypeIcon(stream.codec_type)}
                            <span className="text-white text-sm">
                              Stream #{stream.index} - {stream.codec_type?.toUpperCase()} - {stream.codec_name || 'Unknown'}
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
            {!probeData ? (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6 text-center">
                  <p className="text-gray-300 mb-4">No stream data available</p>
              <Button
                    onClick={() => handleAnalyze(false)}
                disabled={analyzing}
                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
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
                      {probeData.streams.length} stream{probeData.streams.length !== 1 ? 's' : ''} found
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-400">
                          {probeData.streams.filter((s: any) => s.codec_type === 'video').length}
                        </p>
                        <p className="text-sm text-gray-400">Video</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-400">
                          {probeData.streams.filter((s: any) => s.codec_type === 'audio').length}
                        </p>
                        <p className="text-sm text-gray-400">Audio</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-400">
                          {probeData.streams.filter((s: any) => s.codec_type === 'subtitle').length}
                        </p>
                        <p className="text-sm text-gray-400">Subtitle</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-400">
                          {probeData.streams.filter((s: any) => !['video', 'audio', 'subtitle'].includes(s.codec_type)).length}
                        </p>
                        <p className="text-sm text-gray-400">Other</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Individual Streams - Enhanced Phase 2 */}
                {probeData.streams.map((stream: any, index: number) => (
                  <Card key={index} className={`bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border border-yellow-500/30 ${getStreamTypeColor(stream.codec_type || 'unknown')}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStreamTypeIcon(stream.codec_type)}
                          <div>
                            <CardTitle className="text-white text-xl">
                              Stream #{stream.index} - {stream.codec_type?.toUpperCase() || 'UNKNOWN'}
                            </CardTitle>
                            <CardDescription className="text-gray-300">
                              {stream.codec_long_name || stream.codec_name || 'Unknown codec'}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
            </CardHeader>
            <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Codec Information */}
                        <div className="space-y-3">
                          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Codec</h3>
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Codec Name</p>
                              <p className="text-white font-mono text-lg">{stream.codec_name || 'Unknown'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Codec Long Name</p>
                              <p className="text-white font-mono text-sm">{stream.codec_long_name || 'Unknown'}</p>
                            </div>
                            {stream.codec_tag_string && (
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Codec Tag</p>
                                <p className="text-white font-mono">{stream.codec_tag_string}</p>
                              </div>
                            )}
                            {stream.profile && (
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Profile</p>
                                <p className="text-white font-mono">{stream.profile}</p>
                              </div>
                            )}
                            {stream.level && (
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Level</p>
                                <p className="text-white font-mono">{stream.level}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Video-specific properties */}
                        {stream.codec_type === 'video' && (
                          <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Video Properties</h3>
                            <div className="space-y-2">
                              {stream.width && stream.height && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Resolution</p>
                                  <p className="text-white font-mono text-lg">
                                    {stream.width} × {stream.height}
                                  </p>
                                </div>
                              )}
                              {stream.r_frame_rate && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Frame Rate</p>
                                  <p className="text-white font-mono">{stream.r_frame_rate}</p>
                                </div>
                              )}
                              {stream.pix_fmt && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Pixel Format</p>
                                  <p className="text-white font-mono">{stream.pix_fmt}</p>
                                </div>
                              )}
                              {stream.display_aspect_ratio && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Aspect Ratio</p>
                                  <p className="text-white font-mono">{stream.display_aspect_ratio}</p>
                                </div>
                              )}
                              {stream.color_space && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Color Space</p>
                                  <p className="text-white font-mono">{stream.color_space}</p>
                                </div>
                              )}
                              {stream.color_range && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Color Range</p>
                                  <p className="text-white font-mono">{stream.color_range}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Audio-specific properties */}
                        {stream.codec_type === 'audio' && (
                          <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Audio Properties</h3>
                            <div className="space-y-2">
                              {stream.sample_rate && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Sample Rate</p>
                                  <p className="text-white font-mono text-lg">{stream.sample_rate} Hz</p>
                                </div>
                              )}
                              {stream.channels && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Channels</p>
                                  <p className="text-white font-mono text-lg">{stream.channels}</p>
                                </div>
                              )}
                              {stream.channel_layout && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Channel Layout</p>
                                  <p className="text-white font-mono">{stream.channel_layout}</p>
                                </div>
                              )}
                              {stream.sample_fmt && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Sample Format</p>
                                  <p className="text-white font-mono">{stream.sample_fmt}</p>
                                </div>
                              )}
                              {stream.bits_per_sample && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Bits Per Sample</p>
                                  <p className="text-white font-mono">{stream.bits_per_sample}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Common properties */}
                        <div className="space-y-3">
                          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Properties</h3>
                          <div className="space-y-2">
                            {stream.bit_rate && (
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Bitrate</p>
                                <p className="text-white font-mono">
                                  {(parseInt(stream.bit_rate) / 1000).toFixed(0)} kbps
                                </p>
                              </div>
                            )}
                            {stream.duration && (
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Duration</p>
                                <p className="text-white font-mono">{formatDuration(parseFloat(stream.duration))}</p>
                              </div>
                            )}
                            {stream.start_time && (
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Start Time</p>
                                <p className="text-white font-mono">{parseFloat(stream.start_time).toFixed(3)}s</p>
                              </div>
                            )}
                            {stream.nb_frames && (
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Frame Count</p>
                                <p className="text-white font-mono">{stream.nb_frames}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : (
              <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-300">No streams found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Frames Tab - Phase 3 Implementation */}
          <TabsContent value="frames" className="space-y-6">
            {!videoStream ? (
              <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-300 mb-4">No video stream found</p>
                  <p className="text-gray-400 text-sm">Frame analysis is only available for video files</p>
                </CardContent>
              </Card>
            ) : framesData.length === 0 ? (
              <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-300 mb-4">Frame data not loaded</p>
                  <Button
                    onClick={loadFrames}
                    disabled={loadingFrames}
                    className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
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
                  <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          Frame Timeline
                        </CardTitle>
                        <CardDescription className="text-gray-300">
                          {framesData.length} frames • Click any frame to jump to it
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div 
                        ref={timelineRef}
                        className="relative bg-white/5 backdrop-blur-lg rounded border border-white/10 overflow-x-auto"
                      >
                        <div className="relative h-20 min-w-full" style={{ width: `${Math.max(framesData.length * 4, 100)}px` }}>
                          {framesData.map((frame: any, idx: number) => {
                            const duration = parseFloat(probeData?.format?.duration || '0');
                            const frameTime = parseFloat(frame.pkt_pts_time || frame.pts_time || '0');
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
                                title={`Frame ${idx + 1}: ${frame.pict_type || '?'} at ${frameTime.toFixed(3)}s - Click to jump`}
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
                            <span>{probeData?.format?.duration ? formatDuration(parseFloat(probeData.format.duration)) : '0:00'}</span>
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
                          Scroll horizontally to see all {framesData.length} frames
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Frame Navigation */}
          <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
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
                        onClick={() => setCurrentFrameIndex(Math.max(0, currentFrameIndex - 1))}
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
                        onClick={() => setCurrentFrameIndex(Math.min(framesData.length - 1, currentFrameIndex + 1))}
                        disabled={currentFrameIndex === framesData.length - 1}
                        className="bg-yellow-600/80 hover:bg-yellow-600 text-white border-yellow-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <div className="ml-auto text-sm text-gray-400">
                        {videoStream.r_frame_rate && `Frame Rate: ${videoStream.r_frame_rate}`}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Current Frame Details */}
                {currentFrame && (
                  <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
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
                        <div className={`px-3 py-1 rounded border ${getFrameTypeColor(currentFrame.pict_type || '')}`}>
                          <span className="font-mono font-bold">{currentFrame.pict_type || '?'}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Frame Visualization */}
                      <div className="mb-6">
                        <div className="relative w-full bg-black/50 rounded-lg border border-white/20 overflow-hidden" style={{ aspectRatio: videoStream?.width && videoStream?.height ? `${videoStream.width}/${videoStream.height}` : '16/9' }}>
                          {loadingFramePreview ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center">
                                <Loader2 className="h-8 w-8 animate-spin text-yellow-400 mx-auto mb-2" />
                                <p className="text-gray-400 text-sm">Loading frame...</p>
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
                                <p className="text-gray-400 text-sm mb-1">Frame Preview</p>
                                <p className="text-gray-500 text-xs">
                                  {videoStream?.width && videoStream?.height 
                                    ? `${videoStream.width} × ${videoStream.height}`
                                    : 'Preview unavailable'}
                                </p>
                                {currentFrame.pict_type && (
                                  <div className={`mt-3 inline-block px-3 py-1 rounded border ${getFrameTypeColor(currentFrame.pict_type)}`}>
                                    <span className="font-mono text-sm font-bold">{currentFrame.pict_type}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        {framePreviewUrl && (
                          <p className="text-xs text-gray-500 mt-2 text-center">
                            Frame at {currentFrame.pkt_pts_time !== undefined ? parseFloat(currentFrame.pkt_pts_time).toFixed(3) : 'N/A'}s
                          </p>
                        )}
                      </div>

                      {/* Frame Metadata */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Frame Type</p>
                          <p className="text-white font-mono text-lg">{currentFrame.pict_type || 'Unknown'}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {currentFrame.key_frame === 1 ? 'Keyframe' : 'Non-keyframe'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">PTS</p>
                          <p className="text-white font-mono">{currentFrame.pkt_pts || 'N/A'}</p>
                          {currentFrame.pkt_pts_time !== undefined && (
                            <p className="text-xs text-gray-500 mt-1">
                              {parseFloat(currentFrame.pkt_pts_time).toFixed(3)}s
                            </p>
                          )}
                        </div>
                        {currentFrame.pkt_dts !== undefined && (
                          <div>
                            <p className="text-sm text-gray-400 mb-1">DTS</p>
                            <p className="text-white font-mono">{currentFrame.pkt_dts}</p>
                            {currentFrame.pkt_dts_time !== undefined && (
                              <p className="text-xs text-gray-500 mt-1">
                                {parseFloat(currentFrame.pkt_dts_time).toFixed(3)}s
                              </p>
                            )}
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Packet Size</p>
                          <p className="text-white font-mono">{currentFrame.pkt_size || 'N/A'} bytes</p>
                        </div>
                        {currentFrame.pkt_duration_time !== undefined && (
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Duration</p>
                            <p className="text-white font-mono">
                              {parseFloat(currentFrame.pkt_duration_time).toFixed(3)}s
                            </p>
                          </div>
                        )}
                        {currentFrame.stream_index !== undefined && (
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Stream Index</p>
                            <p className="text-white font-mono">{currentFrame.stream_index}</p>
                          </div>
                        )}
                        {currentFrame.media_type && (
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Media Type</p>
                            <p className="text-white font-mono">{currentFrame.media_type}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Frame Statistics */}
                <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Frame Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Total Frames</p>
                        <p className="text-white font-mono text-2xl">{framesData.length}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">I-Frames</p>
                        <p className="text-white font-mono text-2xl text-green-400">
                          {framesData.filter(f => f.pict_type === 'I').length}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">P-Frames</p>
                        <p className="text-white font-mono text-2xl text-blue-400">
                          {framesData.filter(f => f.pict_type === 'P').length}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">B-Frames</p>
                        <p className="text-white font-mono text-2xl text-orange-400">
                          {framesData.filter(f => f.pict_type === 'B').length}
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
                      <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center gap-2">
                            <Film className="h-5 w-5" />
                            Stream Timeline
                          </CardTitle>
                          <CardDescription className="text-gray-300">
                            {probeData.streams.length} stream{probeData.streams.length !== 1 ? 's' : ''}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {probeData.streams.map((stream: any, idx: number) => {
                              const duration = parseFloat(probeData.format.duration);
                              const streamDuration = stream.duration ? parseFloat(stream.duration) : duration;
                              const startTime = stream.start_time ? parseFloat(stream.start_time) : 0;
                              const leftPercent = (startTime / duration) * 100;
                              const widthPercent = (streamDuration / duration) * 100;
                              
                              return (
                                <div key={idx} className="relative">
                                  <div className="flex items-center gap-3 mb-1">
                                    {getStreamTypeIcon(stream.codec_type)}
                                    <span className="text-white text-sm">
                                      Stream #{stream.index} - {stream.codec_type?.toUpperCase()} ({stream.codec_name})
                                    </span>
                                  </div>
                                  <div className="relative h-8 bg-white/5 backdrop-blur-lg rounded border border-white/10 overflow-hidden">
                                    <div
                                      className={`absolute h-full ${getStreamTypeColor(stream.codec_type)}`}
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
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Packet Timeline */}
                    {packetsData.length > 0 && (
                      <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
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
                              {packetsData.slice(0, 500).map((packet: any, idx: number) => {
                                const duration = parseFloat(probeData.format.duration);
                                const packetTime = packet.pts_time ? parseFloat(packet.pts_time) : 0;
                                const leftPercent = (packetTime / duration) * 100;
                                const packetSize = parseInt(packet.size || '0');
                                const maxSize = Math.max(...packetsData.map((p: any) => parseInt(p.size || '0')));
                                const heightPercent = maxSize > 0 ? (packetSize / maxSize) * 100 : 0;
                                
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
                              <span>{formatDuration(parseFloat(probeData.format.duration))}</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 mt-2">
                            Height represents packet size
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Keyframe Distribution */}
                    <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Film className="h-5 w-5" />
                          Keyframe Distribution
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white/5 backdrop-blur-lg rounded p-3 border border-white/10">
                            <p className="text-xs text-gray-400 mb-1">Total Keyframes</p>
                            <p className="text-white font-mono text-xl">
                              {framesData.filter((f: any) => f.key_frame === 1).length}
                            </p>
                          </div>
                          <div className="bg-white/5 backdrop-blur-lg rounded p-3 border border-white/10">
                            <p className="text-xs text-gray-400 mb-1">Keyframe Interval</p>
                            <p className="text-white font-mono text-xl">
                              {(() => {
                                const keyframes = framesData.filter((f: any) => f.key_frame === 1);
                                if (keyframes.length < 2) return 'N/A';
                                const intervals = [];
                                for (let i = 1; i < keyframes.length; i++) {
                                  const prev = parseFloat(keyframes[i-1].pkt_pts_time || '0');
                                  const curr = parseFloat(keyframes[i].pkt_pts_time || '0');
                                  intervals.push(curr - prev);
                                }
                                const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
                                return `${avg.toFixed(2)}s`;
                              })()}
                            </p>
                          </div>
                          <div className="bg-white/5 backdrop-blur-lg rounded p-3 border border-white/10">
                            <p className="text-xs text-gray-400 mb-1">GOP Size</p>
                            <p className="text-white font-mono text-xl">
                              {(() => {
                                const keyframes = framesData.filter((f: any) => f.key_frame === 1);
                                if (keyframes.length < 2) return 'N/A';
                                return Math.round(framesData.length / keyframes.length);
                              })()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Sync Analysis */}
                    {probeData.streams && probeData.streams.length > 1 && (
                      <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
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
                            {probeData.streams.filter((s: any) => s.codec_type === 'video').map((videoStream: any, idx: number) => {
                              const audioStreams = probeData.streams.filter((s: any) => s.codec_type === 'audio');
                              return audioStreams.map((audioStream: any, audioIdx: number) => {
                                const videoStart = videoStream.start_time ? parseFloat(videoStream.start_time) : 0;
                                const audioStart = audioStream.start_time ? parseFloat(audioStream.start_time) : 0;
                                const syncOffset = audioStart - videoStart;
                                
                                return (
                                  <div key={`${idx}-${audioIdx}`} className="bg-white/5 backdrop-blur-lg rounded p-4 border border-white/10">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-white text-sm">
                                        Video Stream #{videoStream.index} ↔ Audio Stream #{audioStream.index}
                                      </span>
                                      <span className={`text-sm font-mono ${
                                        Math.abs(syncOffset) < 0.1 ? 'text-green-400' : 
                                        Math.abs(syncOffset) < 0.5 ? 'text-yellow-400' : 'text-red-400'
                                      }`}>
                                        {syncOffset > 0 ? '+' : ''}{syncOffset.toFixed(3)}s
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
                              });
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Quality Metrics */}
                    {videoStream && (
                      <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
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
                                <p className="text-xs text-gray-400 mb-1">Bitrate</p>
                                <p className="text-white font-mono text-lg">
                                  {(parseInt(videoStream.bit_rate) / 1000).toFixed(0)} kbps
                                </p>
                              </div>
                            )}
                            {videoStream.width && videoStream.height && (
                              <div className="bg-white/5 backdrop-blur-lg rounded p-3 border border-white/10">
                                <p className="text-xs text-gray-400 mb-1">Resolution</p>
                                <p className="text-white font-mono text-lg">
                                  {videoStream.width} × {videoStream.height}
                                </p>
                              </div>
                            )}
                            {videoStream.r_frame_rate && (
                              <div className="bg-white/5 backdrop-blur-lg rounded p-3 border border-white/10">
                                <p className="text-xs text-gray-400 mb-1">Frame Rate</p>
                                <p className="text-white font-mono text-lg">{videoStream.r_frame_rate}</p>
                              </div>
                            )}
                            {framesData.length > 0 && (
                              <div className="bg-white/5 backdrop-blur-lg rounded p-3 border border-white/10">
                                <p className="text-xs text-gray-400 mb-1">Avg Frame Size</p>
                                <p className="text-white font-mono text-lg">
                                  {formatBytes(Math.round(
                                    framesData.reduce((sum, f) => sum + (parseInt(f.pkt_size || '0')), 0) / framesData.length
                                  ))}
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
            {!probeData ? (
              <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-300 mb-4">No codec data available</p>
                  <Button
                    onClick={() => handleAnalyze(false)}
                    disabled={analyzing}
                    className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
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
                {probeData.streams?.filter((s: any) => s.codec_type === 'video').map((stream: any, idx: number) => (
                  <Card key={idx} className="bg-white/10 backdrop-blur-lg border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white">Video Codec: {stream.codec_name?.toUpperCase()}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Codec</p>
                          <p className="text-white font-mono">{stream.codec_name || 'Unknown'}</p>
                        </div>
                        {stream.profile && (
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Profile</p>
                            <p className="text-white font-mono">{stream.profile}</p>
                          </div>
                        )}
                        {stream.level && (
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Level</p>
                            <p className="text-white font-mono">{stream.level}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {probeData.streams?.filter((s: any) => s.codec_type === 'audio').map((stream: any, idx: number) => (
                  <Card key={idx} className="bg-white/10 backdrop-blur-lg border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white">Audio Codec: {stream.codec_name?.toUpperCase()}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Codec</p>
                          <p className="text-white font-mono">{stream.codec_name || 'Unknown'}</p>
                        </div>
                        {stream.sample_rate && (
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Sample Rate</p>
                            <p className="text-white font-mono">{stream.sample_rate} Hz</p>
                          </div>
                        )}
              </div>
            </CardContent>
          </Card>
                ))}
              </>
            )}
          </TabsContent>

          {/* Packets Tab - Phase 4 Implementation */}
          <TabsContent value="packets" className="space-y-6">
            {packetsData.length === 0 ? (
              <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-300 mb-4">Packet data not loaded</p>
                  <Button
                    onClick={loadPackets}
                    disabled={loadingPackets}
                    className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
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
                <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Packet Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Total Packets</p>
                        <p className="text-white font-mono text-2xl">{packetsData.length}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Total Size</p>
                        <p className="text-white font-mono text-lg">
                          {formatBytes(packetsData.reduce((sum, p) => sum + (parseInt(p.size) || 0), 0))}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Avg Size</p>
                        <p className="text-white font-mono text-lg">
                          {formatBytes(Math.round(packetsData.reduce((sum, p) => sum + (parseInt(p.size) || 0), 0) / packetsData.length))}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Streams</p>
                        <p className="text-white font-mono text-lg">
                          {new Set(packetsData.map((p: any) => p.stream_index)).size}
                        </p>
                      </div>
              </div>
            </CardContent>
          </Card>

                {/* Packet Filters */}
                <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Filters
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Stream</label>
                        <select
                          value={packetFilterStream}
                          onChange={(e) => {
                            setPacketFilterStream(e.target.value);
                            setPacketPage(0);
                          }}
                          className="w-full bg-white/10 backdrop-blur-lg border border-white/20 text-white rounded px-3 py-2"
                        >
                          <option value="all">All Streams</option>
                          {probeData?.streams?.map((s: any) => (
                            <option key={s.index} value={s.index}>
                              Stream #{s.index} - {s.codec_type?.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Min Size (bytes)</label>
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
                        <label className="text-sm text-gray-400 mb-2 block">Max Size (bytes)</label>
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
                    filteredPackets = filteredPackets.filter((p: any) => p.stream_index === parseInt(packetFilterStream));
                  }
                  
                  if (packetFilterMinSize) {
                    const minSize = parseInt(packetFilterMinSize);
                    if (!isNaN(minSize)) {
                      filteredPackets = filteredPackets.filter((p: any) => (parseInt(p.size) || 0) >= minSize);
                    }
                  }
                  
                  if (packetFilterMaxSize) {
                    const maxSize = parseInt(packetFilterMaxSize);
                    if (!isNaN(maxSize)) {
                      filteredPackets = filteredPackets.filter((p: any) => (parseInt(p.size) || 0) <= maxSize);
                    }
                  }
                  
                  const totalPages = Math.ceil(filteredPackets.length / packetsPerPage);
                  const paginatedPackets = filteredPackets.slice(
                    packetPage * packetsPerPage,
                    (packetPage + 1) * packetsPerPage
                  );
                  
                  return (
                    <>
                      <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
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
                            {paginatedPackets.map((packet: any, index: number) => (
                              <Card key={index} className="bg-white/5 backdrop-blur-lg border-white/10">
                                <CardContent className="p-4">
                                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                      <p className="text-xs text-gray-500 mb-1">Packet #{packetPage * packetsPerPage + index + 1}</p>
                                      <p className="text-white font-mono text-sm">
                                        Stream: {packet.stream_index !== undefined ? packet.stream_index : 'N/A'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 mb-1">Size</p>
                                      <p className="text-white font-mono">{packet.size || 'N/A'} bytes</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 mb-1">PTS</p>
                                      <p className="text-white font-mono text-sm">
                                        {packet.pts || 'N/A'}
                                        {packet.pts_time && (
                                          <span className="text-gray-500 ml-1">
                                            ({parseFloat(packet.pts_time).toFixed(3)}s)
                                          </span>
                                        )}
                                      </p>
      </div>
                                    <div>
                                      <p className="text-xs text-gray-500 mb-1">Duration</p>
                                      <p className="text-white font-mono text-sm">
                                        {packet.duration ? packet.duration : 'N/A'}
                                        {packet.duration_time && (
                                          <span className="text-gray-500 ml-1">
                                            ({parseFloat(packet.duration_time).toFixed(3)}s)
                                          </span>
                                        )}
                                      </p>
    </div>
                                  </div>
                                  {packet.flags && (
                                    <div className="mt-2 pt-2 border-t border-white/10">
                                      <p className="text-xs text-gray-500 mb-1">Flags</p>
                                      <p className="text-white font-mono text-xs">{packet.flags}</p>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                          
                          {/* Pagination */}
                          {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                              <Button
                                onClick={() => setPacketPage(Math.max(0, packetPage - 1))}
                                disabled={packetPage === 0}
                                variant="outline"
                                className="text-white border-white/20"
                              >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                              </Button>
                              <span className="text-gray-400 text-sm">
                                Showing {packetPage * packetsPerPage + 1} - {Math.min((packetPage + 1) * packetsPerPage, filteredPackets.length)} of {filteredPackets.length}
                              </span>
                              <Button
                                onClick={() => setPacketPage(Math.min(totalPages - 1, packetPage + 1))}
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

          {/* Bitstream Tab - Phase 4 Implementation */}
          <TabsContent value="bitstream" className="space-y-6">
            {!videoStream ? (
              <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-300 mb-4">No video stream found</p>
                  <p className="text-gray-400 text-sm">Bitstream analysis is only available for video files</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Bitstream Analysis
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Codec: {videoStream.codec_name?.toUpperCase() || 'Unknown'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {['h264', 'hevc', 'h265'].includes((videoStream.codec_name || '').toLowerCase()) ? (
                        <>
                          <div className="bg-green-500/20 border border-green-500/50 rounded p-4">
                            <p className="text-green-400 font-semibold mb-2">NAL Unit Analysis Supported</p>
                            <p className="text-gray-300 text-sm">
                              This codec supports NAL unit parsing, parameter set extraction (SPS/PPS/VPS), and slice header analysis.
                            </p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-400 mb-2">Supported Analysis</p>
                              <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                                <li>NAL unit type identification</li>
                                <li>SPS/PPS parameter extraction</li>
                                <li>Slice header parsing</li>
                                <li>Bitstream structure tree</li>
                              </ul>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400 mb-2">Codec Information</p>
                              <div className="space-y-1">
                                {videoStream.profile && (
                                  <p className="text-white font-mono text-sm">Profile: {videoStream.profile}</p>
                                )}
                                {videoStream.level && (
                                  <p className="text-white font-mono text-sm">Level: {videoStream.level}</p>
                                )}
                                {videoStream.width && videoStream.height && (
                                  <p className="text-white font-mono text-sm">
                                    Resolution: {videoStream.width} × {videoStream.height}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded p-4">
                          <p className="text-yellow-400 font-semibold mb-2">Limited Bitstream Support</p>
                          <p className="text-gray-300 text-sm">
                            Advanced bitstream parsing (NAL units, parameter sets) is currently optimized for H.264/H.265 codecs.
                            Basic hex viewer and bitstream extraction are available for all codecs.
                          </p>
                        </div>
                      )}
                      
                      <div className="pt-4 border-t border-white/10">
                        <p className="text-sm text-gray-400 mb-2">Coming Soon</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                          <li>Hex dump viewer with syntax highlighting</li>
                          <li>Binary visualization</li>
                          <li>Bitstream structure tree view</li>
                          <li>Codec-specific parameter set visualization</li>
                          <li>NAL unit timeline for H.264/H.265</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Codec-Specific Info */}
                {videoStream && (
                  <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Codec Parameters
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Codec</p>
                          <p className="text-white font-mono">{videoStream.codec_name || 'Unknown'}</p>
                        </div>
                        {videoStream.profile && (
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Profile</p>
                            <p className="text-white font-mono">{videoStream.profile}</p>
                          </div>
                        )}
                        {videoStream.level && (
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Level</p>
                            <p className="text-white font-mono">{videoStream.level}</p>
                          </div>
                        )}
                        {videoStream.pix_fmt && (
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Pixel Format</p>
                            <p className="text-white font-mono">{videoStream.pix_fmt}</p>
                          </div>
                        )}
                        {videoStream.color_space && (
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Color Space</p>
                            <p className="text-white font-mono">{videoStream.color_space}</p>
                          </div>
                        )}
                        {videoStream.bit_rate && (
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Bitrate</p>
                            <p className="text-white font-mono">
                              {(parseInt(videoStream.bit_rate) / 1000).toFixed(0)} kbps
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
