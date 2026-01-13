import { type NextRequest, NextResponse } from 'next/server';
import { probeVideoFile } from '@/lib/desktop-adapter';

// This route handles local FFprobe analysis
// Used by desktop app to analyze video files without cloud services
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filePath } = body;

    if (!filePath) {
      return NextResponse.json(
        { error: 'No file path provided' },
        { status: 400 }
      );
    }

    console.log('[Desktop Probe] Analyzing file:', filePath);

    // Note: This route is called from the frontend
    // The actual probing happens in the Electron main process via IPC
    // This route is mainly for coordination and logging

    return NextResponse.json({
      success: true,
      message: 'Use window.hlsDesktop.ffprobe.analyze() directly from the frontend',
      filePath,
    });

  } catch (error) {
    console.error('[Desktop Probe] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to probe video' },
      { status: 500 }
    );
  }
}
