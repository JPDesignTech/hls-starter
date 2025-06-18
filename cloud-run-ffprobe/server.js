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

    if (detailed) {
      ffprobeCmd.push(
        '-count_frames',
        '-count_packets',
        '-show_frames',
        '-read_intervals %+2'
      );
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