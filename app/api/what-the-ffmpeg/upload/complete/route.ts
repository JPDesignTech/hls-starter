import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/redis';
import { createStorage } from '@/lib/gcs-config';

export async function POST(request: NextRequest) {
  try {
    const { videoId, filename, size, type } = await request.json();

    if (!videoId || !filename) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Make file publicly accessible so ffprobe can access it directly
    const bucketName = process.env.GCS_BUCKET_NAME;
    if (bucketName) {
      try {
        const storage = createStorage();
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(filename);
        
        // Try to make file public (works if bucket doesn't use uniform bucket-level access)
        try {
          await file.makePublic();
          console.log(`[WTF Upload] Made file public: ${filename}`);
        } catch (makePublicError: any) {
          // If uniform bucket-level access is enabled, makePublic() will fail with code 400
          // In that case, files inherit bucket-level IAM permissions
          if (makePublicError.code === 400) {
            console.log(`[WTF Upload] Bucket uses uniform bucket-level access, file inherits bucket permissions: ${filename}`);
          } else {
            console.warn(`[WTF Upload] Failed to make file public: ${makePublicError.message}`);
          }
        }
      } catch (gcsError) {
        console.error('[WTF Upload] Error accessing GCS:', gcsError);
        // Continue even if making public fails - metadata storage is more important
      }
    }

    // Store WTF-specific metadata in Redis
    const fileId = videoId; // Use same ID as video for consistency
    const wtfMetadata = {
      fileId,
      videoId, // Link to existing video record
      filename,
      size,
      fileType: type, // File MIME type
      status: 'uploaded',
      uploadedAt: new Date().toISOString(),
      analysisStatus: 'pending',
      type: 'what-the-ffmpeg', // Tool type identifier
    };

    // Store with wtf prefix
    await kv.set(`wtf:file:${fileId}`, wtfMetadata);

    // Also store in a list for quick access (optional)
    await kv.set(`wtf:files:${fileId}`, fileId);

    return NextResponse.json({
      success: true,
      fileId,
      metadata: wtfMetadata,
    });
  } catch (error) {
    console.error('WTF upload complete error:', error);
    return NextResponse.json(
      { error: 'Failed to complete WTF upload' },
      { status: 500 }
    );
  }
}

