import { type NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/redis';

interface QualityLevel {
  name: string;
  bandwidth: number;
  resolution: string;
  uri: string;
}

interface HLSFile {
  name: string;
  url: string;
  size: number;
  type: 'playlist' | 'segment';
}

// Parse HLS manifest to extract quality levels
function parseHLSManifest(content: string, baseUrl: string): { 
  qualityLevels: QualityLevel[], 
  files: HLSFile[],
  version: number,
  targetDuration: number
} {
  const lines = content.split('\n').filter(line => line.trim());
  const qualityLevels: QualityLevel[] = [];
  const files: HLSFile[] = [];
  let version = 3;
  let targetDuration = 0;
  
  // Add the master playlist file
  files.push({
    name: 'master.m3u8',
    url: baseUrl,
    size: content.length,
    type: 'playlist'
  });
  
  // Check if this is a master playlist
  if (content.includes('#EXT-X-STREAM-INF')) {
    // Parse quality levels from master playlist
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('#EXT-X-STREAM-INF')) {
        const bandwidthMatch = /BANDWIDTH=(\d+)/.exec(lines[i]);
        const resolutionMatch = /RESOLUTION=([^,\s]+)/.exec(lines[i]);
        const codecsMatch = /CODECS="([^"]+)"/.exec(lines[i]);
        
        if (i + 1 < lines.length && !lines[i + 1].startsWith('#')) {
          const uri = lines[i + 1];
          let resolution = resolutionMatch?.[1] ?? '';
          let qualityName = 'Unknown';
          
          // Handle different patterns for quality naming
          if (resolution) {
            // If we have resolution, extract height for quality name
            const [width, height] = resolution.split('x');
            if (height) {
              qualityName = `${height}p`;
            }
          } else if (bandwidthMatch) {
            // No resolution, use bandwidth to estimate quality
            const bw = parseInt(bandwidthMatch[1]);
            if (bw > 8000000) {
              qualityName = '4K';
              resolution = '3840x2160';
            } else if (bw > 5000000) {
              qualityName = '1080p';
              resolution = '1920x1080';
            } else if (bw > 2500000) {
              qualityName = '720p';
              resolution = '1280x720';
            } else if (bw > 1000000) {
              qualityName = '480p';
              resolution = '854x480';
            } else if (bw > 600000) {
              qualityName = '360p';
              resolution = '640x360';
            } else {
              qualityName = '240p';
              resolution = '426x240';
            }
          }
          
          // Special handling for audio-only streams
          if (codecsMatch && !codecsMatch[1].includes('avc') && !codecsMatch[1].includes('hvc') && !codecsMatch[1].includes('hev')) {
            qualityName = 'Audio';
            resolution = 'Audio Only';
          }
          
          qualityLevels.push({
            name: qualityName,
            bandwidth: parseInt(bandwidthMatch?.[1] ?? '0'),
            resolution: resolution ?? 'Unknown',
            uri: uri
          });
        }
      }
    }
  } else {
    // This is a media playlist, parse version and target duration
    for (const line of lines) {
      if (line.startsWith('#EXT-X-VERSION')) {
        version = parseInt(line.split(':')[1]);
      } else if (line.startsWith('#EXT-X-TARGETDURATION')) {
        targetDuration = parseInt(line.split(':')[1]);
      }
    }
  }
  
  return { qualityLevels, files, version, targetDuration };
}

// Resolve relative URLs to absolute URLs
function resolveUrl(relativeUrl: string, baseUrl: string): string {
  if (relativeUrl.startsWith('http://') ?? relativeUrl.startsWith('https://')) {
    return relativeUrl;
  }
  
  try {
    const base = new URL(baseUrl);
    const resolved = new URL(relativeUrl, base);
    return resolved.toString();
  } catch (e) {
    // Fallback to simple concatenation
    if (relativeUrl.startsWith('/')) {
      const base = new URL(baseUrl);
      return `${base.protocol}//${base.host}${relativeUrl}`;
    } else {
      const baseParts = baseUrl.split('/');
      baseParts.pop(); // Remove filename
      return `${baseParts.join('/')}/${relativeUrl}`;
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { videoId, url, originalUrl, title } = await request.json();

    if (!videoId || !url) {
      return NextResponse.json(
        { error: 'Video ID and URL are required' },
        { status: 400 }
      );
    }

    // Parse the URL to extract the actual HLS URL (remove proxy wrapper if present)
    let actualHlsUrl = originalUrl ?? url;
    if (url.includes('/api/hls-proxy')) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      actualHlsUrl = urlParams.get('url') ?? actualHlsUrl;
    }

    // Fetch the HLS manifest
    let qualityLevels: QualityLevel[] = [];
    let files: HLSFile[] = [];
    const processedAt = new Date().toISOString();
    
    try {
      console.log(`[Store HLS] Fetching manifest from: ${actualHlsUrl}`);
      const response = await fetch(actualHlsUrl);
      
      if (response.ok) {
        const manifestContent = await response.text();
        const parsed = parseHLSManifest(manifestContent, actualHlsUrl);
        qualityLevels = parsed.qualityLevels;
        files = parsed.files;
        
        // If we found quality levels, fetch each variant playlist
        if (qualityLevels.length > 0) {
          for (const quality of qualityLevels) {
            const variantUrl = resolveUrl(quality.uri, actualHlsUrl);
            files.push({
              name: quality.uri.split('/').pop() ?? quality.uri,
              url: `/api/hls-proxy?url=${encodeURIComponent(variantUrl)}`,
              size: 0, // We don't know the size without fetching
              type: 'playlist'
            });
          }
        }
        
        console.log(`[Store HLS] Found ${qualityLevels.length} quality levels`);
      } else {
        console.error(`[Store HLS] Failed to fetch manifest: ${response.status}`);
      }
    } catch (error) {
      console.error('[Store HLS] Error fetching/parsing manifest:', error);
      // Continue anyway, we'll still store the URL
    }

    // Store the HLS URL and metadata in Redis
    const videoData = {
      id: videoId,
      url,
      originalUrl: actualHlsUrl,
      title: title ?? 'HLS Stream',
      isOriginal: false,
      isHLS: true,
      createdAt: new Date().toISOString(),
      processedAt,
      status: 'ready',
      files: files.length > 0 ? files : undefined,
      qualities: qualityLevels.length > 0 ? qualityLevels : undefined,
      processStatus: 'completed'
    };

    await kv.set(`video:${videoId}`, videoData);
    console.log(`[Store HLS] Stored HLS URL in Redis for video ID: ${videoId}`);

    return NextResponse.json({ 
      success: true, 
      videoId,
      qualityLevels: qualityLevels.length,
      files: files.length
    });
  } catch (error) {
    console.error('[Store HLS] Error storing HLS URL:', error);
    return NextResponse.json(
      { error: 'Failed to store HLS URL' },
      { status: 500 }
    );
  }
} 