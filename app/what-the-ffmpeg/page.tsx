'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Upload, 
  FileVideo, 
  FileAudio, 
  Image as ImageIcon,
  Loader2, 
  AlertCircle,
  CheckCircle2,
  Zap,
  FileText,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface FileInfo {
  id: string;
  filename: string;
  size: number;
  type: string;
  status: 'uploading' | 'uploaded' | 'analyzing' | 'ready' | 'error';
  progress: number;
  error?: string;
}

export default function WhatTheFFMPEGPage() {
  const router = useRouter();
  const [file, setFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [fileInfo, setFileInfo] = React.useState<FileInfo | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Support video, audio, and image files
      const validTypes = ['video/', 'audio/', 'image/'];
      if (validTypes.some(type => selectedFile.type.startsWith(type))) {
        setFile(selectedFile);
        setError(null);
        setFileInfo(null);
      } else {
        setError('Please select a valid video, audio, or image file');
        setFile(null);
      }
    }
  };

  const uploadFile = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    let videoId: string | null = null;

    try {
      // Step 1: Get signed URL from WTF-specific API (supports video, audio, images)
      const response = await fetch('/api/what-the-ffmpeg/upload/signed-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to get upload URL (${response.status})`);
      }

      const { uploadUrl, videoId: serverVideoId, filename } = await response.json();
      videoId = serverVideoId;

      // Update file info
      setFileInfo({
        id: videoId,
        filename: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading',
        progress: 0,
      });

      // Step 2: Upload directly to Google Cloud Storage
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(percentComplete);
          setFileInfo(prev => prev ? { ...prev, progress: percentComplete } : null);
        }
      });

      xhr.addEventListener('load', async () => {
        if (xhr.status === 200) {
          // Step 3: Notify backend that upload is complete (existing endpoint)
          await fetch('/api/upload/complete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              videoId,
              filename,
              size: file.size,
              type: file.type,
            }),
          });

          // Step 4: Store WTF-specific metadata
          const wtfResponse = await fetch('/api/what-the-ffmpeg/upload/complete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              videoId,
              filename,
              size: file.size,
              type: file.type,
            }),
          });

          if (!wtfResponse.ok) {
            console.warn('Failed to store WTF metadata, continuing...');
          }

          setUploadProgress(100);
          setUploading(false);
          
          setFileInfo(prev => prev ? { 
            ...prev, 
            status: 'uploaded',
            progress: 100 
          } : null);

          // Navigate to analysis page
          router.push(`/what-the-ffmpeg/${videoId}`);
        } else {
          throw new Error('Upload failed');
        }
      });

      xhr.addEventListener('error', () => {
        throw new Error('Upload failed');
      });

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploading(false);
      setFileInfo(prev => prev ? { 
        ...prev, 
        status: 'error',
        error: err instanceof Error ? err.message : 'Upload failed'
      } : null);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('video/')) return <FileVideo className="h-12 w-12 text-orange-400" />;
    if (type.startsWith('audio/')) return <FileAudio className="h-12 w-12 text-blue-400" />;
    if (type.startsWith('image/')) return <ImageIcon className="h-12 w-12 text-green-400" />;
    return <FileText className="h-12 w-12 text-gray-400" />;
  };

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="min-h-screen relative">
      {/* Override purple background with orange/yellow theme */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-orange-900 to-yellow-900 animate-gradient -z-10" />
      <div className="fixed inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-0">
        {/* Header */}
        <div className="mb-12">
          <div className="mb-8 flex justify-between items-center">
            <Link href="/">
              <Button variant="ghost" className="text-white hover:bg-white/20">
                ← Back to Home
              </Button>
            </Link>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center space-x-2 mb-4">
              <Zap className="h-10 w-10 text-yellow-400" />
              <h1 className="text-5xl font-bold text-white">
                What the FFMPEG
              </h1>
            </div>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Upload any media file to get extremely detailed analysis using FFProbe, FFPlay, and FFMPEG. 
              Visualize codec information, frame-level data, bitstream analysis, and more.
            </p>
          </div>
        </div>

        {/* Upload Section */}
        <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Upload className="h-5 w-5 text-yellow-400" />
              </div>
              Upload Media File for Analysis
            </CardTitle>
            <CardDescription className="text-gray-300">
              Supports video (MP4, MOV, MKV, WebM, AVI), audio (MP3, AAC, FLAC, WAV), and image (JPEG, PNG, GIF) formats
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* File Input */}
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="video/*,audio/*,image/*"
                  className="hidden"
                  id="media-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="media-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  {file ? (
                    <div className="flex flex-col items-center">
                      {getFileIcon(file.type)}
                      <p className="text-white font-medium mt-3">{file.name}</p>
                      <p className="text-gray-400 text-sm">{formatBytes(file.size)}</p>
                      <p className="text-gray-500 text-xs mt-1">{file.type}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="h-12 w-12 text-gray-400 mb-3" />
                      <p className="text-gray-300">Click to select a media file</p>
                      <p className="text-gray-500 text-sm mt-1">or drag and drop</p>
                      <p className="text-gray-500 text-xs mt-2">
                        Video, Audio, or Image files supported
                      </p>
                    </div>
                  )}
                </label>
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>Uploading...</span>
                    <span>{uploadProgress.toFixed(0)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {/* Error Display */}
              {error && (
                <Alert className="bg-red-500/20 border-red-500/50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Upload Button */}
              <Button
                onClick={uploadFile}
                disabled={!file || uploading}
                className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload and Analyze
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <BarChart3 className="h-5 w-5 text-yellow-400" />
              </div>
              What You'll Get
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white">Stream Analysis</p>
                  <p className="text-sm">Detailed video, audio, and subtitle stream information</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white">Frame-Level Data</p>
                  <p className="text-sm">Frame-by-frame analysis with thumbnails and metadata</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white">Packet Inspection</p>
                  <p className="text-sm">Low-level packet analysis and statistics</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white">Bitstream Visualization</p>
                  <p className="text-sm">Hex viewer and codec-specific bitstream parsing</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

