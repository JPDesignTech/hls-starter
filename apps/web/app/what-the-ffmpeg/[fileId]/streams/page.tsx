'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Loader2, 
  AlertCircle,
  ArrowLeft,
  Film,
  Music,
  Code,
  FileVideo,
  BarChart3
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
}

export default function StreamsPage() {
  const params = useParams();
  const fileId = params.fileId as string;

  const [fileMetadata, setFileMetadata] = React.useState<FileMetadata | null>(null);
  const [probeData, setProbeData] = React.useState<ProbeData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadData();
  }, [fileId]);

  const loadData = async () => {
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

      // Load probe data with streams
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
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
        return <Film className="h-6 w-6 text-orange-400" />;
      case 'audio':
        return <Music className="h-6 w-6 text-blue-400" />;
      case 'subtitle':
        return <FileVideo className="h-6 w-6 text-green-400" />;
      default:
        return <Code className="h-6 w-6 text-gray-400" />;
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-400 mx-auto mb-4" />
          <p className="text-gray-300">Loading streams...</p>
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
          <Link href={`/what-the-ffmpeg/${fileId}`}>
            <Button variant="ghost" className="text-white hover:bg-white/20 mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Film className="h-8 w-8 text-orange-400" />
            <h1 className="text-3xl font-bold text-white">Stream Analysis</h1>
          </div>
          {fileMetadata && (
            <p className="text-gray-400 mt-2">{fileMetadata.filename}</p>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <Alert className="bg-red-500/20 border-red-500/50 mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Streams List */}
        {probeData?.streams && probeData.streams.length > 0 ? (
          <div className="space-y-6">
            {/* Stream Summary */}
            <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
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

            {/* Individual Streams */}
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
          </div>
        ) : (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6 text-center">
              <p className="text-gray-300 mb-4">No stream data available</p>
              <Link href={`/what-the-ffmpeg/${fileId}`}>
                <Button className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Start Analysis
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

