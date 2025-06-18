import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const playlistUrl = searchParams.get('url');

    if (!playlistUrl) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    console.log('[HLS Proxy] Original URL param:', playlistUrl);

    // IMPORTANT: Check if the URL already contains our proxy path - this is a bug!
    if (playlistUrl.includes('/api/hls-proxy')) {
      console.error('[HLS Proxy] ERROR: URL contains proxy path, this should not happen!', playlistUrl);
      // Extract the actual URL from the malformed URL
      const match = playlistUrl.match(/url=(.+)$/);
      if (match) {
        const actualUrl = decodeURIComponent(match[1]);
        console.log('[HLS Proxy] Extracted actual URL:', actualUrl);
        return NextResponse.redirect(new URL(`/api/hls-proxy?url=${encodeURIComponent(actualUrl)}`, request.url));
      }
    }

    console.log('[HLS Proxy] Fetching:', playlistUrl);

    // Fetch the playlist
    const response = await fetch(playlistUrl);
    if (!response.ok) {
      console.error('[HLS Proxy] Failed to fetch:', response.status, response.statusText);
      console.error('[HLS Proxy] Failed URL was:', playlistUrl);
      return NextResponse.json(
        { error: `Failed to fetch playlist: ${response.statusText}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type') || '';
    const playlistContent = await response.text();

    console.log('[HLS Proxy] Content type:', contentType);
    console.log('[HLS Proxy] Content preview:', playlistContent.substring(0, 100).replace(/\n/g, '\\n'));

    // Check if this is actually an m3u8 playlist
    const isM3U8 = playlistContent.includes('#EXTM3U') || 
                   contentType.includes('mpegurl') || 
                   contentType.includes('m3u8') || 
                   playlistUrl.endsWith('.m3u8');

    if (!isM3U8) {
      console.error('[HLS Proxy] ERROR: Not an M3U8 file! Got HTML or other content');
      console.error('[HLS Proxy] This usually means the URL is wrong or returned a 404');
      return NextResponse.json(
        { error: 'Invalid playlist content - expected M3U8 format' },
        { status: 400 }
      );
    }

    // Parse the base URL from the playlist URL
    const urlObj = new URL(playlistUrl);
    const basePath = playlistUrl.substring(0, playlistUrl.lastIndexOf('/') + 1);

    console.log('[HLS Proxy] Base path for relative URLs:', basePath);

    // Helper function to resolve and process URLs
    const processUrl = (url: string): string => {
      if (!url || url.startsWith('#')) return url;
      
      // If it's already an absolute URL
      if (url.startsWith('http://') || url.startsWith('https://')) {
        // For nested m3u8 files, wrap in proxy
        if (url.includes('.m3u8')) {
          return `/api/hls-proxy?url=${encodeURIComponent(url)}`;
        }
        // For media segments, use direct URL
        return url;
      }
      
      // Convert relative URL to absolute
      let absoluteUrl;
      if (url.startsWith('/')) {
        // Absolute path from root
        absoluteUrl = `${urlObj.protocol}//${urlObj.host}${url}`;
      } else {
        // Relative path
        absoluteUrl = basePath + url;
      }
      
      // For nested m3u8 files, wrap in proxy
      if (absoluteUrl.includes('.m3u8')) {
        return `/api/hls-proxy?url=${encodeURIComponent(absoluteUrl)}`;
      }
      
      // For media segments, use direct URL
      return absoluteUrl;
    };

    // Process the playlist content line by line
    const lines = playlistContent.split('\n');
    const processedLines = lines.map((line, index) => {
      const trimmedLine = line.trim();
      
      // Handle #EXT-X-MAP tags (for fMP4)
      if (trimmedLine.startsWith('#EXT-X-MAP:')) {
        console.log(`[HLS Proxy] Line ${index + 1}: Processing EXT-X-MAP tag`);
        // Extract URI from the tag
        const uriMatch = trimmedLine.match(/URI="([^"]+)"/);
        if (uriMatch) {
          const originalUri = uriMatch[1];
          const processedUri = processUrl(originalUri);
          const newLine = trimmedLine.replace(`URI="${originalUri}"`, `URI="${processedUri}"`);
          console.log(`[HLS Proxy] Line ${index + 1}: Converted ${originalUri} to ${processedUri}`);
          return newLine;
        }
        return line;
      }
      
      // Handle #EXT-X-MEDIA tags (for alternate renditions)
      if (trimmedLine.startsWith('#EXT-X-MEDIA:')) {
        const uriMatch = trimmedLine.match(/URI="([^"]+)"/);
        if (uriMatch) {
          const originalUri = uriMatch[1];
          const processedUri = processUrl(originalUri);
          const newLine = trimmedLine.replace(`URI="${originalUri}"`, `URI="${processedUri}"`);
          console.log(`[HLS Proxy] Line ${index + 1}: Converted media URI ${originalUri} to ${processedUri}`);
          return newLine;
        }
        return line;
      }
      
      // Handle #EXT-X-I-FRAME-STREAM-INF tags
      if (trimmedLine.startsWith('#EXT-X-I-FRAME-STREAM-INF:')) {
        const uriMatch = trimmedLine.match(/URI="([^"]+)"/);
        if (uriMatch) {
          const originalUri = uriMatch[1];
          const processedUri = processUrl(originalUri);
          const newLine = trimmedLine.replace(`URI="${originalUri}"`, `URI="${processedUri}"`);
          console.log(`[HLS Proxy] Line ${index + 1}: Converted I-frame URI ${originalUri} to ${processedUri}`);
          return newLine;
        }
        return line;
      }
      
      // Skip empty lines and other tags
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        return line;
      }

      // At this point, any non-empty line that doesn't start with # is a URL
      console.log(`[HLS Proxy] Line ${index + 1}: Processing URL "${trimmedLine}"`);
      const processedUrl = processUrl(trimmedLine);
      console.log(`[HLS Proxy] Line ${index + 1}: Result: ${processedUrl}`);
      return processedUrl;
    });

    const processedContent = processedLines.join('\n');

    console.log('[HLS Proxy] Successfully processed playlist');

    // Return the processed playlist
    return new NextResponse(processedContent, {
      headers: {
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('[HLS Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process HLS playlist' },
      { status: 500 }
    );
  }
} 