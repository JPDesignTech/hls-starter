# HLS Streaming Service - Proof of Concept

A modern HLS (HTTP Live Streaming) video streaming application built with Next.js 15, FFmpeg, and Google Cloud Storage. This project demonstrates adaptive bitrate streaming for both VOD (Video on Demand) and simulated live streaming scenarios.

## Features

### Phase 1: VOD HLS (Implemented)
- ✅ Video file upload interface
- ✅ Automatic transcoding to multiple quality levels (1080p, 720p, 480p, 360p)
- ✅ Adaptive bitrate streaming with HLS
- ✅ Custom video player with quality switching
- ✅ Progress tracking for upload and processing
- ✅ Support for both Google Cloud Storage and local storage

### Phase 2: Live Streaming (Coming Soon)
- 🚧 Real-time segment generation
- 🚧 Dynamic manifest updates
- 🚧 Low-latency streaming simulation

## Tech Stack

- [Next.js 15](https://nextjs.org/) with App Router
- [React 19](https://react.dev/)
- [FFmpeg](https://ffmpeg.org/) via fluent-ffmpeg for video processing
- [hls.js](https://github.com/video-dev/hls.js/) for video playback
- [Google Cloud Storage](https://cloud.google.com/storage) for segment hosting
- [Upstash Redis](https://upstash.com/) for metadata storage
- [Tailwind CSS v4](https://tailwindcss.com/) for styling
- [shadcn/ui](https://ui.shadcn.com/) for UI components

## Prerequisites

- Node.js 18.17.0 or later
- pnpm (recommended) or npm/yarn
- FFmpeg installed on your system
- Google Cloud account (optional, for cloud storage)
- Upstash Redis account (optional, for metadata storage)

## Installation

1. Clone the repository:
   ```bash
   git clone [your-repo-url]
   cd hls-starter
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Install FFmpeg:
   - **macOS**: `brew install ffmpeg`
   - **Ubuntu/Debian**: `sudo apt-get install ffmpeg`
   - **Windows**: Download from [ffmpeg.org](https://ffmpeg.org/download.html)

4. Set up environment variables:
   Create a `.env.local` file in the root directory:
   ```env
   # Redis (optional - will use in-memory storage if not provided)
   KV_REST_API_URL=your_redis_url
   KV_REST_API_TOKEN=your_redis_token

   # Google Cloud Storage (optional - will use local storage if not provided)
   GCS_BUCKET_NAME=your-bucket-name
   GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
   ```

5. Create necessary directories:
   ```bash
   mkdir -p uploads output public/streams
   ```

6. Start the development server:
   ```bash
   pnpm dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
hls-starter/
├── app/
│   ├── api/
│   │   ├── upload/         # Video upload endpoint
│   │   └── process/        # Video processing endpoint
│   └── page.tsx           # Main upload interface
├── components/
│   ├── video-player.tsx   # HLS video player component
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── ffmpeg.ts         # FFmpeg utilities for transcoding
│   ├── storage.ts        # Google Cloud Storage utilities
│   └── redis.ts          # Redis client configuration
├── uploads/              # Temporary upload directory
├── output/               # Temporary processing directory
└── public/streams/       # Local HLS segments (dev only)
```

## How It Works

### 1. Video Upload
Users upload video files through the web interface. Files are temporarily stored in the `uploads` directory.

### 2. Transcoding Process
FFmpeg processes the video into multiple quality levels:
- **1080p**: 5000k video bitrate, 192k audio
- **720p**: 2800k video bitrate, 128k audio
- **480p**: 1400k video bitrate, 128k audio
- **360p**: 800k video bitrate, 96k audio

Each quality level is segmented into 6-second `.ts` files with corresponding `.m3u8` playlists.

### 3. Adaptive Streaming
The video player uses hls.js to:
- Parse the master playlist
- Monitor network conditions
- Automatically switch between quality levels
- Provide smooth playback experience

### 4. Storage Options
- **Local Development**: Files stored in `public/streams/`
- **Production**: Files uploaded to Google Cloud Storage with proper caching headers

## API Endpoints

### POST `/api/upload`
Handles video file uploads.

**Request**: `multipart/form-data` with video file
**Response**: Upload confirmation with video ID

### POST `/api/process`
Initiates video transcoding and HLS packaging.

**Request**: `{ videoId: string }`
**Response**: HLS manifest URL and available qualities

## Configuration

### FFmpeg Settings
Edit quality presets in `lib/ffmpeg.ts`:
```typescript
export const QUALITY_PRESETS = [
  {
    name: '1080p',
    width: 1920,
    height: 1080,
    videoBitrate: '5000k',
    audioBitrate: '192k',
    // ... more settings
  },
  // ... more presets
];
```

### HLS Parameters
- Segment duration: 6 seconds
- Playlist type: VOD (Video on Demand)
- Codec: H.264 (video), AAC (audio)

## Deployment

### Vercel Deployment

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

Note: For production use with video processing, consider using:
- Vercel Functions Pro for longer execution times
- External processing service (e.g., Google Cloud Run)
- Background job queue for video processing

### Google Cloud Setup

1. Create a Google Cloud Storage bucket
2. Enable public access for HLS segments
3. Set up a service account with Storage Admin role
4. Download service account key and set in environment variables

## Security Considerations

- Implement file size limits for uploads
- Add authentication for upload functionality
- Use signed URLs for private content
- Implement rate limiting for API endpoints
- Validate file types and scan for malware

## Performance Optimization

- Use CDN for serving HLS segments
- Implement caching strategies for manifests
- Consider WebRTC for lower latency (Phase 2)
- Use hardware acceleration for FFmpeg when available

## Troubleshooting

### FFmpeg not found
Ensure FFmpeg is installed and available in your PATH:
```bash
ffmpeg -version
```

### Upload fails
- Check file size limits in Next.js config
- Ensure `uploads` directory has write permissions
- Verify enough disk space for processing

### Playback issues
- Check browser console for hls.js errors
- Verify CORS headers for cross-origin playback
- Ensure proper MIME types for `.m3u8` and `.ts` files

## Next Steps

### Phase 2 Implementation
- WebSocket integration for live updates
- Real-time transcoding pipeline
- Dynamic manifest generation
- Viewer analytics and metrics

### Production Considerations
- Implement proper error handling and recovery
- Add comprehensive logging and monitoring
- Set up automated testing for streaming scenarios
- Implement content delivery optimization

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Resources

- [HLS Specification](https://datatracker.ietf.org/doc/html/rfc8216)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [hls.js Documentation](https://github.com/video-dev/hls.js/tree/master/docs)
- [Adaptive Bitrate Streaming Guide](https://developer.apple.com/documentation/http_live_streaming)
