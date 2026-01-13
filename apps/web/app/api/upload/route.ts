import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Ensure this route only runs on Node.js runtime
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes max

// Get appropriate uploads directory based on environment
function getUploadsDir() {
  const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
  return isProduction ? '/tmp/uploads' : path.join(process.cwd(), 'uploads');
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const video = formData.get('video') as File;
    const videoId = formData.get('videoId') as string || uuidv4();

    if (!video) {
      return NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!video.type.startsWith('video/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a video file.' },
        { status: 400 }
      );
    }

    // Create uploads directory
    const uploadsDir = getUploadsDir();
    await mkdir(uploadsDir, { recursive: true });

    // Save file
    const buffer = Buffer.from(await video.arrayBuffer());
    const filename = `${videoId}_${video.name}`;
    const filepath = path.join(uploadsDir, filename);
    
    await writeFile(filepath, buffer);

    // Store video metadata in Redis (or any other database)
    // For now, we'll just return the file info
    const videoInfo = {
      id: videoId,
      filename: filename,
      originalName: video.name,
      size: video.size,
      type: video.type,
      path: filepath,
      uploadedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      video: videoInfo,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload video' },
      { status: 500 }
    );
  }
} 