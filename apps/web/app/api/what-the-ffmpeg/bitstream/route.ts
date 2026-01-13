import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/redis';
import { createStorage } from '@/lib/gcs-config';
import { parseNALUnits, extractParameterSets } from '@/lib/nal-parser';
import crypto from 'crypto';

// Helper to get file URL from fileId
async function getFileUrl(fileId: string, filename: string): Promise<string> {
  const bucketName = process.env.GCS_BUCKET_NAME;
  if (!bucketName) {
    throw new Error('GCS_BUCKET_NAME not configured');
  }
  
  // Construct GCS URL
  // filename format: {videoId}/original.{ext}
  return `https://storage.googleapis.com/${bucketName}/${filename}`;
}

// Helper to hash options for cache key
function hashOptions(options: any): string {
  return crypto.createHash('md5').update(JSON.stringify(options)).digest('hex').substring(0, 8);
}

export async function POST(request: NextRequest) {
  try {
    const { 
      fileId, 
      streamIndex = 0, 
      format = 'hex', 
      codecSpecific = false,
      byteRange, // { start: number, end?: number } or null for full extraction
      maxSize = 5 * 1024 * 1024, // Default 5MB limit
    } = await request.json();

    if (!fileId) {
      return NextResponse.json(
        { error: 'fileId is required' },
        { status: 400 }
      );
    }

    const ffprobeServiceUrl = process.env.FFPROBE_SERVICE_URL || process.env.NEXT_PUBLIC_FFPROBE_SERVICE_URL;
    
    if (!ffprobeServiceUrl) {
      return NextResponse.json(
        { error: 'FFprobe service URL not configured. Please set FFPROBE_SERVICE_URL environment variable.' },
        { status: 500 }
      );
    }

    // Get file metadata from Redis
    const fileMetadata = await kv.get(`wtf:file:${fileId}`);
    if (!fileMetadata) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    const metadata = fileMetadata as any;
    const targetUrl = await getFileUrl(fileId, metadata.filename);

    // Create cache key (include byteRange in hash if specified)
    const optionsHash = hashOptions({ streamIndex, format, codecSpecific, byteRange });
    const cacheKey = `wtf:bitstream:${fileId}:${streamIndex}:${optionsHash}`;

    // Check cache first (only if not requesting a specific range, as ranges are usually unique)
    if (!byteRange) {
      const cached = await kv.get(cacheKey);
      if (cached) {
        return NextResponse.json({
          success: true,
          ...(cached as any),
          cached: true,
        });
      }
    }

    // Get codec info from probe data if available
    let codec: 'h264' | 'h265' | undefined;
    try {
      const probeCacheKey = `wtf:probe:${fileId}:${hashOptions({ showStreams: true })}`;
      const probeData = await kv.get(probeCacheKey);
      if (probeData && (probeData as any).streams) {
        const videoStream = (probeData as any).streams.find((s: any) => s.codec_type === 'video' && s.index === streamIndex);
        if (videoStream) {
          const codecName = (videoStream.codec_name || '').toLowerCase();
          if (codecName === 'h264') {
            codec = 'h264';
          } else if (codecName === 'hevc' || codecName === 'h265') {
            codec = 'h265';
          }
        }
      }
    } catch (err) {
      console.warn('Could not determine codec from probe data:', err);
    }

    // Call Cloud Run bitstream extraction service
    // For large files, request only metadata or a chunk if byteRange is specified
    const requestBody: any = {
      url: targetUrl,
      streamIndex,
      format: format === 'hex' ? 'hex' : 'base64',
      codec,
    };
    
    // Add byteRange if specified
    if (byteRange) {
      requestBody.byteRange = byteRange;
    }
    
    const response = await fetch(`${ffprobeServiceUrl}/extract-bitstream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(180000), // 3 minute timeout for large files
    });

    if (!response.ok) {
      // Handle 404 specifically - endpoint might not exist yet
      if (response.status === 404) {
        throw new Error('Bitstream extraction endpoint not available. The Cloud Run service may need to be updated with the /extract-bitstream endpoint.');
      }
      const errorText = await response.text().catch(() => '');
      throw new Error(`Bitstream extraction service error: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Bitstream extraction failed');
    }

    const bitstreamHex = result.bitstream;
    const detectedCodec = result.codec || codec;
    const totalSize = result.size || 0;
    const chunkSize = result.chunkSize || bitstreamHex.length / 2; // Divide by 2 for hex string

    // Parse NAL units if codec-specific parsing is requested and codec is supported
    // Only parse if we have the full bitstream or if specifically requested
    let nalUnits;
    let parameterSets;
    let statistics = {
      totalSize,
      chunkSize,
      nalUnitCount: 0,
      isChunk: !!byteRange,
    };

    // Only parse NAL units if we have data and it's not too large
    const shouldParse = codecSpecific && 
                       detectedCodec && 
                       (detectedCodec === 'h264' || detectedCodec === 'h265') &&
                       bitstreamHex &&
                       chunkSize < 10 * 1024 * 1024; // Don't parse chunks > 10MB

    if (shouldParse) {
      try {
        nalUnits = parseNALUnits(bitstreamHex, detectedCodec);
        parameterSets = extractParameterSets(nalUnits, detectedCodec);
        statistics.nalUnitCount = nalUnits.length;
      } catch (parseError) {
        console.error('NAL unit parsing error:', parseError);
        // Continue without parsed data
      }
    }

    // Calculate data size (hex string length / 2 = bytes)
    const bitstreamSizeBytes = chunkSize;
    const bitstreamHexSize = bitstreamHex ? bitstreamHex.length : 0;
    const MAX_CACHE_SIZE = maxSize; // Use provided maxSize or default 5MB
    
    // For large files, only cache metadata, not the full bitstream
    const isLargeFile = bitstreamSizeBytes > MAX_CACHE_SIZE;
    
    const responseData: any = {
      success: true,
      format: format,
      codec: detectedCodec,
      statistics: {
        ...statistics,
        bitstreamSizeBytes,
        isLargeFile,
      },
      cached: false,
    };

    // Include byteRange info if this is a chunk
    if (result.byteRange) {
      responseData.byteRange = result.byteRange;
    }

    // Only include bitstream if it's not too large, or if it's a requested chunk
    if (!isLargeFile || byteRange) {
      responseData.bitstream = bitstreamHex;
    } else {
      // For large files without byteRange, return metadata only
      responseData.bitstream = null;
      responseData.message = `Bitstream is too large (${Math.round(bitstreamSizeBytes / 1024 / 1024 * 10) / 10}MB). Use byteRange parameter to load chunks.`;
      responseData.suggestedChunkSize = 1024 * 1024; // Suggest 1MB chunks
    }

    // Include parsed data if available
    if (nalUnits) {
      responseData.nalUnits = nalUnits;
    }
    if (parameterSets) {
      responseData.parameterSets = parameterSets;
    }

    // Only cache if data is not too large
    if (!isLargeFile) {
      try {
        await kv.setex(cacheKey, 86400, responseData);
      } catch (cacheError) {
        console.warn('[WTF Bitstream] Cache error (data may be too large):', cacheError);
        // Continue without caching
      }
    } else {
      // Cache metadata only for large files
      const metadataCache = {
        success: true,
        format,
        codec: detectedCodec,
        statistics: responseData.statistics,
        nalUnits: nalUnits?.slice(0, 100), // Only cache first 100 NAL units
        parameterSets,
        cached: false,
      };
      try {
        await kv.setex(`${cacheKey}:meta`, 86400, metadataCache);
      } catch (cacheError) {
        console.warn('[WTF Bitstream] Metadata cache error:', cacheError);
      }
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('[WTF Bitstream] Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to extract bitstream' 
      },
      { status: 500 }
    );
  }
}

