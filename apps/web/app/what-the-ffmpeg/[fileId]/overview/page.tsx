'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import type { FfprobeData, FfprobeStream } from 'fluent-ffmpeg';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Loader2, 
  AlertCircle,
  FileVideo,
  FileAudio,
  Image as ImageIcon,
  BarChart3,
  ArrowLeft,
  Info,
  Code,
  Film,
  Music,
  Image
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

type ProbeData = FfprobeData;

// Helper function to format numbers
const formatNumber = (value: string | number | undefined): number => {
  if (value === undefined || value === null) return 0;
  if (typeof value === 'number') return value;
  const parsed = parseFloat(String(value));
  return isNaN(parsed) ? 0 : parsed;
};

export default function OverviewPage() {
  const params = useParams();
  const fileId = params.fileId as string;

  const [fileMetadata, setFileMetadata] = React.useState<FileMetadata | null>(null);
  const [probeData, setProbeData] = React.useState<ProbeData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    void loadData();
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

      // Load probe data
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

  const formatBytes = (bytes: string | number): string => {
    const numBytes = typeof bytes === 'string' ? parseInt(bytes) : bytes;
    if (numBytes < 1024) return numBytes + ' B';
    if (numBytes < 1024 * 1024) return (numBytes / 1024).toFixed(2) + ' KB';
    return (numBytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDuration = (seconds: string | number): string => {
    const numSeconds = typeof seconds === 'string' ? parseFloat(seconds) : seconds;
    const hours = Math.floor(numSeconds / 3600);
    const minutes = Math.floor((numSeconds % 3600) / 60);
    const secs = Math.floor(numSeconds % 60);
    
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-400 mx-auto mb-4" />
          <p className="text-gray-300">Loading overview...</p>
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
            <BarChart3 className="h-8 w-8 text-orange-400" />
            <h1 className="text-3xl font-bold text-white">Overview</h1>
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

        {/* File Information */}
        {fileMetadata && (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Info className="h-5 w-5" />
                File Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Filename</p>
                  <p className="text-white font-mono">{fileMetadata.filename}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">File Size</p>
                  <p className="text-white font-mono">{formatBytes(fileMetadata.size)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">File Type</p>
                  <p className="text-white font-mono">{fileMetadata.fileType ?? 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Uploaded At</p>
                  <p className="text-white font-mono">
                    {new Date(fileMetadata.uploadedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Format Information */}
        {probeData?.format && (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-6">
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
                    {probeData.format.format_name ?? 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Format Long Name</p>
                  <p className="text-white font-mono">
                    {probeData.format.format_long_name ?? 'Unknown'}
                  </p>
                </div>
                {probeData.format.duration && (
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Duration</p>
                    <p className="text-white font-mono text-lg">
                      {formatDuration(probeData.format.duration)}
                    </p>
                  </div>
                )}
                {probeData.format.size && (
                  <div>
                    <p className="text-sm text-gray-400 mb-1">File Size</p>
                    <p className="text-white font-mono">
                      {formatBytes(probeData.format.size)}
                    </p>
                  </div>
                )}
                {probeData.format.bit_rate && (
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Bitrate</p>
                    <p className="text-white font-mono text-lg">
                      {((typeof probeData.format.bit_rate === 'string' ? parseInt(probeData.format.bit_rate) : probeData.format.bit_rate) / 1000000).toFixed(2)} Mbps
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

        {/* Streams Information */}
        {probeData?.streams && probeData.streams.length > 0 && (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Film className="h-5 w-5" />
                Streams ({probeData.streams.length})
              </CardTitle>
              <CardDescription className="text-gray-300">
                Detailed information about each stream in the file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {probeData.streams.map((stream: FfprobeStream, index: number) => (
                  <Card key={index} className="bg-black/30 border-white/10">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        {getStreamTypeIcon(stream.codec_type ?? 'unknown')}
                        <CardTitle className="text-white text-lg">
                          Stream #{stream.index} - {stream.codec_type?.toUpperCase() ?? 'UNKNOWN'}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Codec Name</p>
                          <p className="text-white font-mono">{stream.codec_name ?? 'Unknown'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Codec Long Name</p>
                          <p className="text-white font-mono text-sm">
                            {stream.codec_long_name ?? 'Unknown'}
                          </p>
                        </div>
                        {stream.codec_type === 'video' && (
                          <>
                            {stream.width && stream.height && (
                              <div>
                                <p className="text-sm text-gray-400 mb-1">Resolution</p>
                                <p className="text-white font-mono">
                                  {stream.width} × {stream.height}
                                </p>
                              </div>
                            )}
                            {stream.r_frame_rate && (
                              <div>
                                <p className="text-sm text-gray-400 mb-1">Frame Rate</p>
                                <p className="text-white font-mono">{stream.r_frame_rate}</p>
                              </div>
                            )}
                            {stream.pix_fmt && (
                              <div>
                                <p className="text-sm text-gray-400 mb-1">Pixel Format</p>
                                <p className="text-white font-mono">{stream.pix_fmt}</p>
                              </div>
                            )}
                          </>
                        )}
                        {stream.codec_type === 'audio' && (
                          <>
                            {stream.sample_rate && (
                              <div>
                                <p className="text-sm text-gray-400 mb-1">Sample Rate</p>
                                <p className="text-white font-mono">{stream.sample_rate} Hz</p>
                              </div>
                            )}
                            {stream.channels && (
                              <div>
                                <p className="text-sm text-gray-400 mb-1">Channels</p>
                                <p className="text-white font-mono">{stream.channels}</p>
                              </div>
                            )}
                            {stream.channel_layout && (
                              <div>
                                <p className="text-sm text-gray-400 mb-1">Channel Layout</p>
                                <p className="text-white font-mono">{stream.channel_layout}</p>
                              </div>
                            )}
                          </>
                        )}
                        {stream.bit_rate && (
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Bitrate</p>
                            <p className="text-white font-mono">
                              {(formatNumber(stream.bit_rate) / 1000).toFixed(0)} kbps
                            </p>
                          </div>
                        )}
                        {stream.duration && (
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Duration</p>
                            <p className="text-white font-mono">
                              {formatDuration(stream.duration)}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Data Message */}
        {!probeData && !loading && (
            <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
            <CardContent className="p-6 text-center">
              <p className="text-gray-300 mb-4">No analysis data available</p>
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

