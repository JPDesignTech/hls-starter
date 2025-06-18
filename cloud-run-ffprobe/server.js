const express = require('express');
const { exec } = require('child_process');
const { promisify } = require('util');

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

// Main probe endpoint
app.post('/probe', async (req, res) => {
  try {
    const { url, detailed = false } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
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

    ffprobeCmd.push(`"${url}"`);
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