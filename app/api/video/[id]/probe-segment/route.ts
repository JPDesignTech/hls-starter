import { NextRequest, NextResponse } from 'next/server';

// Use external FFprobe service (Cloud Run) for all environments
// No local ffprobe fallback needed

export async function POST(
  request: NextRequest,
) {
  try {
    const { segmentUrl, segmentUrls, batchMode = false, detailed = false, byteRange, segmentDuration } = await request.json();
    
    if (!batchMode) {
      // Single segment mode
      if (!segmentUrl) {
        return NextResponse.json({ error: 'Segment URL is required' }, { status: 400 });
      }

      console.log('[Probe Segment] Running ffprobe on:', segmentUrl);
      const probeResult = await probeSegment(segmentUrl, detailed, byteRange, segmentDuration);
      
      return NextResponse.json({
        raw: probeResult.raw,
        analysis: probeResult.analysis,
        segmentUrl
      });
    } else {
      // Batch mode
      if (!segmentUrls || !Array.isArray(segmentUrls)) {
        return NextResponse.json({ error: 'Segment URLs array is required for batch mode' }, { status: 400 });
      }

      console.log('[Probe Segment] Running batch ffprobe on', segmentUrls.length, 'segments');
      
      const results = await Promise.all(
        segmentUrls.map(async (urlData, index) => {
          try {
            // Handle both string URLs and object format with metadata
            const actualUrl = typeof urlData === 'object' ? urlData.url : urlData;
            const segmentByteRange = typeof urlData === 'object' ? urlData.byteRange : undefined;
            const duration = typeof urlData === 'object' ? urlData.duration : undefined;
            
            const result = await probeSegment(actualUrl, false, segmentByteRange, duration); // Use non-detailed mode for batch
            return { url: actualUrl, ...result, success: true };
          } catch (error) {
            const url = typeof urlData === 'object' ? urlData.url : urlData;
            console.error(`[Probe Segment] Error probing ${url}:`, error);
            return { url, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
          }
        })
      );

      // Aggregate analysis across all segments
      const aggregateAnalysis = analyzeAggregateData(results.filter(r => r.success));

      return NextResponse.json({
        results,
        aggregateAnalysis,
        batchMode: true
      });
    }

  } catch (error) {
    console.error('[Probe Segment] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to probe segment' },
      { status: 500 }
    );
  }
}

async function probeSegment(segmentUrl: string, detailed: boolean = false, byteRange?: { offset: number; length: number }, segmentDuration?: number) {
  const ffprobeServiceUrl = process.env.FFPROBE_SERVICE_URL || process.env.NEXT_PUBLIC_FFPROBE_SERVICE_URL;
  
  if (!ffprobeServiceUrl) {
    throw new Error('FFprobe service URL not configured. Please set FFPROBE_SERVICE_URL environment variable.');
  }

  try {
    console.log('[Probe Segment] Using FFprobe service:', ffprobeServiceUrl);
    
    const response = await fetch(`${ffprobeServiceUrl}/probe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: segmentUrl,
        detailed
      }),
      // Add timeout for reliability
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });

    if (!response.ok) {
      throw new Error(`FFprobe service error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'FFprobe service failed');
    }

    const probeData = result.data;
    const analysis = analyzeHLSSegment(probeData, detailed, byteRange, segmentDuration);
    
    return { raw: probeData, analysis };
    
  } catch (error) {
    console.error('[Probe Segment] External service error:', error);
    throw error;
  }
}

function analyzeHLSSegment(probeData: any, detailed: boolean = false, byteRange?: { offset: number; length: number }, segmentDuration?: number) {
  const analysis: any = {
    format: {},
    video: {},
    audio: {},
    packets: {},
    frames: {},
    hls: {}
  };

  // Format analysis
  if (probeData.format) {
    analysis.format = {
      filename: probeData.format.filename,
      formatName: probeData.format.format_name,
      formatLongName: probeData.format.format_long_name,
      duration: segmentDuration || parseFloat(probeData.format.duration || '0'), // Use segment duration if provided
      size: byteRange ? byteRange.length : parseInt(probeData.format.size || '0'), // Use byte range length if provided
      bitRate: parseInt(probeData.format.bit_rate || '0'),
      probeScore: probeData.format.probe_score,
      nbStreams: probeData.format.nb_streams,
      nbPrograms: probeData.format.nb_programs,
      tags: probeData.format.tags || {},
      isSegment: !!byteRange || !!segmentDuration // Flag to indicate this is a segment analysis
    };

    // If we have byte range, calculate approximate bitrate based on segment size and duration
    if (byteRange && segmentDuration) {
      analysis.format.bitRate = Math.round((byteRange.length * 8) / segmentDuration);
    }
  }

  // Stream analysis
  if (probeData.streams && probeData.streams.length > 0) {
    probeData.streams.forEach((stream: any) => {
      if (stream.codec_type === 'video') {
        analysis.video = {
          codecName: stream.codec_name,
          codecLongName: stream.codec_long_name,
          profile: stream.profile,
          level: stream.level,
          width: stream.width,
          height: stream.height,
          codedWidth: stream.coded_width,
          codedHeight: stream.coded_height,
          hasBFrames: stream.has_b_frames,
          pixFmt: stream.pix_fmt,
          bitRate: stream.bit_rate,
          maxBitRate: stream.max_bit_rate,
          frameRate: stream.r_frame_rate,
          avgFrameRate: stream.avg_frame_rate,
          timeBase: stream.time_base,
          startPts: stream.start_pts,
          startTime: stream.start_time,
          duration: stream.duration,
          durationTs: stream.duration_ts,
          nbFrames: stream.nb_frames || stream.nb_read_frames,
          nbReadFrames: stream.nb_read_frames,
          nbReadPackets: stream.nb_read_packets,
          displayAspectRatio: stream.display_aspect_ratio,
          sampleAspectRatio: stream.sample_aspect_ratio,
          isAvc: stream.is_avc,
          nalLengthSize: stream.nal_length_size,
          refs: stream.refs,
          tags: stream.tags || {}
        };
      } else if (stream.codec_type === 'audio') {
        analysis.audio = {
          codecName: stream.codec_name,
          codecLongName: stream.codec_long_name,
          profile: stream.profile,
          sampleRate: stream.sample_rate,
          channels: stream.channels,
          channelLayout: stream.channel_layout,
          bitsPerSample: stream.bits_per_sample,
          bitRate: stream.bit_rate,
          maxBitRate: stream.max_bit_rate,
          timeBase: stream.time_base,
          startPts: stream.start_pts,
          startTime: stream.start_time,
          duration: stream.duration,
          durationTs: stream.duration_ts,
          nbFrames: stream.nb_frames || stream.nb_read_frames,
          nbReadFrames: stream.nb_read_frames,
          nbReadPackets: stream.nb_read_packets,
          tags: stream.tags || {}
        };
      }
    });
  }

  // Only analyze packets/frames if we have detailed data
  if (detailed) {
    // Frame analysis
    if (probeData.frames && probeData.frames.length > 0) {
      const videoFrames = probeData.frames.filter((f: any) => f.media_type === 'video');
      const keyFrames = videoFrames.filter((f: any) => f.key_frame === 1);
      
      analysis.frames = {
        total: probeData.frames.length,
        video: videoFrames.length,
        keyFrames: keyFrames.length,
        firstPts: probeData.frames[0]?.pts,
        lastPts: probeData.frames[probeData.frames.length - 1]?.pts,
        avgKeyFrameInterval: keyFrames.length > 1 ? 
          (keyFrames[keyFrames.length - 1].pts - keyFrames[0].pts) / (keyFrames.length - 1) : 0,
        keyFramePositions: keyFrames.slice(0, 10).map((f: any) => ({
          pts: f.pts,
          pts_time: f.pts_time,
          pkt_pos: f.pkt_pos
        }))
      };
    }
  } else {
    // For basic analysis, estimate from stream info
    analysis.frames = {
      estimated: true,
      total: 'N/A (use detailed mode)',
      video: analysis.video.nbFrames || 'N/A',
      keyFrames: 'N/A (use detailed mode)',
      note: 'Enable detailed analysis for frame-level information'
    };
    
    analysis.packets = {
      estimated: true,
      total: 'N/A (use detailed mode)',
      note: 'Enable detailed analysis for packet-level information'
    };
  }

  // HLS compliance analysis
  const targetDuration = parseFloat(probeData.format?.target_duration || '0');
  const actualDuration = segmentDuration || analysis.format.duration;
  
  analysis.hls = {
    compliant: true,
    issues: [],
    recommendations: [],
    specs: []
  };

  // Check segment duration (should be close to target duration)
  if (actualDuration > 0) {
    // For byte-range segments or when we have explicit duration, check against HLS requirements
    if (actualDuration < 2) {
      analysis.hls.issues.push('Segment duration is less than 2 seconds (not recommended)');
      analysis.hls.recommendations.push('Consider increasing segment duration to at least 2 seconds for better compatibility');
      analysis.hls.specs.push({
        section: '4.3.3.1',
        description: 'Target duration requirements',
        url: 'https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.3.1'
      });
    } else if (actualDuration > 10) {
      analysis.hls.issues.push('Segment duration exceeds 10 seconds');
      analysis.hls.recommendations.push('Consider reducing segment duration to 10 seconds or less');
      analysis.hls.specs.push({
        section: '4.3.3.1',
        description: 'Target duration requirements',
        url: 'https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.3.1'
      });
    }
    
    // If this is a segment (not the full file), check duration consistency
    if (analysis.format.isSegment && targetDuration > 0 && Math.abs(actualDuration - targetDuration) > targetDuration * 0.1) {
      analysis.hls.issues.push(`Segment duration (${actualDuration.toFixed(2)}s) differs from target duration by more than 10%`);
      analysis.hls.recommendations.push('Ensure consistent segment durations across the playlist');
    }
  }

  // Check video codec compliance
  if (analysis.video.codecName) {
    const videoCodec = analysis.video.codecName.toLowerCase();
    if (!['h264', 'hevc', 'h265'].includes(videoCodec)) {
      analysis.hls.compliant = false;
      analysis.hls.issues.push(`Video codec ${analysis.video.codecName} is not standard for HLS`);
      analysis.hls.recommendations.push('Use H.264 (AVC) or H.265 (HEVC) video codec');
      analysis.hls.specs.push({
        section: '4.3.4.2',
        description: 'CODECS attribute in EXT-X-STREAM-INF',
        url: 'https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.4.2'
      });
    }

    // Check keyframe interval
    if (analysis.video.frameRate && actualDuration > 0) {
      const expectedKeyframeInterval = actualDuration;
      const gopSize = analysis.video.gopSize || 0;
      const frameRate = analysis.video.frameRate;
      const keyframeInterval = gopSize / frameRate;
      
      if (gopSize > 0 && Math.abs(keyframeInterval - expectedKeyframeInterval) > 0.5) {
        analysis.hls.issues.push(`Keyframe interval (${keyframeInterval.toFixed(2)}s) doesn't align with segment duration`);
        analysis.hls.recommendations.push('Align keyframe interval with segment duration for optimal performance');
        analysis.hls.specs.push({
          section: '4.3.3.6',
          description: 'I-frame playlist requirements',
          url: 'https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.3.6'
        });
      }
    }
  }

  // Check audio codec compliance
  if (analysis.audio.codecName) {
    const audioCodec = analysis.audio.codecName.toLowerCase();
    if (!['aac', 'mp3', 'ac3', 'eac3', 'ac-3', 'e-ac-3'].includes(audioCodec)) {
      analysis.hls.compliant = false;
      analysis.hls.issues.push(`Audio codec ${analysis.audio.codecName} is not standard for HLS`);
      analysis.hls.recommendations.push('Use AAC, MP3, AC-3, or E-AC-3 audio codec');
      analysis.hls.specs.push({
        section: '4.3.4.2',
        description: 'CODECS attribute in EXT-X-STREAM-INF',
        url: 'https://datatracker.ietf.org/doc/html/rfc8216#section-4.3.4.2'
      });
    }
  }

  // Check container format
  if (analysis.format.formatName && !analysis.format.formatName.includes('mpegts')) {
    analysis.hls.issues.push('Container format should be MPEG-TS for HLS segments');
    analysis.hls.recommendations.push('Use MPEG-TS container format for maximum compatibility');
    analysis.hls.specs.push({
      section: '3.1',
      description: 'Media segment format',
      url: 'https://datatracker.ietf.org/doc/html/rfc8216#section-3.1'
    });
  }

  // Set overall compliance
  if (analysis.hls.issues.length > 0) {
    analysis.hls.compliant = false;
  }

  return analysis;
}

function analyzeAggregateData(results: any[]): any {
  if (results.length === 0) return null;

  const aggregate = {
    totalSegments: results.length,
    consistency: {
      duration: { min: Infinity, max: -Infinity, avg: 0, consistent: true },
      bitrate: { min: Infinity, max: -Infinity, avg: 0, consistent: true },
      resolution: [] as string[],
      codecs: { video: [] as string[], audio: [] as string[] }
    },
    averages: {
      duration: 0,
      bitrate: 0,
      keyframeInterval: 0
    },
    issues: {
      total: 0,
      byType: {} as Record<string, number>
    },
    recommendations: [] as string[]
  };

  // Use temporary sets for collecting unique values
  const tempSets = {
    resolution: new Set<string>(),
    videoCodecs: new Set<string>(),
    audioCodecs: new Set<string>(),
    recommendations: new Set<string>()
  };

  // Track counts for proper averaging
  let durationCount = 0;
  let bitrateCount = 0;

  // Analyze each segment
  results.forEach(result => {
    const analysis = result.analysis;
    
    // Duration consistency
    if (analysis.format && analysis.format.duration) {
      const duration = analysis.format.duration;
      aggregate.consistency.duration.min = Math.min(aggregate.consistency.duration.min, duration);
      aggregate.consistency.duration.max = Math.max(aggregate.consistency.duration.max, duration);
      aggregate.averages.duration += duration;
      durationCount++;
    }

    // Bitrate consistency
    if (analysis.format && analysis.format.bitRate) {
      const bitrate = analysis.format.bitRate;
      aggregate.consistency.bitrate.min = Math.min(aggregate.consistency.bitrate.min, bitrate);
      aggregate.consistency.bitrate.max = Math.max(aggregate.consistency.bitrate.max, bitrate);
      aggregate.averages.bitrate += bitrate;
      bitrateCount++;
    }

    // Resolution and codec tracking
    if (analysis.video && analysis.video.width && analysis.video.height) {
      tempSets.resolution.add(`${analysis.video.width}x${analysis.video.height}`);
    }
    if (analysis.video && analysis.video.codecName) {
      tempSets.videoCodecs.add(analysis.video.codecName);
    }
    if (analysis.audio && analysis.audio.codecName) {
      tempSets.audioCodecs.add(analysis.audio.codecName);
    }

    // Aggregate issues
    if (analysis.hls && analysis.hls.issues) {
      aggregate.issues.total += analysis.hls.issues.length;
      analysis.hls.issues.forEach((issue: string) => {
        const type = issue.split(':')[0];
        aggregate.issues.byType[type] = (aggregate.issues.byType[type] || 0) + 1;
      });
    }

    // Collect recommendations
    if (analysis.hls && analysis.hls.recommendations) {
      analysis.hls.recommendations.forEach((rec: string) => {
        tempSets.recommendations.add(rec);
      });
    }
  });

  // Calculate averages
  if (durationCount > 0) {
    aggregate.averages.duration /= durationCount;
    aggregate.consistency.duration.avg = aggregate.averages.duration;
    
    // Check consistency
    const durationVariance = (aggregate.consistency.duration.max - aggregate.consistency.duration.min) / aggregate.consistency.duration.avg;
    aggregate.consistency.duration.consistent = durationVariance < 0.1; // 10% variance threshold
  } else {
    aggregate.consistency.duration.min = 0;
    aggregate.consistency.duration.max = 0;
    aggregate.consistency.duration.consistent = true;
  }

  if (bitrateCount > 0) {
    aggregate.averages.bitrate /= bitrateCount;
    aggregate.consistency.bitrate.avg = aggregate.averages.bitrate;
    
    const bitrateVariance = (aggregate.consistency.bitrate.max - aggregate.consistency.bitrate.min) / aggregate.consistency.bitrate.avg;
    aggregate.consistency.bitrate.consistent = bitrateVariance < 0.2; // 20% variance threshold
  } else {
    aggregate.consistency.bitrate.min = 0;
    aggregate.consistency.bitrate.max = 0;
    aggregate.consistency.bitrate.consistent = true;
  }

  // Convert sets to arrays for JSON serialization
  aggregate.consistency.resolution = Array.from(tempSets.resolution);
  aggregate.consistency.codecs.video = Array.from(tempSets.videoCodecs);
  aggregate.consistency.codecs.audio = Array.from(tempSets.audioCodecs);
  aggregate.recommendations = Array.from(tempSets.recommendations);

  return aggregate;
} 