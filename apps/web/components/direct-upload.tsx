'use client';

import React, { useState } from 'react';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Loader2, CloudUpload } from 'lucide-react';

interface UploadResponse {
  uploadUrl: string;
  videoId: string;
  filename: string;
}

interface DirectUploadProps {
  onUploadComplete?: (videoId: string, filename: string) => void;
  onVideoAdded?: (video: any) => void;
  onVideoUpdated?: (videoId: string, updates: any) => void;
}

export function DirectUpload({ onUploadComplete, onVideoAdded, onVideoUpdated }: DirectUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith('video/')) {
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

    let videoId: string | null = null;

    try {
      // Step 1: Get signed URL from your API
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

      const { uploadUrl, videoId: serverVideoId, filename }: UploadResponse = await response.json();
      videoId = serverVideoId;

      // Add video to parent's list with the real videoId
      if (onVideoAdded) {
        onVideoAdded({
          id: videoId,
          title: file.name,
          status: 'uploading',
          progress: 0,
        });
      }

      // Step 2: Upload directly to Google Cloud Storage
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(percentComplete);
          
          // Update parent's video progress
          if (onVideoUpdated && videoId) {
            onVideoUpdated(videoId, { progress: percentComplete * 0.5 }); // 50% for upload
          }
        }
      });

      xhr.addEventListener('load', async () => {
        if (xhr.status === 200) {
          // Step 3: Notify your backend that upload is complete
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

          setUploadProgress(100);
          setUploading(false);
          
          // Update parent's video status
          if (onVideoUpdated && videoId) {
            onVideoUpdated(videoId, { 
              status: 'processing', 
              progress: 50 
            });
          }
          
          // Notify parent of completion
          if (onUploadComplete && videoId) {
            onUploadComplete(videoId, filename);
          }
        } else {
          throw new Error('Upload failed');
        }
      });

      xhr.addEventListener('error', () => {
        setUploading(false);
        throw new Error('Upload failed');
      });

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploading(false);
      
      // Update parent's video status to error
      if (onVideoUpdated && videoId) {
        onVideoUpdated(videoId, { 
          status: 'error', 
          error: err instanceof Error ? err.message : 'Upload failed' 
        });
      }
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
            Uploading...
          </>
        ) : (
          <>
            <CloudUpload className="mr-2 h-4 w-4" />
            Upload to Cloud Storage
          </>
        )}
      </Button>
    </div>
  );
} 