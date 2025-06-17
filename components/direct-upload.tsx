'use client';

import React, { useState } from 'react';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface UploadResponse {
  uploadUrl: string;
  videoId: string;
  filename: string;
}

export function DirectUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);
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

      const { uploadUrl, videoId, filename }: UploadResponse = await response.json();
      setVideoId(videoId);

      // Step 2: Upload directly to Google Cloud Storage
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(percentComplete);
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
          alert(`Upload complete! Video ID: ${videoId}`);
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
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Upload Video</h2>
      
      <div className="space-y-4">
        <input
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          disabled={uploading}
          className="w-full"
        />

        {file && (
          <div className="text-sm text-gray-600">
            Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        {uploading && (
          <div className="space-y-2">
            <Progress value={uploadProgress} className="w-full" />
            <div className="text-sm text-gray-600 text-center">
              {uploadProgress.toFixed(0)}% uploaded
            </div>
          </div>
        )}

        <Button
          onClick={uploadFile}
          disabled={!file || uploading}
          className="w-full"
        >
          {uploading ? 'Uploading...' : 'Upload Video'}
        </Button>

        {videoId && (
          <div className="text-green-600 text-sm">
            Video uploaded successfully! ID: {videoId}
          </div>
        )}
      </div>
    </Card>
  );
} 