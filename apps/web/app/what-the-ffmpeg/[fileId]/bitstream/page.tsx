'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  AlertCircle,
  ArrowLeft,
  Code,
  Info,
  BarChart3,
  FileCode,
  Binary,
  Network,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { HexViewer } from '@/components/bitstream/hex-viewer';
import { BinaryVisualizer } from '@/components/bitstream/binary-visualizer';
import { StructureTree } from '@/components/bitstream/structure-tree';
import { ParameterSetViewer } from '@/components/bitstream/parameter-set-viewer';
import { NALTimeline } from '@/components/bitstream/nal-timeline';
import type { FfprobeStream } from 'fluent-ffmpeg';

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
  format?: unknown;
  streams?: FfprobeStream[];
}

interface BitstreamData {
  bitstream: string;
  format: string;
  codec?: string;
  nalUnits?: Array<{
    type: number;
    typeName: string;
    size: number;
    offset: number;
    data: string;
  }>;
  parameterSets?: {
    sps?: Array<{
      type: number;
      typeName: string;
      size: number;
      offset: number;
      data: string;
    }>;
    pps?: Array<{
      type: number;
      typeName: string;
      size: number;
      offset: number;
      data: string;
    }>;
    vps?: Array<{
      type: number;
      typeName: string;
      size: number;
      offset: number;
      data: string;
    }>;
  };
  statistics?: {
    totalSize: number;
    nalUnitCount: number;
  };
}

export default function BitstreamPage() {
  const params = useParams();
  const fileId = params.fileId as string;

  const [fileMetadata, setFileMetadata] = React.useState<FileMetadata | null>(null);
  const [probeData, setProbeData] = React.useState<ProbeData | null>(null);
  const [bitstreamData, setBitstreamData] = React.useState<BitstreamData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedOffset, setSelectedOffset] = React.useState<number | null>(null);
  const [activeTab, setActiveTab] = React.useState('hex');

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
          
          // Check if video stream exists
          const videoStream = probeResult.data.streams?.find((s: FfprobeStream) => s.codec_type === 'video');
          if (videoStream) {
            // Load bitstream data
            await loadBitstream();
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadBitstream = async () => {
    try {
      const response = await fetch('/api/what-the-ffmpeg/bitstream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId,
          streamIndex: 0,
          format: 'hex',
          codecSpecific: true,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setBitstreamData(result);
        }
      }
    } catch (err) {
      console.error('Failed to load bitstream:', err);
    }
  };

  const handleOffsetClick = (offset: number) => {
    setSelectedOffset(offset);
    setActiveTab('hex'); // Switch to hex view when clicking on offset
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-400 mx-auto mb-4" />
          <p className="text-gray-300">Loading bitstream data...</p>
        </div>
      </div>
    );
  }

  // Get video codec info
  const videoStream = probeData?.streams?.find((s: FfprobeStream) => s.codec_type === 'video');
  const codecName = (videoStream as FfprobeStream | undefined)?.codec_name?.toLowerCase();
  const isH264H265 = codecName && ['h264', 'hevc', 'h265'].includes(codecName);

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
            <Code className="h-8 w-8 text-pink-400" />
            <h1 className="text-3xl font-bold text-white">Bitstream Analysis</h1>
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
            <AlertDescription>{error as React.ReactNode}</AlertDescription>
          </Alert>
        )}

        {/* Codec Info */}
        {probeData && videoStream && (
          <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Video Codec Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Codec</p>
                  <p className="text-white font-mono text-lg">{codecName?.toUpperCase() ?? 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Codec Long Name</p>
                  <p className="text-white font-mono text-sm">{(videoStream as FfprobeStream | undefined)?.codec_long_name ?? 'Unknown'}</p>
                </div>
                {isH264H265 ? (
                  <div className="md:col-span-2">
                    <div className="bg-green-500/20 border border-green-500/50 rounded p-3">
                      <p className="text-green-400 font-semibold mb-1">NAL Unit Analysis Supported</p>
                      <p className="text-gray-300 text-sm">
                        This codec supports NAL unit analysis, parameter set extraction (SPS/PPS/VPS), and slice header parsing.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="md:col-span-2">
                    <div className="bg-yellow-500/20 border border-yellow-500/50 rounded p-3">
                      <p className="text-yellow-400 font-semibold mb-1">Limited Bitstream Support</p>
                      <p className="text-gray-300 text-sm">
                        Advanced bitstream parsing (NAL units, parameter sets) is optimized for H.264/H.265 codecs.
                        Basic hex viewer and bitstream extraction are available for all codecs.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bitstream Viewer */}
        {bitstreamData ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white/10 border-white/20">
              <TabsTrigger value="hex" className="text-white data-[state=active]:bg-white/20">
                <FileCode className="h-4 w-4 mr-2" />
                Hex Dump
              </TabsTrigger>
              <TabsTrigger value="binary" className="text-white data-[state=active]:bg-white/20">
                <Binary className="h-4 w-4 mr-2" />
                Binary
              </TabsTrigger>
              {isH264H265 && bitstreamData.nalUnits && (
                <>
                  <TabsTrigger value="tree" className="text-white data-[state=active]:bg-white/20">
                    <Network className="h-4 w-4 mr-2" />
                    Structure Tree
                  </TabsTrigger>
                  <TabsTrigger value="parameters" className="text-white data-[state=active]:bg-white/20">
                    <Code className="h-4 w-4 mr-2" />
                    Parameter Sets
                  </TabsTrigger>
                  <TabsTrigger value="timeline" className="text-white data-[state=active]:bg-white/20">
                    <Clock className="h-4 w-4 mr-2" />
                    Timeline
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            <TabsContent value="hex">
              <HexViewer
                hexData={bitstreamData.bitstream}
                nalUnits={bitstreamData.nalUnits}
                onOffsetClick={handleOffsetClick}
              />
            </TabsContent>

            <TabsContent value="binary">
              <BinaryVisualizer
                hexData={bitstreamData.bitstream}
                nalUnits={bitstreamData.nalUnits}
                onOffsetClick={handleOffsetClick}
              />
            </TabsContent>

            {isH264H265 && bitstreamData.nalUnits && (
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
                    codec={codecName === 'h264' ? 'h264' : codecName === 'h265' || codecName === 'hevc' ? 'h265' : undefined}
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
        ) : (
          <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Info className="h-5 w-5" />
                Bitstream Data Not Available
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                {!videoStream
                  ? 'No video stream found. Bitstream analysis is only available for video files.'
                  : 'Bitstream data is being extracted. Please wait...'}
              </p>
              {(videoStream as FfprobeStream | undefined) && (
                <Button
                  onClick={loadBitstream}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  Load Bitstream
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        {bitstreamData?.statistics && (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 mt-6">
            <CardHeader>
              <CardTitle className="text-white">Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Size</p>
                  <p className="text-white font-mono text-lg">
                    {bitstreamData.statistics.totalSize.toLocaleString()} bytes
                  </p>
                </div>
                {bitstreamData.statistics.nalUnitCount > 0 && (
                  <div>
                    <p className="text-sm text-gray-400 mb-1">NAL Units</p>
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
      </div>
    </div>
  );
}
