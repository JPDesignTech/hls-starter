const express = require('express');
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const http = require('http');

console.log('Starting FFprobe service...');
console.log('Node version:', process.version);
console.log('PORT environment variable:', process.env.PORT);

const execAsync = promisify(exec);
const app = express();

app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'ffprobe-analyzer' });
});

// Check FFprobe availability at startup
exec('ffprobe -version', (error, stdout, stderr) => {
  if (error) {
    console.error('FFprobe not found:', error);
  } else {
    console.log('FFprobe version:', stdout.split('\n')[0]);
  }
});

// Helper function to download a file
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {}); // Delete the file on error
      reject(err);
    });
  });
}

// Main probe endpoint
app.post('/probe', async (req, res) => {
  let tempFiles = [];
  
  try {
    const { url, initUrl, detailed = false } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    let targetFile = url;
    
    // Handle fMP4 segments with initialization segment
    if (initUrl && url.match(/\.(m4s|mp4)$/i)) {
      console.log('Processing fMP4 segment with initialization...');
      
      const tempDir = os.tmpdir();
      const initFile = path.join(tempDir, `init_${Date.now()}.mp4`);
      const segmentFile = path.join(tempDir, `segment_${Date.now()}.m4s`);
      const combinedFile = path.join(tempDir, `combined_${Date.now()}.mp4`);
      
      tempFiles = [initFile, segmentFile, combinedFile];
      
      try {
        // Download both files
        console.log('Downloading init segment:', initUrl);
        await downloadFile(initUrl, initFile);
        
        console.log('Downloading media segment:', url);
        await downloadFile(url, segmentFile);
        
        // Concatenate files (init + segment)
        console.log('Concatenating segments...');
        await execAsync(`cat "${initFile}" "${segmentFile}" > "${combinedFile}"`);
        
        targetFile = combinedFile;
      } catch (downloadError) {
        console.error('Error processing fMP4:', downloadError);
        // Fall back to analyzing just the segment
        targetFile = url;
      }
    }

    // Construct ffprobe command
    const ffprobeCmd = [
      'ffprobe',
      '-v quiet',
      '-print_format json',
      '-show_format',
      '-show_streams',
    ];

    // Handle specific options if provided
    const showFrames = req.body.showFrames !== undefined ? req.body.showFrames : detailed;
    const showPackets = req.body.showPackets !== undefined ? req.body.showPackets : false;

    if (detailed || showFrames || showPackets) {
      if (showFrames) {
        ffprobeCmd.push(
          '-count_frames',
          '-show_frames',
          '-read_intervals %+2'
        );
      }
      if (showPackets) {
        ffprobeCmd.push(
          '-count_packets',
          '-show_packets'
        );
      }
      // If detailed is true but no specific flags, add both
      if (detailed && !showFrames && !showPackets) {
        ffprobeCmd.push(
          '-count_frames',
          '-count_packets',
          '-show_frames',
          '-read_intervals %+2'
        );
      }
    } else {
      ffprobeCmd.push(
        '-show_programs',
        '-show_chapters'
      );
    }

    ffprobeCmd.push(`"${targetFile}"`);
    const command = ffprobeCmd.join(' ');

    console.log('Running ffprobe:', command);
    
    const maxBuffer = detailed ? 10 * 1024 * 1024 : 2 * 1024 * 1024;
    const { stdout, stderr } = await execAsync(command, { maxBuffer });

    if (stderr) {
      console.error('FFprobe stderr:', stderr);
    }

    const probeData = JSON.parse(stdout);
    
    res.json({
      success: true,
      data: probeData,
      metadata: {
        detailed,
        url,
        initUrl,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Probe error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code
    });
  } finally {
    // Clean up temp files
    tempFiles.forEach(file => {
      try {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      } catch (err) {
        console.error('Error cleaning up temp file:', file, err);
      }
    });
  }
});

// Frame extraction endpoint
app.post('/extract-frame', async (req, res) => {
  let tempFiles = [];
  
  try {
    const { url, frameNumber, time, streamIndex = 0 } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Download video file if it's a URL
    let targetFile = url;
    const tempDir = os.tmpdir();
    let downloadedFile = null;
    
    // If it's a URL (not a local file path), download it
    if (url.startsWith('http://') || url.startsWith('https://')) {
      downloadedFile = path.join(tempDir, `video_${Date.now()}_${Math.random().toString(36).substring(7)}.mp4`);
      tempFiles.push(downloadedFile);
      
      console.log('Downloading video file for frame extraction:', url);
      await downloadFile(url, downloadedFile);
      targetFile = downloadedFile;
    }

    // Determine extraction method: use time if provided, otherwise use frame number
    const outputFile = path.join(tempDir, `frame_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`);
    tempFiles.push(outputFile);

    // Build FFMPEG command parts
    let ffmpegCmdParts = ['ffmpeg'];
    
    // Add input file first (required before any input options)
    ffmpegCmdParts.push('-i', targetFile);
    
    // Add time-based or frame-number-based selection (input options go after -i)
    if (time !== undefined && time !== null) {
      // Extract frame at specific timestamp (preferred method)
      // Note: -ss before -i is faster (seeking), but -ss after -i is more accurate
      ffmpegCmdParts.push('-ss', String(time));
      ffmpegCmdParts.push('-vframes', '1');
    } else if (frameNumber !== undefined && frameNumber !== null) {
      // Extract frame by frame number
      ffmpegCmdParts.push('-vf', `select=eq(n\\,${frameNumber})`);
      ffmpegCmdParts.push('-vframes', '1');
    } else {
      return res.status(400).json({ error: 'Either time or frameNumber is required' });
    }
    
    // Always select video stream for output (frames can only be extracted from video streams)
    // Use -map 0:v:0 to select first video stream
    // Note: streamIndex parameter is ignored for frame extraction since we always need video
    ffmpegCmdParts.push('-map', '0:v:0');
    
    // Add output options
    ffmpegCmdParts.push('-q:v', '2'); // High quality JPEG
    ffmpegCmdParts.push('-f', 'image2');
    ffmpegCmdParts.push(outputFile);
    
    const command = ffmpegCmdParts.join(' ');

    console.log('Running ffmpeg:', command);
    
    const { stdout, stderr } = await execAsync(command, { maxBuffer: 10 * 1024 * 1024 });

    if (stderr && !stderr.includes('frame=')) {
      console.warn('FFmpeg stderr:', stderr);
    }

    // Check if output file was created
    if (!fs.existsSync(outputFile)) {
      throw new Error('Frame extraction failed: output file not created');
    }

    // Read the image file and convert to base64
    const imageBuffer = fs.readFileSync(outputFile);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    res.json({
      success: true,
      frameUrl: dataUrl,
      dataUrl: dataUrl,
      cached: false,
      timestamp: time,
      frameNumber: frameNumber,
      size: imageBuffer.length
    });

  } catch (error) {
    console.error('Frame extraction error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code
    });
  } finally {
    // Clean up temp files
    tempFiles.forEach(file => {
      try {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      } catch (err) {
        console.error('Error cleaning up temp file:', file, err);
      }
    });
  }
});

// Bitstream extraction endpoint
app.post('/extract-bitstream', async (req, res) => {
  let tempFiles = [];
  
  try {
    const { url, streamIndex = 0, format = 'hex', codec, byteRange } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    // Validate byteRange if provided
    let startByte = 0;
    let endByte = null;
    if (byteRange) {
      if (typeof byteRange === 'object' && byteRange.start !== undefined) {
        startByte = parseInt(byteRange.start, 10);
        endByte = byteRange.end !== undefined ? parseInt(byteRange.end, 10) : null;
      } else if (typeof byteRange === 'string') {
        // Parse "start-end" format
        const parts = byteRange.split('-');
        startByte = parseInt(parts[0], 10);
        endByte = parts[1] ? parseInt(parts[1], 10) : null;
      }
      if (isNaN(startByte) || startByte < 0) {
        return res.status(400).json({ error: 'Invalid byteRange.start' });
      }
      if (endByte !== null && (isNaN(endByte) || endByte <= startByte)) {
        return res.status(400).json({ error: 'Invalid byteRange.end' });
      }
    }

    // Download video file if it's a URL
    let targetFile = url;
    const tempDir = os.tmpdir();
    let downloadedFile = null;
    
    // If it's a URL (not a local file path), download it
    if (url.startsWith('http://') || url.startsWith('https://')) {
      downloadedFile = path.join(tempDir, `video_${Date.now()}_${Math.random().toString(36).substring(7)}.mp4`);
      tempFiles.push(downloadedFile);
      
      console.log('Downloading video file for bitstream extraction:', url);
      await downloadFile(url, downloadedFile);
      targetFile = downloadedFile;
    }

    // Determine codec from parameter or detect from file
    let detectedCodec = codec;
    if (!detectedCodec) {
      // Quick probe to detect codec
      try {
        const probeCmd = `ffprobe -v quiet -select_streams v:${streamIndex} -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 "${targetFile}"`;
        const { stdout } = await execAsync(probeCmd, { maxBuffer: 1024 * 1024 });
        detectedCodec = stdout.trim().toLowerCase();
      } catch (err) {
        console.warn('Could not detect codec, defaulting to h264:', err);
        detectedCodec = 'h264';
      }
    }

    // Determine output format and bitstream filter
    let outputExt = '.h264';
    let bsfFilter = 'h264_mp4toannexb';
    let outputFormat = 'h264';
    
    if (detectedCodec === 'hevc' || detectedCodec === 'h265') {
      outputExt = '.hevc';
      bsfFilter = 'hevc_mp4toannexb';
      outputFormat = 'hevc';
    }

    const outputFile = path.join(tempDir, `bitstream_${Date.now()}_${Math.random().toString(36).substring(7)}${outputExt}`);
    tempFiles.push(outputFile);

    // Build FFMPEG command to extract bitstream
    const ffmpegCmdParts = [
      'ffmpeg',
      '-i', `"${targetFile}"`,
      '-c:v', 'copy',
      '-bsf:v', bsfFilter,
      '-f', outputFormat,
      '-map', `0:v:${streamIndex}`,
      `"${outputFile}"`
    ];
    
    const command = ffmpegCmdParts.join(' ');

    console.log('Running ffmpeg for bitstream extraction:', command);
    
    const { stdout, stderr } = await execAsync(command, { maxBuffer: 10 * 1024 * 1024 });

    if (stderr && !stderr.includes('frame=')) {
      console.warn('FFmpeg stderr:', stderr);
    }

    // Check if output file was created
    if (!fs.existsSync(outputFile)) {
      throw new Error('Bitstream extraction failed: output file not created');
    }

    // Read the bitstream file
    const fullBuffer = fs.readFileSync(outputFile);
    const totalSize = fullBuffer.length;
    
    // Apply byte range if specified
    let bitstreamBuffer = fullBuffer;
    let actualStartByte = 0;
    let actualEndByte = totalSize;
    
    if (byteRange && (startByte > 0 || endByte !== null)) {
      actualStartByte = Math.min(startByte, totalSize);
      actualEndByte = endByte !== null ? Math.min(endByte, totalSize) : totalSize;
      
      if (actualStartByte >= actualEndByte) {
        return res.status(400).json({ 
          error: `Invalid byte range: ${actualStartByte}-${actualEndByte} (file size: ${totalSize})` 
        });
      }
      
      bitstreamBuffer = fullBuffer.slice(actualStartByte, actualEndByte);
    }
    
    // Convert to requested format
    let bitstreamData;
    if (format === 'base64') {
      bitstreamData = bitstreamBuffer.toString('base64');
    } else {
      // Default to hex
      bitstreamData = bitstreamBuffer.toString('hex');
    }

    res.json({
      success: true,
      bitstream: bitstreamData,
      format: format,
      codec: detectedCodec,
      size: totalSize,
      chunkSize: bitstreamBuffer.length,
      byteRange: byteRange ? {
        start: actualStartByte,
        end: actualEndByte,
        requested: { start: startByte, end: endByte }
      } : null,
      cached: false
    });

  } catch (error) {
    console.error('Bitstream extraction error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code
    });
  } finally {
    // Clean up temp files
    tempFiles.forEach(file => {
      try {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      } catch (err) {
        console.error('Error cleaning up temp file:', file, err);
      }
    });
  }
});

const PORT = process.env.PORT || 8080;

// Error handling for server startup
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`FFprobe service listening on port ${PORT}`);
  console.log('Service ready to accept requests');
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
}); 