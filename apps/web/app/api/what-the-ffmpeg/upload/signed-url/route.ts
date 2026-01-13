import { type NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createStorage } from '@/lib/gcs-config';

export async function POST(request: NextRequest) {
  try {
    const { filename, contentType } = await request.json();
    
    if (!filename || !contentType) {
      return NextResponse.json(
        { error: 'Missing filename or contentType' },
        { status: 400 }
      );
    }

    // Validate content type - accept video, audio, and image files
    const validTypes = ['video/', 'audio/', 'image/'];
    if (!validTypes.some(type => contentType.startsWith(type))) {
      return NextResponse.json(
        { error: 'Invalid content type. Must be a video, audio, or image file.' },
        { status: 400 }
      );
    }

    // Initialize Google Cloud Storage inside the handler
    const bucketName = process.env.GCS_BUCKET_NAME;
    if (!bucketName) {
      return NextResponse.json(
        { error: 'GCS bucket name not configured. Please set GCS_BUCKET_NAME environment variable.' },
        { status: 500 }
      );
    }

    const storage = createStorage();
    const bucket = storage.bucket(bucketName);

    const fileId = uuidv4();
    const fileExtension = filename.split('.').pop();
    const gcsFilename = `${fileId}/original.${fileExtension}`;

    // Generate a signed URL for uploading
    const [url] = await bucket.file(gcsFilename).getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType,
    });

    return NextResponse.json({
      uploadUrl: url,
      videoId: fileId, // Use videoId for consistency with existing flow
      fileId, // Also return fileId for WTF
      filename: gcsFilename,
    });
  } catch (error) {
    console.error('[WTF Upload] Error generating signed URL:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate upload URL',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

