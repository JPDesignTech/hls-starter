'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  ShieldCheck, 
  Upload, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  FileVideo,
  Download,
  Loader2,
  Info,
  Terminal,
  Wrench,
  Clock,
  Activity
} from 'lucide-react';
import Link from 'next/link';

interface CorruptionIssue {
  type: string;
  severity: 'critical' | 'warning' | 'info';
  description: string;
  detection: string;
  fixCommand?: string;
  explanation?: string;
}

interface AnalysisResult {
  videoId: string;
  filename: string;
  fileSize: number;
  issues: CorruptionIssue[];
  metadata: {
    format?: string;
    duration?: number;
    bitrate?: number;
    hasVideo?: boolean;
    hasAudio?: boolean;
    videoCodec?: string;
    audioCodec?: string;
    resolution?: string;
    fps?: number;
  };
  rawOutput?: any;
  analyzedAt: string;
}

export default function CorruptionCheckPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const uploadAndAnalyze = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Step 1: Get signed URL from API (same as direct upload)
      const response = await fetch('/api/upload/signed-url', {
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
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, videoId, filename } = await response.json();

      // Step 2: Upload directly to Google Cloud Storage
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(percentComplete);
        }
      });

      const uploadPromise = new Promise((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            resolve(null);
          } else {
            reject(new Error('Upload failed'));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });
      });

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);

      // Wait for upload to complete
      await uploadPromise;

      // Step 3: Notify backend that upload is complete
      const completeResponse = await fetch('/api/upload/complete', {
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

      if (!completeResponse.ok) {
        throw new Error('Failed to complete upload');
      }

      // Add a small delay to ensure file is fully available in GCS
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 4: Start corruption analysis
      setUploading(false);
      setAnalyzing(true);
      setUploadProgress(100);
      
      console.log('Starting corruption analysis with:', { filename, originalName: file.name, gcsPath: filename });
      
      const analysisResponse = await fetch('/api/corruption-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          filename,
          originalName: file.name,
          gcsPath: filename // Pass the GCS path for analysis
        }),
      });
      
      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.json();
        throw new Error(errorData.error || 'Analysis failed');
      }
      
      const result = await analysisResponse.json();
      setResult(result);
      
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setUploading(false);
      setAnalyzing(false);
      setUploadProgress(0);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      case 'info': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info': return <Info className="h-5 w-5 text-blue-500" />;
      default: return null;
    }
  };

  const downloadReport = () => {
    if (!result) return;
    
    const report = {
      ...result,
      generatedAt: new Date().toISOString(),
      recommendations: result.issues.map(issue => ({
        issue: issue.description,
        fix: issue.fixCommand,
        explanation: issue.explanation
      }))
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `corruption-report-${result.videoId}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
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

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
              <ShieldCheck className="h-10 w-10 text-green-400" />
              <h1 className="text-5xl font-bold text-white">
                Video Corruption Checker
              </h1>
            </div>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Upload a video file to detect and get fixes for common corruption issues
            </p>
          </div>
        </div>

        {/* Upload Section */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Video for Analysis
            </CardTitle>
            <CardDescription className="text-gray-300">
              Supports MP4, MOV, MKV, WebM, AVI, and other common video formats
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* File Input */}
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept="video/*"
                  className="hidden"
                  id="video-upload"
                  disabled={uploading || analyzing}
                />
                <label
                  htmlFor="video-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <FileVideo className="h-12 w-12 text-gray-400 mb-3" />
                  {file ? (
                    <div>
                      <p className="text-white font-medium">{file.name}</p>
                      <p className="text-gray-400 text-sm">{formatBytes(file.size)}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-300">Click to select a video file</p>
                      <p className="text-gray-500 text-sm mt-1">or drag and drop</p>
                    </div>
                  )}
                </label>
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {/* Analyze Button */}
              <Button
                onClick={uploadAndAnalyze}
                disabled={!file || uploading || analyzing}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : analyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing for Corruption...
                  </>
                ) : (
                  <>
                    <Activity className="mr-2 h-4 w-4" />
                    Check for Corruption
                  </>
                )}
              </Button>

              {/* Error Display */}
              {error && (
                <Alert className="bg-red-500/20 border-red-500/50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Summary Card */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      {result.issues.length === 0 ? (
                        <>
                          <CheckCircle className="h-6 w-6 text-green-400" />
                          Video is Healthy
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-6 w-6 text-yellow-400" />
                          {result.issues.length} Issue{result.issues.length > 1 ? 's' : ''} Found
                        </>
                      )}
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      {result.filename} • Analyzed at {new Date(result.analyzedAt).toLocaleString()}
                    </CardDescription>
                  </div>
                  <Button
                    onClick={downloadReport}
                    size="sm"
                    variant="outline"
                    className="text-white border-white/20 hover:bg-white/10"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Video Metadata */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-sm text-gray-400">Format</p>
                    <p className="text-white font-mono">{result.metadata.format || 'Unknown'}</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-sm text-gray-400">Duration</p>
                    <p className="text-white font-mono">
                      {result.metadata.duration ? formatDuration(result.metadata.duration) : 'Unknown'}
                    </p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-sm text-gray-400">Resolution</p>
                    <p className="text-white font-mono">{result.metadata.resolution || 'Unknown'}</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-sm text-gray-400">Bitrate</p>
                    <p className="text-white font-mono">
                      {result.metadata.bitrate ? `${(result.metadata.bitrate / 1000000).toFixed(2)} Mbps` : 'Unknown'}
                    </p>
                  </div>
                </div>

                {/* Codec Info */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-sm text-gray-400">Video Codec</p>
                    <p className="text-white font-mono">{result.metadata.videoCodec || 'None'}</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-sm text-gray-400">Audio Codec</p>
                    <p className="text-white font-mono">{result.metadata.audioCodec || 'None'}</p>
                  </div>
                </div>

                {/* Issues */}
                {result.issues.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <Wrench className="h-5 w-5" />
                      Detected Issues & Fixes
                    </h3>
                    {result.issues.map((issue, index) => (
                      <div key={index} className="bg-black/30 rounded-lg p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          {getSeverityIcon(issue.severity)}
                          <div className="flex-1">
                            <h4 className={`font-semibold ${getSeverityColor(issue.severity)}`}>
                              {issue.type}
                            </h4>
                            <p className="text-gray-300 text-sm mt-1">{issue.description}</p>
                            {issue.detection && (
                              <p className="text-gray-400 text-xs mt-2 font-mono bg-black/50 p-2 rounded">
                                Detection: {issue.detection}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {issue.fixCommand && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-400 mb-1 flex items-center gap-1">
                              <Terminal className="h-3 w-3" />
                              Suggested Fix Command:
                            </p>
                            <div className="bg-black/50 rounded p-3 font-mono text-xs text-green-400 overflow-x-auto">
                              {issue.fixCommand}
                            </div>
                          </div>
                        )}
                        
                        {issue.explanation && (
                          <p className="text-gray-400 text-sm mt-2 italic">
                            {issue.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 text-center">
                    <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
                    <p className="text-green-300 text-lg font-semibold">No Corruption Detected</p>
                    <p className="text-gray-300 text-sm mt-1">
                      Your video file appears to be healthy and properly formatted.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-sm">About This Tool</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm">
                  This tool uses FFprobe to analyze your video file for common corruption issues including:
                </p>
                <ul className="list-disc list-inside text-gray-400 text-sm mt-2 space-y-1">
                  <li>Missing or corrupt container metadata (e.g., missing moov atom)</li>
                  <li>Codec mismatches or missing parameters</li>
                  <li>Audio-video synchronization drift</li>
                  <li>Timestamp and interleaving errors</li>
                  <li>Damaged frames or bitstream corruption</li>
                </ul>
                <p className="text-gray-400 text-sm mt-3">
                  The suggested FFmpeg commands can be run locally to attempt repairs. Always keep a backup of your original file.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 