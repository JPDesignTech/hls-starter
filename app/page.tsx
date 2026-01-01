'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { VideoPlayer } from '@/components/video-player';
import { DirectUpload } from '@/components/direct-upload';
import { ChunkedUpload } from '@/components/chunked-upload';
import { Upload, Video, Loader2, CheckCircle2, AlertCircle, Zap, CloudUpload, Package, Server, BarChart3, Link as LinkIcon, Trash2, X, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import HlsSpecTips from '@/components/hls-spec-tips';

interface VideoInfo {
  id: string;
  title: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  progress: number;
  url?: string;
  error?: string;
}

type UploadMethod = 'direct' | 'chunked' | 'traditional' | 'hls';

export default function HomePage() {
  const router = useRouter();
  const [videos, setVideos] = React.useState<VideoInfo[]>(() => {
    // Load videos from localStorage on initial render
    if (typeof window !== 'undefined') {
      const savedVideos = localStorage.getItem('beemmeup-videos');
      if (savedVideos) {
        try {
          return JSON.parse(savedVideos);
        } catch (e) {
          console.error('Error loading saved videos:', e);
        }
      }
    }
    return [];
  });
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [selectedMethod, setSelectedMethod] = React.useState<UploadMethod>('direct');
  const [autoAnalyze, setAutoAnalyze] = React.useState(false);
  const [hlsUrl, setHlsUrl] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Save videos to localStorage whenever they change
  React.useEffect(() => {
    if (videos.length > 0) {
      localStorage.setItem('beemmeup-videos', JSON.stringify(videos));
    }
  }, [videos]);

  // Delete a single video
  const deleteVideo = React.useCallback((videoId: string) => {
    setVideos(prev => prev.filter(v => v.id !== videoId));
    // If no videos left, clear localStorage
    if (videos.length === 1) {
      localStorage.removeItem('beemmeup-videos');
    }
  }, [videos.length]);

  // Clear all videos
  const clearAllVideos = React.useCallback(() => {
    setVideos([]);
    localStorage.removeItem('beemmeup-videos');
  }, []);

  // Poll for video status updates
  React.useEffect(() => {
    const checkVideoStatus = async () => {
      const processingVideos = videos.filter(v => v.status === 'processing');
      
      for (const video of processingVideos) {
        try {
          const response = await fetch(`/api/video/${video.id}/status`);
          if (response.ok) {
            const data = await response.json();
            if (data.status === 'ready') {
              setVideos(prev => prev.map(v => 
                v.id === video.id 
                  ? { ...v, status: 'ready', url: data.url, progress: 100 } 
                  : v
              ));
            } else if (data.status === 'processing') {
              // Update progress during processing
              let newProgress = data.progress || video.progress || 50;
              
              // If we're stuck at 50% and have a processingState, increment slowly
              if (newProgress === 50 && data.processingState === 'RUNNING' && video.progress >= 50) {
                // Increment by 10% every 10 seconds (1% per second), up to 85%
                newProgress = Math.min(85, video.progress + 10);
              }
              
              console.log(`Updating video ${video.id} progress from ${video.progress}% to ${newProgress}%`);
              setVideos(prev => prev.map(v => 
                v.id === video.id 
                  ? { ...v, progress: newProgress } 
                  : v
              ));
            } else if (data.status === 'error') {
              setVideos(prev => prev.map(v => 
                v.id === video.id 
                  ? { ...v, status: 'error', error: data.error || 'Processing failed' } 
                  : v
              ));
            }
          }
        } catch (error) {
          console.error('Error checking video status:', error);
        }
      }
    };

    // Only run if there are videos being processed
    if (videos.some(v => v.status === 'processing')) {
      checkVideoStatus();
      const interval = setInterval(checkVideoStatus, 10000); // Check every 10 seconds
      return () => clearInterval(interval);
    }
  }, [videos]);

  // Add video to the list (called from child components)
  const addVideo = React.useCallback((videoInfo: VideoInfo) => {
    setVideos(prev => {
      const newVideos = [videoInfo, ...prev];
      // Update localStorage with the new video
      localStorage.setItem('beemmeup-videos', JSON.stringify(newVideos));
      return newVideos;
    });
  }, []);

  // Update video status (called from child components)
  const updateVideo = React.useCallback((videoId: string, updates: Partial<VideoInfo>) => {
    setVideos(prev => {
      const newVideos = prev.map(v => 
      v.id === videoId ? { ...v, ...updates } : v
      );
      console.log('Videos after update:', newVideos);
      return newVideos;
    });
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
    }
  };

  const handleTraditionalUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    const videoId = Date.now().toString();
    
    // Add video to list with uploading status
    const newVideo: VideoInfo = {
      id: videoId,
      title: selectedFile.name,
      status: 'uploading',
      progress: 0,
    };
    setVideos(prev => [newVideo, ...prev]);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('video', selectedFile);
      formData.append('videoId', videoId);

      // Upload video
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      // Update video status to processing
      setVideos(prev => prev.map(v => 
        v.id === videoId ? { ...v, status: 'processing', progress: 50 } : v
      ));

      // Start processing
      const processResponse = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId }),
      });

      if (!processResponse.ok) {
        throw new Error('Processing failed');
      }

      const result = await processResponse.json();

      // Update video with ready status and URL
      setVideos(prev => prev.map(v => 
        v.id === videoId 
          ? { ...v, status: 'ready', progress: 100, url: result.url } 
          : v
      ));
      
      // Navigate to analyzer if auto-analyze is enabled
      if (autoAnalyze) {
        router.push(`/video/${videoId}/analyze`);
      }
    } catch (error) {
      // Update video with error status
      setVideos(prev => prev.map(v => 
        v.id === videoId 
          ? { ...v, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' } 
          : v
      ));
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleHlsSubmit = async () => {
    if (!hlsUrl.trim()) return;

    const videoId = Date.now().toString();
    const urlParts = hlsUrl.split('/');
    const title = urlParts[urlParts.length - 1] || 'HLS Playlist';
    
    // Use the proxy endpoint to handle relative URLs in HLS playlists
    const proxiedUrl = `/api/hls-proxy?url=${encodeURIComponent(hlsUrl)}`;

    // Add video to list with ready status since it's already an HLS playlist
    const newVideo: VideoInfo = {
      id: videoId,
      title: title,
      status: 'ready',
      progress: 100,
      url: proxiedUrl,
    };
    
    setVideos(prev => [newVideo, ...prev]);
    
    // Store in Redis so the status API can find it
    try {
      const response = await fetch('/api/video/store-hls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId,
          url: proxiedUrl,
          originalUrl: hlsUrl,
          title,
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to store HLS URL in Redis');
      }
    } catch (error) {
      console.error('Error storing HLS URL:', error);
    }
    
    // Clear the input
    setHlsUrl('');
    
    // Navigate to analyzer if auto-analyze is enabled
    if (autoAnalyze) {
      router.push(`/video/${videoId}/analyze`);
    }
  };

  const methods = [
    {
      id: 'direct' as UploadMethod,
      title: 'Direct to Cloud',
      description: 'Upload directly to Google Cloud Storage',
      icon: CloudUpload,
    },
    {
      id: 'hls' as UploadMethod,
      title: 'Upload HLS',
      description: 'Analyze existing HLS playlist URL',
      icon: LinkIcon,
    },
    // TODO: Add chunked and traditional upload methods back in
    // {
    //   id: 'chunked' as UploadMethod,
    //   title: 'Chunked Upload',
    //   description: 'Split large files into smaller chunks',
    //   icon: Package,
    // },
    // {
    //   id: 'traditional' as UploadMethod,
    //   title: 'Traditional',
    //   description: 'Standard upload (max 4.5MB)',
    //   icon: Server,
    // },
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center space-x-2 mb-4">
            <Zap className="h-10 w-10 text-yellow-400" />
            <h1 className="text-5xl font-bold text-white">
              BeemMeUp
            </h1>
          </div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Upload your video to generate HLS playlists and analyze them with deep segment inspection, 
            quality level analysis, and adaptive bitrate configurations. Plus, use FFProbe to detect 
            and fix potential corruption issues in media files ✨
          </p>
          <div className="max-w-3xl mx-auto mt-6">
            <HlsSpecTips />
          </div>
        </div>

        {/* Upload Method Selection - Updated to grid-cols-4 on larger screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
          {methods.map((method) => {
            const Icon = method.icon;
            return (
              <Card
                key={method.id}
                className={`cursor-pointer transition-all ${
                  selectedMethod === method.id
                    ? 'bg-purple-600/20 border-purple-500 backdrop-blur-lg'
                    : 'bg-white/10 border-white/20 hover:bg-white/20 backdrop-blur-lg'
                }`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <CardHeader className="text-center">
                  <Icon className="h-8 w-8 text-purple-400 mb-2 mx-auto" />
                  <CardTitle className="text-white text-lg">
                    {method.title}
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    {method.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Upload Section */}
        <Card className="mb-8 bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-white">
              {selectedMethod === 'hls' ? 'Analyze HLS Playlist' : 'Upload Video'}
            </CardTitle>
            <CardDescription className="text-gray-300">
              {selectedMethod === 'direct' && 'Upload directly to cloud storage for best performance'}
              {selectedMethod === 'chunked' && 'Upload large files by splitting them into chunks'}
              {selectedMethod === 'traditional' && 'Traditional upload method (limited to 4.5MB on Vercel)'}
              {selectedMethod === 'hls' && 'Enter an HLS playlist URL to analyze segments, quality levels, and configurations'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center gap-2">
              <input
                type="checkbox"
                id="auto-analyze"
                checked={autoAnalyze}
                onChange={(e) => setAutoAnalyze(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="auto-analyze" className="text-white cursor-pointer">
                Automatically open HLS analyzer after upload
              </Label>
            </div>
            
            {selectedMethod === 'direct' && (
              <DirectUpload 
                onUploadComplete={async (videoId, filename) => {
                  console.log('Direct upload complete:', { videoId, filename });
                  
                  try {
                  // Trigger processing after direct upload
                    const response = await fetch('/api/process', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      videoId, 
                      gcsPath: filename 
                    }),
                    });
                    
                    if (!response.ok) {
                      const errorText = await response.text();
                      console.error('Process API error:', errorText);
                      throw new Error(`Processing failed: ${response.status}`);
                    }
                    
                    const result = await response.json();
                    console.log('Process API result:', result);
                    
                    if (result.url) {
                      updateVideo(videoId, {
                        status: 'ready',
                        url: result.url,
                        progress: 100,
                      });
                      
                      // Navigate to analyzer if auto-analyze is enabled
                      if (autoAnalyze) {
                        router.push(`/video/${videoId}/analyze`);
                    }
                    } else {
                      throw new Error('No URL returned from processing');
                    }
                  } catch (error) {
                    console.error('Error processing video:', error);
                    updateVideo(videoId, {
                      status: 'error',
                      error: error instanceof Error ? error.message : 'Processing failed',
                    });
                  }
                }}
                onVideoAdded={addVideo}
                onVideoUpdated={updateVideo}
              />
            )}
            
            {selectedMethod === 'hls' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="hls-url" className="text-white">HLS Playlist URL</Label>
                  <Input
                    id="hls-url"
                    type="url"
                    placeholder="https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_4x3/bipbop_4x3_variant.m3u8"
                    value={hlsUrl}
                    onChange={(e) => setHlsUrl(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 hover:bg-white/20 transition-colors"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Enter a valid HLS playlist URL (.m3u8 file). Works with both relative and absolute segment URLs.
                  </p>
                </div>

                {/* Example URLs */}
                <div className="space-y-2">
                  <p className="text-xs text-gray-400">Try these example HLS playlists:</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setHlsUrl('https://devstreaming-cdn.apple.com/videos/streaming/examples/adv_dv_atmos/main.m3u8')}
                      className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-purple-300 transition-colors"
                    >
                      Advanced (fMP4)
                    </button>
                    <button
                      type="button"
                      onClick={() => setHlsUrl('https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_ts/master.m3u8')}
                      className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-purple-300 transition-colors"
                    >
                      Advanced (TS)
                    </button>
                    <button
                      type="button"
                      onClick={() => setHlsUrl('https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_4x3/bipbop_4x3_variant.m3u8')}
                      className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-purple-300 transition-colors"
                    >
                      Basic 4:3 Playlist
                    </button>
                    <button
                      type="button"
                      onClick={() => setHlsUrl('https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8')}
                      className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-purple-300 transition-colors"
                    >
                      Basic 16:9 Playlist
                    </button>
                  </div>
                </div>

                <Button
                  onClick={handleHlsSubmit}
                  disabled={!hlsUrl.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Analyze HLS Playlist
                </Button>
              </div>
            )}
            
            {selectedMethod === 'chunked' && (
              <ChunkedUpload 
                onUploadComplete={async (videoId, filename) => {
                  console.log('Chunked upload complete:', { videoId, filename });
                  
                  try {
                  // Trigger processing after chunked upload
                    const response = await fetch('/api/process', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ videoId }),
                    });
                    
                    if (!response.ok) {
                      const errorText = await response.text();
                      console.error('Process API error:', errorText);
                      throw new Error(`Processing failed: ${response.status}`);
                    }
                    
                    const result = await response.json();
                    console.log('Process API result:', result);
                    
                    if (result.url) {
                      updateVideo(videoId, {
                        status: 'ready',
                        url: result.url,
                        progress: 100,
                      });
                      
                      // Navigate to analyzer if auto-analyze is enabled
                      if (autoAnalyze) {
                        router.push(`/video/${videoId}/analyze`);
                    }
                    } else {
                      throw new Error('No URL returned from processing');
                    }
                  } catch (error) {
                    console.error('Error processing video:', error);
                    updateVideo(videoId, {
                      status: 'error',
                      error: error instanceof Error ? error.message : 'Processing failed',
                    });
                  }
                }}
                onVideoAdded={addVideo}
                onVideoUpdated={updateVideo}
              />
            )}
            
            {selectedMethod === 'traditional' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="video-upload" className="text-white">Video File</Label>
                  <Input
                    id="video-upload"
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    disabled={isUploading}
                    className="cursor-pointer bg-white/10 border-white/20 text-white file:bg-white/20 file:text-white file:border-0 hover:bg-white/20 transition-colors"
                  />
                </div>

                {selectedFile && (
                  <div className="p-4 bg-white/10 rounded-lg border border-white/20">
                    <p className="text-sm font-medium text-white">{selectedFile.name}</p>
                    <p className="text-xs text-gray-300">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    {selectedFile.size > 4.5 * 1024 * 1024 && (
                      <p className="text-xs text-yellow-400 mt-1">
                        ⚠️ This file is too large for Vercel. Use Direct or Chunked upload instead.
                      </p>
                    )}
                  </div>
                )}

                <Button
                  onClick={handleTraditionalUpload}
                  disabled={!selectedFile || isUploading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload and Process
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Videos List */}
        {videos.length > 0 && (
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Upload History</h2>
            <Button
              onClick={clearAllVideos}
              variant="ghost"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          </div>
        )}
        
        <div className="space-y-6">
          {videos.map(video => (
            <Card key={video.id} className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Video className="h-5 w-5 text-purple-400" />
                    <CardTitle className="text-lg text-white">{video.title}</CardTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    {video.status === 'uploading' && (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                        <span className="text-sm text-blue-400">Uploading...</span>
                      </>
                    )}
                    {video.status === 'processing' && (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-yellow-400" />
                        <span className="text-sm text-yellow-400">Processing...</span>
                      </>
                    )}
                    {video.status === 'ready' && (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                        <span className="text-sm text-green-400">Ready</span>
                      </>
                    )}
                    {video.status === 'error' && (
                      <>
                        <AlertCircle className="h-4 w-4 text-red-400" />
                        <span className="text-sm text-red-400">Error</span>
                      </>
                    )}
                    <Button
                      onClick={() => deleteVideo(video.id)}
                      variant="ghost"
                      size="icon"
                      className="ml-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {(video.status === 'uploading' || video.status === 'processing') && (
                  <div className="mb-4">
                    <Progress value={video.progress} className="mb-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">
                        {video.status === 'uploading' ? 'Uploading' : 'Processing'} video...
                        {video.status === 'processing' && video.progress > 50 && video.progress < 100 && (
                          <span className="text-xs text-gray-400 ml-2">
                            ({video.progress < 60 ? 'Initializing' : video.progress < 90 ? 'Transcoding' : 'Finalizing'})
                          </span>
                        )}
                      </span>
                      <span className="text-yellow-400 font-semibold">
                        {Math.round(video.progress)}%
                      </span>
                    </div>
                  </div>
                )}
                
                {video.status === 'error' && (
                  <div className="p-4 bg-red-500/20 text-red-300 rounded-lg border border-red-500/30">
                    <p className="text-sm">{video.error}</p>
                  </div>
                )}

                {video.status === 'ready' && video.url && (
                  <>
                  <VideoPlayer
                    src={video.url}
                    className="w-full aspect-video"
                    onQualityChange={(quality) => {
                      console.log(`Video ${video.id} quality changed to:`, quality);
                    }}
                  />
                    <div className="mt-4 flex gap-3">
                      <Link href={`/video/${video.id}/analyze`} className="flex-1">
                        <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Analyze HLS Output
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* What the FFMPEG Feature Card */}
        <Card className="mt-8 bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Zap className="h-6 w-6 text-yellow-400" />
              </div>
              What the FFMPEG
            </CardTitle>
            <CardDescription className="text-gray-300">
              Extremely detailed media file analysis with FFProbe, FFPlay, and FFMPEG
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-300 mb-4">
              Upload any media file (video, audio, or image) to get comprehensive analysis including 
              stream information, frame-level data, packet inspection, bitstream visualization, and 
              codec-specific details. Perfect for deep media file inspection and debugging.
            </p>
            <Link href="/what-the-ffmpeg">
              <Button className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white">
                <Zap className="mr-2 h-4 w-4" />
                Open What the FFMPEG
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Corruption Checker Feature Card */}
        <Card className="mt-8 bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-lg border-green-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <ShieldCheck className="h-6 w-6 text-green-400" />
              </div>
              Video Corruption Checker
            </CardTitle>
            <CardDescription className="text-gray-300">
              Detect and fix common video file corruption issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-300 mb-4">
              Upload any video file to check for corruption issues including missing metadata, 
              codec problems, sync issues, and damaged frames. Get detailed analysis and FFmpeg 
              commands to fix detected problems.
            </p>
            <Link href="/corruption-check">
              <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
                <ShieldCheck className="mr-2 h-4 w-4" />
                Open Corruption Checker
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Empty State */}
        {videos.length === 0 && (
          <Card className="mt-8 bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Video className="mx-auto h-12 w-12 text-purple-400 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  No videos uploaded yet
                </h3>
                <p className="text-sm text-gray-300 max-w-md mx-auto">
                  Choose an upload method above and upload a video file to get started. 
                  BeemMeUp will generate HLS playlists with multiple quality levels and provide detailed analysis tools.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
