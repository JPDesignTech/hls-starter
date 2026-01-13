import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, appendFile, unlink, readFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Get appropriate uploads directory based on environment
function getUploadsDir() {
  const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
  return isProduction ? '/tmp/uploads' : path.join(process.cwd(), 'uploads');
}

// Store upload sessions in memory (use Redis in production)
const uploadSessions = new Map<string, {
  videoId: string;
  filename: string;
  totalChunks: number;
  uploadedChunks: Set<number>;
  tempPath: string;
}>();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Get chunk data
    const chunk = formData.get('chunk') as File;
    const chunkNumber = parseInt(formData.get('chunkNumber') as string);
    const totalChunks = parseInt(formData.get('totalChunks') as string);
    const filename = formData.get('filename') as string;
    let sessionId = formData.get('sessionId') as string;
    
    if (!chunk || isNaN(chunkNumber) || isNaN(totalChunks) || !filename) {
      return NextResponse.json(
        { error: 'Missing required chunk data' },
        { status: 400 }
      );
    }

    // Create or get session
    if (!sessionId || !uploadSessions.has(sessionId)) {
      sessionId = uuidv4();
      const videoId = uuidv4();
      const uploadsDir = getUploadsDir();
      const tempPath = path.join(uploadsDir, 'temp', `${videoId}_${filename}`);
      
      // Create temp directory
      await mkdir(path.dirname(tempPath), { recursive: true });
      
      uploadSessions.set(sessionId, {
        videoId,
        filename,
        totalChunks,
        uploadedChunks: new Set(),
        tempPath,
      });
    }

    const session = uploadSessions.get(sessionId)!;
    
    // Save chunk
    const chunkBuffer = Buffer.from(await chunk.arrayBuffer());
    const chunkPath = `${session.tempPath}.part${chunkNumber}`;
    await writeFile(chunkPath, chunkBuffer);
    
    session.uploadedChunks.add(chunkNumber);

    // Check if all chunks are uploaded
    if (session.uploadedChunks.size === session.totalChunks) {
      // Combine all chunks
      const uploadsDir = getUploadsDir();
      const finalPath = path.join(uploadsDir, `${session.videoId}_${session.filename}`);
      
      // Ensure uploads directory exists
      await mkdir(uploadsDir, { recursive: true });
      
      // Create final file by combining chunks in order
      for (let i = 0; i < session.totalChunks; i++) {
        const chunkPath = `${session.tempPath}.part${i}`;
        const chunkData = await readFile(chunkPath);
        
        if (i === 0) {
          await writeFile(finalPath, chunkData);
        } else {
          await appendFile(finalPath, chunkData);
        }
        
        // Clean up chunk file
        await unlink(chunkPath);
      }
      
      // Clean up session
      uploadSessions.delete(sessionId);
      
      return NextResponse.json({
        complete: true,
        videoId: session.videoId,
        filename: session.filename,
      });
    }

    return NextResponse.json({
      complete: false,
      sessionId,
      uploadedChunks: session.uploadedChunks.size,
      totalChunks: session.totalChunks,
    });
  } catch (error) {
    console.error('Chunk upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload chunk' },
      { status: 500 }
    );
  }
}