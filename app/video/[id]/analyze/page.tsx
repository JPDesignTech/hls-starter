'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileVideo, List, Clock, HardDrive, Zap, FileText, Play, Download, ExternalLink, Loader2 } from 'lucide-react';
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

export default function VideoAnalyzePage() {
  const params = useParams();
  const videoId = params.id as string;
  const [videoData, setVideoData] = useState<VideoMetadata | null>(null);
  const [selectedManifest, setSelectedManifest] = useState<string>('');
  const [manifestContent, setManifestContent] = useState<string>('');
  const [parsedManifest, setParsedManifest] = useState<ParsedManifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          
          // Create synthetic file entries
          data.files = [
            {
              name: `${videoId}/master.m3u8`,
              url: data.url,
              size: 1024 // Unknown size
            }
          ];
          
          // Add quality-specific playlists if we have quality information
          if (data.qualities && data.qualities.length > 0) {
            data.qualities.forEach((quality: any) => {
              data.files.push({
                name: `${videoId}/${quality.name}/playlist.m3u8`,
                url: `${baseUrl}/${quality.name}/playlist.m3u8`,
                size: 1024 // Unknown size
              });
            });
          }
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
          const bandwidth = lines[i].match(/BANDWIDTH=(\d+)/)?.[1];
          const resolution = lines[i].match(/RESOLUTION=([^,\s]+)/)?.[1];
          if (i + 1 < lines.length) {
            parsed.qualityLevels.push({
              bandwidth: parseInt(bandwidth || '0'),
              resolution: resolution || 'Unknown',
              uri: lines[i + 1],
            });
          }
        }
      }
    } else {
      // Parse media playlist
      let segmentIndex = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('#EXT-X-VERSION')) {
          parsed.version = parseInt(lines[i].split(':')[1]);
        } else if (lines[i].startsWith('#EXT-X-TARGETDURATION')) {
          parsed.targetDuration = parseInt(lines[i].split(':')[1]);
        } else if (lines[i].startsWith('#EXTINF')) {
          const duration = parseFloat(lines[i].split(':')[1].split(',')[0]);
          if (i + 1 < lines.length && !lines[i + 1].startsWith('#')) {
            parsed.segments.push({
              duration,
              uri: lines[i + 1],
              index: segmentIndex++,
            });
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
                            <div className="relative h-12 bg-white/5 rounded-full overflow-hidden">
                              {parsedManifest.segments.map((segment, idx) => {
                                const startPercent = (parsedManifest.segments
                                  .slice(0, idx)
                                  .reduce((acc, s) => acc + s.duration, 0) / parsedManifest.totalDuration) * 100;
                                const widthPercent = (segment.duration / parsedManifest.totalDuration) * 100;
                                
                                return (
                                  <div
                                    key={segment.index}
                                    className="absolute h-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 transition-colors cursor-pointer group"
                                    style={{
                                      left: `${startPercent}%`,
                                      width: `${widthPercent}%`,
                                      borderRight: '1px solid rgba(0,0,0,0.3)',
                                    }}
                                    title={`Segment #${segment.index}: ${segment.duration.toFixed(3)}s`}
                                  >
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                      <span className="text-xs text-white font-bold">
                                        #{segment.index}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex justify-between mt-2 text-xs text-gray-400">
                              <span>0:00</span>
                              <span>{formatDuration(parsedManifest.totalDuration)}</span>
                            </div>
                          </div>
                          
                          {/* Segment List */}
                          <div className="bg-black/30 rounded-lg p-4 max-h-64 overflow-y-auto">
                            <div className="space-y-1">
                              {parsedManifest.segments.map((segment) => (
                                <div
                                  key={segment.index}
                                  className="flex items-center gap-3 text-sm hover:bg-white/5 p-2 rounded"
                                >
                                  <span className="text-gray-500 w-12">
                                    #{segment.index}
                                  </span>
                                  <Clock className="h-3 w-3 text-gray-400" />
                                  <span className="text-purple-300 font-mono">
                                    {segment.duration.toFixed(3)}s
                                  </span>
                                  <span className="text-gray-300 truncate flex-1">
                                    {segment.uri}
                                  </span>
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