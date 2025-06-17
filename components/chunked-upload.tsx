'use client';

import React, { useState } from 'react';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Card } from './ui/card';

const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB chunks

export function ChunkedUpload() {
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
    setUploadProgress(0);

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

        if (result.complete) {
          setVideoId(result.videoId);
          setUploadProgress(100);
          alert(`Upload complete! Video ID: ${result.videoId}`);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Chunked Upload</h2>
      
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
            <br />
            Chunks: {Math.ceil(file.size / CHUNK_SIZE)} × 2MB
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