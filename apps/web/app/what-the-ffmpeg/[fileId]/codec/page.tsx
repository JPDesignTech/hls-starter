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
  Settings,
  Info,
  BarChart3,
  Film,
  Music,
  Code
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

export default function CodecPage() {
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

  const getCodecCompatibility = (codecName: string, codecType: string): { compatible: boolean; notes: string[] } => {
    const notes: string[] = [];
    let compatible = true;

    if (codecType === 'video') {
      const modernCodecs = ['h264', 'hevc', 'h265', 'vp9', 'av1', 'vp8'];
      if (!modernCodecs.includes(codecName.toLowerCase())) {
        compatible = false;
        notes.push('Older or less common codec');
      }
      
      if (['h264', 'hevc', 'h265'].includes(codecName.toLowerCase())) {
        notes.push('Widely supported across devices');
      } else if (['vp9', 'av1'].includes(codecName.toLowerCase())) {
        notes.push('Modern codec with good compression');
      }
    } else if (codecType === 'audio') {
      const modernCodecs = ['aac', 'mp3', 'opus', 'vorbis'];
      if (!modernCodecs.includes(codecName.toLowerCase())) {
        compatible = false;
        notes.push('Less common audio codec');
      }
      
      if (codecName.toLowerCase() === 'aac') {
        notes.push('Excellent compatibility');
      } else if (codecName.toLowerCase() === 'opus') {
        notes.push('Modern codec with high quality');
      }
    }

    return { compatible, notes };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-400 mx-auto mb-4" />
          <p className="text-gray-300">Loading codec data...</p>
        </div>
      </div>
    );
  }

  const videoStreams = probeData?.streams?.filter((s: any) => s.codec_type === 'video') || [];
  const audioStreams = probeData?.streams?.filter((s: any) => s.codec_type === 'audio') || [];
  const otherStreams = probeData?.streams?.filter((s: any) => !['video', 'audio'].includes(s.codec_type)) || [];

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
            <Settings className="h-8 w-8 text-orange-400" />
            <h1 className="text-3xl font-bold text-white">Codec Analysis</h1>
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

        {/* Video Codecs */}
        {videoStreams.length > 0 && (
          <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Film className="h-5 w-5" />
                Video Codecs ({videoStreams.length})
              </CardTitle>
              <CardDescription className="text-gray-300">
                Video codec information and compatibility
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {videoStreams.map((stream: any, index: number) => {
                  const compatibility = getCodecCompatibility(stream.codec_name || '', 'video');
                  return (
                    <Card key={index} className="bg-black/30 border-white/10">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-white text-lg">
                            Stream #{stream.index} - {stream.codec_name?.toUpperCase() || 'UNKNOWN'}
                          </CardTitle>
                          {compatibility.compatible ? (
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Compatible</span>
                          ) : (
                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">Limited Support</span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Codec Name</p>
                            <p className="text-white font-mono">{stream.codec_name || 'Unknown'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Codec Long Name</p>
                            <p className="text-white font-mono text-sm">{stream.codec_long_name || 'Unknown'}</p>
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
                          {stream.width && stream.height && (
                            <div>
                              <p className="text-sm text-gray-400 mb-1">Resolution</p>
                              <p className="text-white font-mono">{stream.width} × {stream.height}</p>
                            </div>
                          )}
                          {stream.bit_rate && (
                            <div>
                              <p className="text-sm text-gray-400 mb-1">Bitrate</p>
                              <p className="text-white font-mono">
                                {(parseInt(stream.bit_rate) / 1000).toFixed(0)} kbps
                              </p>
                            </div>
                          )}
                        </div>
                        {compatibility.notes.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <p className="text-sm text-gray-400 mb-2">Compatibility Notes:</p>
                            <ul className="list-disc list-inside space-y-1">
                              {compatibility.notes.map((note, i) => (
                                <li key={i} className="text-gray-300 text-sm">{note}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Audio Codecs */}
        {audioStreams.length > 0 && (
          <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Music className="h-5 w-5" />
                Audio Codecs ({audioStreams.length})
              </CardTitle>
              <CardDescription className="text-gray-300">
                Audio codec information and compatibility
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {audioStreams.map((stream: any, index: number) => {
                  const compatibility = getCodecCompatibility(stream.codec_name || '', 'audio');
                  return (
                    <Card key={index} className="bg-black/30 border-white/10">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-white text-lg">
                            Stream #{stream.index} - {stream.codec_name?.toUpperCase() || 'UNKNOWN'}
                          </CardTitle>
                          {compatibility.compatible ? (
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Compatible</span>
                          ) : (
                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">Limited Support</span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Codec Name</p>
                            <p className="text-white font-mono">{stream.codec_name || 'Unknown'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Codec Long Name</p>
                            <p className="text-white font-mono text-sm">{stream.codec_long_name || 'Unknown'}</p>
                          </div>
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
                          {stream.bit_rate && (
                            <div>
                              <p className="text-sm text-gray-400 mb-1">Bitrate</p>
                              <p className="text-white font-mono">
                                {(parseInt(stream.bit_rate) / 1000).toFixed(0)} kbps
                              </p>
                            </div>
                          )}
                        </div>
                        {compatibility.notes.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <p className="text-sm text-gray-400 mb-2">Compatibility Notes:</p>
                            <ul className="list-disc list-inside space-y-1">
                              {compatibility.notes.map((note, i) => (
                                <li key={i} className="text-gray-300 text-sm">{note}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Other Codecs */}
        {otherStreams.length > 0 && (
          <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Code className="h-5 w-5" />
                Other Streams ({otherStreams.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {otherStreams.map((stream: any, index: number) => (
                  <Card key={index} className="bg-black/30 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">
                        Stream #{stream.index} - {stream.codec_type?.toUpperCase() || 'UNKNOWN'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Codec Name</p>
                          <p className="text-white font-mono">{stream.codec_name || 'Unknown'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Codec Long Name</p>
                          <p className="text-white font-mono text-sm">{stream.codec_long_name || 'Unknown'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Data Message */}
        {(!probeData || !probeData.streams || probeData.streams.length === 0) && !loading && (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6 text-center">
              <p className="text-gray-300 mb-4">No codec data available</p>
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

