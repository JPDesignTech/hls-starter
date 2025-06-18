# BeemMeUp - HLS Streaming Service

A modern HLS (HTTP Live Streaming) video streaming application built with Next.js 15, Google Cloud Platform services, and adaptive bitrate streaming. Upload videos to automatically generate multi-quality HLS streams with deep analysis capabilities.

## 🚀 Features

### Core Functionality
- ✅ **Multiple Upload Methods**
  - Direct upload to Google Cloud Storage
  - External HLS URL analysis
- ✅ **Automatic Transcoding** via Google Cloud Transcoder API
  - 1080p (5Mbps), 720p (2.8Mbps), 480p (1.4Mbps), 360p (800Kbps)
  - HLS packaging with 6-second segments
- ✅ **Adaptive Bitrate Streaming**
  - HLS.js player with automatic quality switching
  - Network-aware streaming optimization
- ✅ **Deep HLS Analysis**
  - Segment-level inspection with FFprobe
  - Quality level analysis
  - Bitrate and codec information
  - Frame-accurate segment details

### Phase 2: Live Streaming (Coming Soon)
🚧 Real-time segment generation  
🚧 Dynamic manifest updates  
🚧 Low-latency streaming simulation  
### Advanced Features
- 🔍 Real-time processing status tracking
- 📊 Comprehensive HLS manifest analyzer
- 🎯 Support for both TS and fMP4 segments
- 🌐 HLS proxy for external playlist analysis
- 💾 Persistent video history with Redis

## 🏗️ System Architecture

### High-Level Overview
```mermaid
graph TB
    subgraph "Client Browser"
        UI[BeemMeUp UI]
        Player[HLS.js Player]
        Analyzer[HLS Analyzer]
    end

    subgraph "Next.js Backend"
        API[API Routes]
        Proxy[HLS Proxy]
    end

    subgraph "Google Cloud Platform"
        GCS[(Google Cloud Storage)]
        Transcoder[Cloud Transcoder API]
        CloudRun[Cloud Run<br/>FFprobe Service]
    end

    subgraph "External Services"
        Redis[(Upstash Redis)]
        ExtHLS[External HLS Sources]
    end

    %% Upload Flow
    UI -->|"1. Upload Video"| API
    API -->|"2. Store Original"| GCS
    API -->|"3. Create Job"| Transcoder
    Transcoder -->|"4. Process Video"| GCS
    API -->|"5. Store Metadata"| Redis

    %% Playback Flow
    Player -->|"Request Segments"| GCS
    Player -->|"Request Manifest"| Proxy
    Proxy -->|"Fetch & Process"| ExtHLS

    %% Analysis Flow
    Analyzer -->|"Probe Segments"| CloudRun
    CloudRun -->|"Download & Analyze"| GCS
    Analyzer -->|"Get Metadata"| API
    API -->|"Fetch Status"| Redis

    classDef google fill:#4285f4,stroke:#1a73e8,color:#fff
    classDef external fill:#9333ea,stroke:#7c3aed,color:#fff
    classDef client fill:#10b981,stroke:#059669,color:#fff
    classDef nextjs fill:#000,stroke:#333,color:#fff

    class GCS,Transcoder,CloudRun google
    class Redis,ExtHLS external
    class UI,Player,Analyzer client
    class API,Proxy nextjs
```

### Upload & Processing Flow
```mermaid
sequenceDiagram
    participant User
    participant UI as BeemMeUp UI
    participant API as Next.js API
    participant GCS as Google Cloud Storage
    participant Transcoder as Cloud Transcoder
    participant Redis as Upstash Redis
    participant CloudRun as FFprobe Service

    %% Upload Process
    User->>UI: Select Video File
    UI->>API: Request Signed URL
    API->>API: Generate Video ID
    API->>GCS: Create Signed URL
    GCS-->>API: Return Upload URL
    API-->>UI: Send Upload URL & Video ID
    
    UI->>GCS: Direct Upload (PUT)
    UI->>UI: Show Upload Progress
    GCS-->>UI: Upload Complete
    
    UI->>API: Notify Upload Complete
    API->>Redis: Store Initial Status
    
    %% Processing
    API->>Transcoder: Create Transcode Job<br/>(1080p, 720p, 480p, 360p)
    Transcoder->>GCS: Read Source Video
    Transcoder->>Transcoder: Encode Multiple Qualities
    Transcoder->>GCS: Write HLS Segments<br/>& Manifests
    
    %% Status Updates
    loop Check Status
        UI->>API: Poll Status
        API->>Transcoder: Get Job Status
        Transcoder-->>API: Return Progress
        API->>Redis: Update Metadata
        API-->>UI: Return Status
    end
    
    Transcoder->>API: Job Complete
    API->>Redis: Store Final Metadata
    API-->>UI: Video Ready
    
    %% Analysis
    User->>UI: Open Analyzer
    UI->>API: Get Video Info
    API->>Redis: Fetch Metadata
    Redis-->>API: Return Data
    API-->>UI: Video Details
    
    UI->>CloudRun: Analyze Segment
    CloudRun->>GCS: Download Segment
    CloudRun->>CloudRun: FFprobe Analysis
    CloudRun-->>UI: Return Analysis
```

### HLS Streaming Architecture
```mermaid
graph LR
    subgraph "HLS Structure in GCS"
        Master[master.m3u8<br/>Master Playlist]
        
        subgraph "Quality Levels"
            P1080[hls-1080p.m3u8]
            P720[hls-720p.m3u8]
            P480[hls-480p.m3u8]
            P360[hls-360p.m3u8]
        end
        
        subgraph "Video Segments"
            S1080[1080p segments<br/>*.ts files]
            S720[720p segments<br/>*.ts files]
            S480[480p segments<br/>*.ts files]
            S360[360p segments<br/>*.ts files]
        end
    end
    
    subgraph "Adaptive Streaming"
        Player[HLS.js Player]
        ABR[Adaptive<br/>Bitrate Logic]
        Buffer[Media Buffer]
    end
    
    Master -->|"References"| P1080
    Master -->|"References"| P720
    Master -->|"References"| P480
    Master -->|"References"| P360
    
    P1080 -->|"Points to"| S1080
    P720 -->|"Points to"| S720
    P480 -->|"Points to"| S480
    P360 -->|"Points to"| S360
    
    Player -->|"1. Fetch"| Master
    Player -->|"2. Parse"| ABR
    ABR -->|"3. Select Quality"| P720
    P720 -->|"4. Download"| S720
    S720 -->|"5. Decode"| Buffer
    Buffer -->|"6. Play"| Player
    
    ABR -.->|"Switch Quality<br/>Based on Bandwidth"| P1080
    ABR -.->|"Switch Quality<br/>Based on Bandwidth"| P480
    
    classDef playlist fill:#f59e0b,stroke:#d97706,color:#000
    classDef segment fill:#3b82f6,stroke:#2563eb,color:#fff
    classDef player fill:#10b981,stroke:#059669,color:#fff
    
    class Master,P1080,P720,P480,P360 playlist
    class S1080,S720,S480,S360 segment
    class Player,ABR,Buffer player
```

## 🛠️ Tech Stack

- **Frontend**
  - [Next.js 15](https://nextjs.org/) with App Router
  - [React 19](https://react.dev/)
  - [Tailwind CSS v4](https://tailwindcss.com/) for styling
  - [shadcn/ui](https://ui.shadcn.com/) for UI components
  - [hls.js](https://github.com/video-dev/hls.js/) for adaptive video playback

- **Backend Services**
  - [Google Cloud Storage](https://cloud.google.com/storage) for video and segment hosting
  - [Google Cloud Transcoder API](https://cloud.google.com/transcoder) for video processing
  - [Google Cloud Run](https://cloud.google.com/run) for FFprobe analysis service
  - [Upstash Redis](https://upstash.com/) for metadata and status tracking

- **Video Processing**
  - H.264 video codec with multiple quality presets
  - AAC audio codec
  - HLS packaging with 6-second segments
  - Support for both TS and fMP4 segment formats

## 📋 Prerequisites

- Node.js 18.17.0 or later
- pnpm (recommended) or npm/yarn
- Google Cloud Platform account with:
  - Cloud Storage bucket configured
  - Transcoder API enabled
  - Cloud Run service deployed (for FFprobe)
  - Service account with appropriate permissions
- Upstash Redis account (optional - for persistent storage)

## 🚀 Installation

1. Clone the repository:
   ```bash
   git clone [your-repo-url]
   cd hls-starter
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up Google Cloud Platform:
   - Create a GCS bucket for video storage
   - Enable the Cloud Transcoder API
   - Deploy the FFprobe service to Cloud Run:
     ```bash
     cd cloud-run-ffprobe
     ./deploy.sh
     ```
   - Create a service account with permissions for:
     - Storage Object Admin
     - Cloud Transcoder Admin

4. Set up environment variables:
   Create a `.env.local` file in the root directory:
   ```env
   # Google Cloud Platform
   GCP_PROJECT_ID=your-project-id
   GCS_BUCKET_NAME=your-bucket-name
   GCS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
   GCS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
   
   # Or use a service account key file
   GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
   
   # Cloud Run FFprobe Service URL
   FFPROBE_SERVICE_URL=https://your-ffprobe-service-url.run.app
   
   # Upstash Redis (optional - will use in-memory storage if not provided)
   KV_REST_API_URL=your_redis_url
   KV_REST_API_TOKEN=your_redis_token
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
hls-starter/
├── app/
│   ├── api/
│   │   ├── upload/         # Video upload endpoints
│   │   ├── process/        # Transcoding initiation
│   │   ├── hls-proxy/      # HLS playlist proxy
│   │   └── video/          # Video status and analysis
│   ├── video/[id]/analyze/ # HLS analyzer interface
│   └── page.tsx            # Main upload interface
├── components/
│   ├── video-player.tsx    # HLS.js video player
│   ├── direct-upload.tsx   # GCS direct upload
│   ├── chunked-upload.tsx  # Chunked upload handler
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── transcoder.ts       # Google Transcoder API client
│   ├── storage.ts          # Google Cloud Storage utilities
│   ├── redis.ts            # Upstash Redis client
│   └── gcs-config.ts       # GCS configuration
├── cloud-run-ffprobe/      # FFprobe analysis service
│   ├── server.js           # Express server
│   ├── Dockerfile          # Container configuration
│   └── deploy.sh           # Deployment script
└── public/                 # Static assets
```

## 🔄 How It Works

### 1. Video Upload Options

#### Direct Upload to GCS
- Client requests a signed URL from the API
- Video uploads directly to Google Cloud Storage
- No file size limitations
- Optimal for production use

#### Chunked Upload
- Large files split into manageable chunks
- Supports resume on failure
- Progress tracking per chunk

#### External HLS URL
- Analyze existing HLS playlists
- Proxy handles relative URL resolution
- Supports both TS and fMP4 formats

### 2. Video Processing Pipeline

The Google Cloud Transcoder API automatically:
- Reads the source video from GCS
- Encodes multiple quality levels in parallel:
  - **1080p**: 1920×1080, 5 Mbps, H.264 High Profile
  - **720p**: 1280×720, 2.8 Mbps, H.264 High Profile
  - **480p**: 854×480, 1.4 Mbps, H.264 Main Profile
  - **360p**: 640×360, 800 Kbps, H.264 Main Profile
- Packages output as HLS with:
  - 6-second segments
  - TS container format
  - Master playlist with all variants

### 3. Metadata Storage

Upstash Redis stores:
- Video processing status
- Transcoder job IDs
- HLS manifest URLs
- Quality level information
- Upload history

### 4. HLS Analysis

The analyzer provides:
- **Manifest Parsing**: Decode master and variant playlists
- **Segment Analysis**: Deep inspection via FFprobe on Cloud Run
- **Quality Metrics**: Bitrate, resolution, codec details
- **Timeline Visualization**: Segment duration and structure

### 5. Adaptive Streaming

The video player leverages hls.js to:
- Parse the master playlist
- Monitor bandwidth in real-time
- Switch between quality levels seamlessly
- Buffer segments intelligently
- Provide smooth playback across devices

## �� Configuration

### Google Cloud Transcoder Settings
The transcoder is configured in `lib/transcoder.ts` with the following presets:

```typescript
// Video quality presets
const videoStreams = [
  { resolution: '1920x1080', bitrate: 5000000, profile: 'high' },
  { resolution: '1280x720', bitrate: 2800000, profile: 'high' },
  { resolution: '854x480', bitrate: 1400000, profile: 'main' },
  { resolution: '640x360', bitrate: 800000, profile: 'main' }
];

// HLS packaging settings
const hlsSettings = {
  segmentDuration: 6,  // seconds
  gopDuration: 3,      // seconds
  container: 'ts',     // MPEG-TS format
  audioCodec: 'aac',
  audioChannels: 2,
  audioSampleRate: 48000
};
```

### Storage Configuration
- **Bucket Structure**: `/{videoId}/master.m3u8`, `/{videoId}/hls-{quality}.m3u8`
- **CORS Policy**: Configured for cross-origin playback
- **Cache Headers**: Optimized for CDN distribution

## 📡 API Endpoints

### Upload Management

#### POST `/api/upload/signed-url`
Generate a signed URL for direct browser-to-GCS upload.

**Request**:
```json
{
  "filename": "video.mp4",
  "contentType": "video/mp4"
}
```

**Response**:
```json
{
  "uploadUrl": "https://storage.googleapis.com/...",
  "videoId": "1234567890",
  "filename": "1234567890/source.mp4"
}
```

#### POST `/api/upload/chunk`
Handle chunked uploads for large files.

**Request**: `multipart/form-data` with chunk data

**Response**: Chunk confirmation with upload progress

### Processing

#### POST `/api/process`
Initiate video transcoding via Google Cloud Transcoder.

**Request**:
```json
{
  "videoId": "1234567890",
  "gcsPath": "1234567890/source.mp4"
}
```

**Response**:
```json
{
  "success": true,
  "url": "https://storage.googleapis.com/.../master.m3u8",
  "jobName": "projects/.../jobs/...",
  "qualities": [
    { "name": "1080p", "resolution": "1920x1080", "bitrate": "5000k" },
    { "name": "720p", "resolution": "1280x720", "bitrate": "2800k" },
    { "name": "480p", "resolution": "854x480", "bitrate": "1400k" },
    { "name": "360p", "resolution": "640x360", "bitrate": "800k" }
  ]
}
```

### Analysis

#### GET `/api/video/{id}/status`
Get video processing status and metadata.

**Response**:
```json
{
  "id": "1234567890",
  "status": "ready",
  "url": "https://storage.googleapis.com/.../master.m3u8",
  "transcoderJobName": "projects/.../jobs/...",
  "processedAt": "2024-01-01T00:00:00Z"
}
```

#### POST `/api/video/{id}/probe-segment`
Analyze HLS segment with FFprobe (via Cloud Run).

**Request**:
```json
{
  "url": "https://example.com/segment.ts",
  "detailed": true,
  "byteRange": { "offset": 0, "length": 1024 }
}
```

### HLS Proxy

#### GET `/api/hls-proxy?url={playlistUrl}`
Proxy and rewrite HLS playlists for CORS and relative URL handling.

## 🚀 Deployment

### Prerequisites
1. Google Cloud Project with billing enabled
2. APIs enabled:
   - Cloud Storage API
   - Cloud Transcoder API
   - Cloud Run API
3. Service account with required permissions

### Deploy to Vercel

1. Fork this repository
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy:
   ```bash
   vercel --prod
   ```

### Deploy FFprobe Service to Cloud Run

```bash
cd cloud-run-ffprobe

# Build and deploy
gcloud run deploy ffprobe-analyzer \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --timeout 60s
```

### Production Considerations

#### Performance
- Enable Cloud CDN for GCS bucket
- Use regional buckets close to users
- Configure appropriate CORS policies
- Set up Cloud Load Balancing

#### Security
- Implement authentication for uploads
- Use signed URLs with expiration
- Enable audit logging
- Set up VPC Service Controls

#### Monitoring
- Cloud Monitoring for API metrics
- Cloud Logging for error tracking
- Uptime checks for services
- Custom dashboards for video metrics

## 🔍 Troubleshooting

### Common Issues

#### Transcoder Job Fails
- Check service account permissions
- Verify input video format is supported
- Check Cloud Transcoder quotas
- Review job logs in Cloud Console

#### FFprobe Service Timeout
- Increase Cloud Run timeout settings
- Check segment download speed
- Verify Cloud Run memory allocation
- Review service logs

#### CORS Errors
- Verify GCS bucket CORS configuration
- Check HLS proxy is working
- Ensure proper headers in responses

#### Upload Failures
- Check GCS bucket permissions
- Verify signed URL expiration
- Monitor browser console for errors
- Check file size limits

## 🎯 Performance Optimization

### Video Delivery
- **Cloud CDN**: Enable for GCS bucket
- **Multi-Region**: Replicate popular content
- **Compression**: Use gzip for manifests
- **Caching**: Set appropriate cache headers

### Processing
- **Parallel Encoding**: Transcoder handles automatically
- **Regional Resources**: Use same region for all services
- **Optimization**: Tune encoding presets for content type

### Frontend
- **Lazy Loading**: Load player only when needed
- **Preload**: Prefetch initial segments
- **Buffer Strategy**: Tune based on audience
- **Quality Selection**: Smart initial quality selection

## 🔒 Security Best Practices

1. **Authentication**
   - Implement user authentication
   - Use OAuth 2.0 for API access
   - Rotate service account keys

2. **Authorization**
   - Implement role-based access
   - Use signed URLs for uploads
   - Restrict bucket access

3. **Data Protection**
   - Enable encryption at rest
   - Use HTTPS everywhere
   - Implement DRM if needed

4. **Monitoring**
   - Enable audit logging
   - Set up alerts for anomalies
   - Regular security reviews

## 🚧 Roadmap

- [ ] Live streaming support
- [ ] Real-time transcoding
- [ ] Multi-audio track support
- [ ] Subtitle/caption support
- [ ] DRM integration
- [ ] Analytics dashboard
- [ ] Webhook notifications
- [ ] Batch processing
- [ ] Mobile SDKs

## 📄 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 Resources

- [Google Cloud Transcoder Documentation](https://cloud.google.com/transcoder/docs)
- [HLS Specification (RFC 8216)](https://datatracker.ietf.org/doc/html/rfc8216)
- [Google Cloud Storage Best Practices](https://cloud.google.com/storage/docs/best-practices)
- [hls.js Documentation](https://github.com/video-dev/hls.js/tree/master/docs)
- [Adaptive Bitrate Streaming Guide](https://developer.apple.com/documentation/http_live_streaming)

## 🙏 Acknowledgments

Built with amazing open-source projects, having fun @[Descript](https://www.descript.com), and Google Cloud Platform services
