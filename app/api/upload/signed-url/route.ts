import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createStorage } from '@/lib/gcs-config';

// Initialize Google Cloud Storage
const storage = createStorage();

const bucketName = process.env.GCS_BUCKET_NAME || 'hls-starter-bucket';
const bucket = storage.bucket(bucketName);

export async function POST(request: NextRequest) {
  try {
    const { filename, contentType } = await request.json();
    
    if (!filename || !contentType) {
      return NextResponse.json(
        { error: 'Missing filename or contentType' },
        { status: 400 }
      );
    }

    // Validate content type
    if (!contentType.startsWith('video/')) {
      return NextResponse.json(
        { error: 'Invalid content type. Must be a video file.' },
        { status: 400 }
      );
    }

    const videoId = uuidv4();
    const fileExtension = filename.split('.').pop();
    const gcsFilename = `${videoId}/original.${fileExtension}`;

    // Generate a signed URL for uploading
    const [url] = await bucket.file(gcsFilename).getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType,
    });

    return NextResponse.json({
      uploadUrl: url,
      videoId,
      filename: gcsFilename,
    });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
} 