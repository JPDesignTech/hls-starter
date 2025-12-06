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
  Info,
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

export default function FramesPage() {
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

      // Load basic probe data
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-400 mx-auto mb-4" />
          <p className="text-gray-300">Loading frame data...</p>
        </div>
      </div>
    );
  }

  // Get frame count from streams if available
  const videoStream = probeData?.streams?.find((s: any) => s.codec_type === 'video');
  const frameCount = videoStream?.nb_frames;

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
            <Film className="h-8 w-8 text-green-400" />
            <h1 className="text-3xl font-bold text-white">Frame Analysis</h1>
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

        {/* Coming Soon Message */}
        <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Info className="h-5 w-5" />
              Frame Analysis Coming Soon
            </CardTitle>
            <CardDescription className="text-gray-300">
              Detailed frame-by-frame analysis will be available in Phase 3
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-300">
                Frame-level analysis will include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                <li>Frame-by-frame navigation and inspection</li>
                <li>Frame type identification (I, P, B frames)</li>
                <li>Frame timestamps (PTS, DTS)</li>
                <li>Frame size and duration analysis</li>
                <li>Thumbnail generation</li>
                <li>GOP structure visualization</li>
                <li>Keyframe distribution</li>
                <li>Temporal analysis</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Basic Frame Info */}
        {probeData && videoStream && (
          <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Basic Frame Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {frameCount && (
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Total Frames</p>
                    <p className="text-white font-mono text-2xl">{frameCount}</p>
                  </div>
                )}
                {videoStream.r_frame_rate && (
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Frame Rate</p>
                    <p className="text-white font-mono text-2xl">{videoStream.r_frame_rate}</p>
                  </div>
                )}
                {videoStream.width && videoStream.height && (
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Resolution</p>
                    <p className="text-white font-mono text-lg">
                      {videoStream.width} × {videoStream.height}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="mt-6">
          <Link href={`/what-the-ffmpeg/${fileId}`}>
            <Button variant="outline" className="text-white border-white/20 hover:bg-white/10">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

