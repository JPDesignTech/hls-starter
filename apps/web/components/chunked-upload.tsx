'use client';

import React, { useState } from 'react';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Loader2, Package } from 'lucide-react';

const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB chunks

interface ChunkedUploadProps {
  onUploadComplete?: (videoId: string, filename: string) => void;
  onVideoAdded?: (video: unknown) => void;
  onVideoUpdated?: (videoId: string, updates: unknown) => void;
}

export function ChunkedUpload({ onUploadComplete, onVideoAdded, onVideoUpdated }: ChunkedUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile?.type.startsWith('video/')) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please select a valid video file');
    }
  };

  const uploadFile = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    // Add video to parent's list
    if (onVideoAdded) {
      onVideoAdded({
        id: videoId ?? 'temp-' + Date.now(),
        title: file.name,
        status: 'uploading',
        progress: 0,
      });
    }

    try {
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      let sessionId: string | null = null;

      for (let chunkNumber = 0; chunkNumber < totalChunks; chunkNumber++) {
        const start = chunkNumber * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('chunkNumber', chunkNumber.toString());
        formData.append('totalChunks', totalChunks.toString());
        formData.append('filename', file.name);
        
        if (sessionId) {
          formData.append('sessionId', sessionId);
        }

        const response = await fetch('/api/upload/chunk', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload chunk');
        }

        const result = await response.json();
        
        if (!sessionId && result.sessionId) {
          sessionId = result.sessionId;
        }

        // Update progress
        const progress = ((chunkNumber + 1) / totalChunks) * 100;
        setUploadProgress(progress);
        
        // Update parent's video progress
        if (onVideoUpdated && sessionId) {
          onVideoUpdated(result.videoId ?? sessionId, { 
            progress: progress * 0.5 // 50% for upload
          });
        }

        if (result.complete) {
          setVideoId(result.videoId);
          setUploadProgress(100);
          
          // Update parent's video status
          if (onVideoUpdated) {
            onVideoUpdated(result.videoId, { 
              status: 'processing', 
              progress: 50 
            });
          }
          
          // Notify parent of completion
          if (onUploadComplete) {
            onUploadComplete(result.videoId, result.filename);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      
      // Update parent's video status to error
      if (onVideoUpdated && videoId) {
        onVideoUpdated(videoId, { 
          status: 'error', 
          error: err instanceof Error ? err.message : 'Upload failed' 
        });
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        disabled={uploading}
        className="w-full cursor-pointer bg-white/10 border-white/20 text-white file:bg-white/20 file:text-white file:border-0 hover:bg-white/20 transition-colors p-2 rounded-md"
      />

      {file && (
        <div className="p-4 bg-white/10 rounded-lg border border-white/20">
          <p className="text-sm font-medium text-white">{file.name}</p>
          <p className="text-xs text-gray-300">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
          <p className="text-xs text-purple-300">
            Will upload in {Math.ceil(file.size / CHUNK_SIZE)} chunks of 2MB each
          </p>
        </div>
      )}

      {error && (
        <div className="text-red-400 text-sm p-3 bg-red-500/20 rounded-lg border border-red-500/30">
          {error}
        </div>
      )}

      {uploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} className="w-full" />
          <div className="text-sm text-gray-300 text-center">
            {uploadProgress.toFixed(0)}% uploaded
          </div>
        </div>
      )}

      <Button
        onClick={uploadFile}
        disabled={!file || uploading}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
      >
        {uploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading Chunks...
          </>
        ) : (
          <>
            <Package className="mr-2 h-4 w-4" />
            Upload in Chunks
          </>
        )}
      </Button>
    </div>
  );
} 