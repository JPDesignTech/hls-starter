# "What the FFMPEG" Visualizer Tool - Implementation Plan

## Overview
A comprehensive FFMPEG visualizer tool that provides extremely detailed analysis of media files using FFProbe, FFPlay, and FFMPEG. Inspired by StreamEye's detailed stream analysis capabilities, this tool will visualize every aspect of media files including codec information, frame-level data, bitstream analysis, and more.

**This plan reuses existing infrastructure and patterns from the BeemMeUp codebase.**

## Table of Contents
1. [Existing Infrastructure & Patterns](#existing-infrastructure--patterns)
2. [Architecture](#architecture)
3. [Features & Components](#features--components)
4. [API Endpoints](#api-endpoints)
5. [UI/UX Design](#uiux-design)
6. [Implementation Phases](#implementation-phases)
7. [Technical Details](#technical-details)

---

## Quick Start: Reusing Existing Infrastructure

### ✅ What We're Reusing

1. **Upload Flow**: 
   - `/api/upload/signed-url` → Direct GCS upload → `/api/upload/complete`
   - Component: `DirectUpload` (extend for audio/image support)

2. **FFProbe Service**: 
   - Cloud Run service at `FFPROBE_SERVICE_URL`
   - Pattern: POST to service with `{ url, initUrl, detailed }`
   - Existing wrapper: `/app/api/video/[id]/probe-segment/route.ts`

3. **Storage**:
   - GCS: `{videoId}/original.{ext}` structure
   - Redis: `video:{videoId}` keys (add `wtf:{fileId}` for WTF data)

4. **UI Components**:
   - All shadcn/ui components (Card, Button, Progress, etc.)
   - Styling patterns: `bg-white/10 backdrop-blur-lg`
   - Icons: `lucide-react`

5. **Utilities**:
   - `/lib/storage.ts`: GCS operations
   - `/lib/redis.ts`: Redis client with fallback
   - `/lib/gcs-config.ts`: GCS configuration

### 🆕 What We're Adding

1. **New Routes**: `/app/what-the-ffmpeg/` section
2. **Enhanced APIs**: WTF-specific endpoints (extend existing patterns)
3. **New Components**: Specialized viewers (follow existing component patterns)
4. **New Dependencies**: Charts, hex viewer, virtualization libraries

---

## Existing Infrastructure & Patterns

### ✅ Reusable Components & Utilities

#### Upload Infrastructure
- **`/components/direct-upload.tsx`**: Reusable upload component with progress tracking
- **`/lib/storage.ts`**: GCS utilities (`uploadFile`, `getSignedUrl`, `downloadFromGCS`)
- **`/lib/gcs-config.ts`**: GCS configuration and initialization
- **Pattern**: Signed URL → Direct PUT → Complete notification → Redis storage

#### FFProbe Integration
- **Cloud Run Service**: Already deployed at `FFPROBE_SERVICE_URL`
- **`/app/api/video/[id]/probe-segment/route.ts`**: Existing FFProbe wrapper
- **Pattern**: POST to `${FFPROBE_SERVICE_URL}/probe` with `{ url, initUrl, detailed }`
- **Analysis Functions**: Already has `analyzeHLSSegment()` function we can extend

#### Storage & Metadata
- **`/lib/redis.ts`**: Redis client with in-memory fallback
- **Pattern**: Store metadata with `video:{videoId}` keys
- **GCS Structure**: `{videoId}/original.{ext}` for uploaded files

#### UI Components (shadcn/ui)
- **Available**: `Card`, `Button`, `Progress`, `Input`, `Label`, `Dialog`, `Popover`, `Alert`
- **Styling Pattern**: `bg-white/10 backdrop-blur-lg border-white/20` for cards
- **Icons**: `lucide-react` (already in use)

### 🔄 Patterns to Follow

#### Upload Flow Pattern
```typescript
// 1. Get signed URL
POST /api/upload/signed-url
{ filename, contentType }
→ { uploadUrl, videoId, filename }

// 2. Direct upload to GCS
PUT {uploadUrl} (with file)

// 3. Complete notification
POST /api/upload/complete
{ videoId, filename, size, type }
→ Store in Redis: video:{videoId}
```

#### FFProbe Pattern
```typescript
// Call Cloud Run FFProbe service
POST ${FFPROBE_SERVICE_URL}/probe
{
  url: string,
  initUrl?: string,
  detailed?: boolean
}
→ {
  success: boolean,
  data: FFProbeOutput,
  metadata: { detailed, url, timestamp }
}
```

#### Component Pattern
```typescript
// Parent-child communication via callbacks
interface ComponentProps {
  onUploadComplete?: (videoId: string, filename: string) => void;
  onVideoAdded?: (video: VideoInfo) => void;
  onVideoUpdated?: (videoId: string, updates: Partial<VideoInfo>) => void;
}
```

#### Error Handling Pattern
```typescript
try {
  // operation
} catch (error) {
  console.error('Error:', error);
  setError(error instanceof Error ? error.message : 'Unknown error');
  // Update parent via callback
  if (onVideoUpdated) {
    onVideoUpdated(videoId, { status: 'error', error: ... });
  }
}
```

### 📦 Dependencies Already Available
- `fluent-ffmpeg` - FFMPEG wrapper (though we use Cloud Run FFProbe)
- `@google-cloud/storage` - GCS client
- `@upstash/redis` - Redis client
- `uuid` - UUID generation
- `lucide-react` - Icons
- `next` - Framework
- `react` - UI library
- `tailwindcss` - Styling

### 🆕 Dependencies to Add
- `recharts` or `chart.js` - For data visualizations
- `react-hex-view` or custom hex viewer - For bitstream display
- `react-virtualized` or `react-window` - For large lists (frames/packets)
- `file-saver` - For export functionality
- `jspdf` - For PDF report generation (optional)

---

## Architecture

### Route Structure
```
/app/what-the-ffmpeg/
  ├── page.tsx                    # Main landing/upload page
  ├── [fileId]/
  │   ├── page.tsx                # Analysis dashboard
  │   ├── overview/
  │   │   └── page.tsx            # High-level overview
  │   ├── streams/
  │   │   └── page.tsx            # Stream analysis (video/audio/subtitle)
  │   ├── frames/
  │   │   └── page.tsx            # Frame-by-frame analysis
  │   ├── packets/
  │   │   └── page.tsx            # Packet-level inspection
  │   ├── bitstream/
  │   │   └── page.tsx            # Bitstream visualization
  │   ├── codec/
  │   │   └── page.tsx            # Codec-specific analysis
  │   └── timeline/
  │       └── page.tsx            # Timeline visualization
```

### API Structure
**Note**: Reuses existing upload endpoints (`/api/upload/signed-url`, `/api/upload/complete`) and FFProbe service.

```
/app/api/what-the-ffmpeg/
  ├── analyze/
  │   └── route.ts                # Main analysis endpoint (uses existing FFProbe service)
  ├── probe/
  │   └── route.ts                # Enhanced FFProbe wrapper (extends existing pattern)
  ├── frames/
  │   └── route.ts                # Frame extraction & analysis
  ├── packets/
  │   └── route.ts                # Packet analysis
  ├── bitstream/
  │   └── route.ts                # Bitstream extraction
  └── [fileId]/
      ├── metadata/
      │   └── route.ts            # Get file metadata (uses Redis: wtf:{fileId})
      ├── streams/
      │   └── route.ts            # Stream-specific data
      └── export/
          └── route.ts            # Export analysis data
```

**Storage Keys**:
- Upload metadata: `video:{videoId}` (existing)
- Analysis data: `wtf:{fileId}:analysis` (new)
- Frame data: `wtf:{fileId}:frames` (new)
- Packet data: `wtf:{fileId}:packets` (new)

---

## Features & Components

### 1. File Upload & Management
**Component**: `FileUploader.tsx` (extends `DirectUpload` pattern)

**Reuses**:
- `/components/direct-upload.tsx` as base
- `/api/upload/signed-url` endpoint
- `/api/upload/complete` endpoint
- GCS storage utilities from `/lib/storage.ts`

**Enhancements**:
- Support for all media formats (video, audio, images) - extend `accept` prop
- File validation and preview
- Multiple file support (queue system)
- File history/session management (uses Redis with `wtf:files:{userId}` key)

**Implementation**:
```typescript
// Extend DirectUpload component
import { DirectUpload } from '@/components/direct-upload';

// Add file type validation for audio/images
const acceptedTypes = ['video/*', 'audio/*', 'image/*'];

// Store in Redis with wtf prefix
await kv.set(`wtf:file:${fileId}`, {
  fileId,
  filename,
  type: 'what-the-ffmpeg',
  uploadedAt: new Date().toISOString(),
  // ... metadata
});
```

### 2. Overview Dashboard
**Component**: `OverviewDashboard.tsx`
- High-level file statistics
- Format information (container, codecs, duration)
- File size and bitrate analysis
- Stream summary (video, audio, subtitle counts)
- Quick health check indicators
- Navigation to detailed views

**Visualizations**:
- File format tree diagram
- Stream composition pie chart
- Bitrate timeline (if available)
- Codec compatibility matrix

### 3. Stream Analysis
**Component**: `StreamAnalyzer.tsx`
- Individual stream inspection
- Video stream details:
  - Resolution, frame rate, pixel format
  - Codec parameters (profile, level, bitrate)
  - Color space and colorimetry
  - Aspect ratio and SAR/DAR
  - GOP structure and keyframe intervals
- Audio stream details:
  - Sample rate, channels, bit depth
  - Codec parameters and bitrate
  - Channel layout and mapping
  - Audio format details
- Subtitle stream details:
  - Subtitle format and encoding
  - Language and timing information

**Visualizations**:
- Stream properties table (expandable sections)
- Codec parameter visualization
- Stream comparison charts
- Quality metrics graphs

### 4. Frame-Level Analysis
**Component**: `FrameAnalyzer.tsx`
- Frame extraction and display
- Frame-by-frame navigation
- Frame metadata:
  - Frame type (I, P, B, S)
  - Timestamp (PTS, DTS)
  - Frame size and duration
  - Quality metrics (if available)
- Frame visualization:
  - Thumbnail generation
  - Frame comparison tool
  - Frame sequence timeline
- Advanced frame analysis:
  - GOP structure visualization
  - Keyframe distribution
  - Frame size distribution
  - Temporal analysis

**Visualizations**:
- Frame timeline with thumbnails
- Frame type distribution chart
- Frame size over time graph
- GOP structure diagram

### 5. Packet-Level Inspection
**Component**: `PacketAnalyzer.tsx`
- Packet extraction and analysis
- Packet metadata:
  - Packet size and duration
  - Timestamp information
  - Stream association
  - Flags and properties
- Packet filtering and search:
  - Filter by stream, type, size
  - Search by timestamp
  - Packet comparison
- Packet statistics:
  - Packet size distribution
  - Packet rate analysis
  - Inter-packet timing

**Visualizations**:
- Packet timeline visualization
- Packet size histogram
- Packet rate graph
- Stream packet distribution

### 6. Bitstream Visualization
**Component**: `BitstreamVisualizer.tsx`
- Bitstream extraction and parsing
- NAL unit analysis (for H.264/H.265):
  - NAL unit types and structure
  - SPS/PPS extraction
  - Slice header analysis
- Bitstream visualization:
  - Hex dump viewer
  - Binary visualization
  - Structure tree view
- Codec-specific analysis:
  - H.264: SPS/PPS parameters
  - H.265: VPS/SPS/PPS parameters
  - VP9: Frame header analysis
  - AV1: OBU structure

**Visualizations**:
- Bitstream structure tree
- NAL unit timeline
- Parameter set visualization
- Hex/binary viewer with syntax highlighting

### 7. Codec-Specific Analysis
**Component**: `CodecAnalyzer.tsx`
- Video codec analysis:
  - H.264: Profile, level, ref frames, etc.
  - H.265/HEVC: Tier, level, profiles
  - VP9: Profile, bit depth, color space
  - AV1: Profile, level, bit depth
  - VP8: Profile and parameters
- Audio codec analysis:
  - AAC: Profile, bitrate, sample rate
  - MP3: Bitrate, sample rate, mode
  - Opus: Complexity, bitrate, channels
  - Vorbis: Quality, bitrate
- Codec compatibility check
- Encoding recommendations

**Visualizations**:
- Codec parameter tables
- Compatibility matrix
- Encoding quality metrics
- Codec comparison charts

### 8. Timeline Visualization
**Component**: `TimelineVisualizer.tsx`
- Interactive timeline view
- Multi-stream synchronization:
  - Video/audio sync visualization
  - Stream alignment check
  - Drift detection
- Timeline markers:
  - Keyframes
  - Chapter markers
  - Custom markers
- Playback simulation:
  - Frame-accurate scrubbing
  - Multi-speed playback
  - Sync point visualization

**Visualizations**:
- Multi-track timeline
- Sync drift graph
- Keyframe timeline
- Chapter markers overlay

### 9. Advanced Analysis Tools
**Component**: `AdvancedTools.tsx`
- StreamEye-inspired features:
  - Macroblock analysis (H.264/H.265)
  - Motion vector visualization
  - Quantization parameter analysis
  - Reference frame tracking
- Quality metrics:
  - PSNR calculation (if reference available)
  - SSIM analysis
  - Bitrate efficiency metrics
- Error detection:
  - Frame corruption detection
  - Sync issues
  - Bitstream errors

### 10. Export & Reporting
**Component**: `ExportTools.tsx`
- Export formats:
  - JSON (full analysis data)
  - CSV (tabular data)
  - PDF report
  - HTML report
- Customizable reports:
  - Select sections to include
  - Custom branding
  - Summary vs. detailed
- Share functionality:
  - Generate shareable links
  - Embed codes
  - API access

---

## API Endpoints

### 1. Upload Endpoint
**REUSES**: `/api/upload/signed-url` and `/api/upload/complete`

**Enhancement**: Add new endpoint for WTF-specific metadata storage

**POST** `/api/what-the-ffmpeg/upload/complete`
- Extends existing `/api/upload/complete`
- Stores additional WTF metadata in Redis
- Triggers initial FFProbe analysis

**Request**:
```typescript
{
  videoId: string,  // From existing upload flow
  filename: string,
  size: number,
  type: string,
  options?: {
    extractThumbnails?: boolean,
    quickAnalysis?: boolean
  }
}
```

**Response**:
```typescript
{
  success: true,
  fileId: string,
  analysisJobId?: string,  // If quickAnalysis is enabled
  status: 'uploaded' | 'analyzing' | 'ready'
}
```

**Storage**:
```typescript
// Store in Redis
await kv.set(`wtf:file:${fileId}`, {
  fileId,
  videoId,  // Link to existing video record
  filename,
  type: 'what-the-ffmpeg',
  uploadedAt: new Date().toISOString(),
  status: 'uploaded'
});
```

### 2. Analysis Endpoint
**POST** `/api/what-the-ffmpeg/analyze`
- Trigger comprehensive analysis
- Return analysis job ID
- Support different analysis levels

**Request**:
```typescript
{
  fileId: string,
  analysisLevel: 'basic' | 'standard' | 'detailed' | 'comprehensive',
  options?: {
    extractFrames?: boolean,
    analyzePackets?: boolean,
    extractBitstream?: boolean,
    codecAnalysis?: boolean
  }
}
```

**Response**:
```typescript
{
  jobId: string,
  status: 'queued' | 'processing' | 'completed' | 'failed',
  estimatedTime?: number
}
```

### 3. FFProbe Wrapper
**POST** `/api/what-the-ffmpeg/probe`
- **REUSES**: Existing Cloud Run FFProbe service pattern
- **Extends**: `/app/api/video/[id]/probe-segment/route.ts` pattern
- Enhanced wrapper with more options
- Support for detailed frame/packet analysis
- Caching in Redis for performance

**Implementation**:
```typescript
// Reuse existing probeSegment function pattern
async function probeFile(fileUrl: string, options: ProbeOptions) {
  const ffprobeServiceUrl = process.env.FFPROBE_SERVICE_URL;
  
  // Check cache first
  const cacheKey = `wtf:probe:${hashUrl(fileUrl)}:${JSON.stringify(options)}`;
  const cached = await kv.get(cacheKey);
  if (cached) return cached;
  
  // Call Cloud Run service (same pattern as existing)
  const response = await fetch(`${ffprobeServiceUrl}/probe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: fileUrl,
      detailed: options.showFrames || options.showPackets,
      // Map options to FFProbe service format
    }),
    signal: AbortSignal.timeout(60000) // 60s timeout
  });
  
  const result = await response.json();
  
  // Cache result (TTL: 1 hour)
  await kv.setex(cacheKey, 3600, result);
  
  return result;
}
```

**Request**:
```typescript
{
  fileId: string,
  fileUrl?: string,  // GCS URL if fileId provided
  options: {
    showFormat?: boolean,
    showStreams?: boolean,
    showFrames?: boolean,
    showPackets?: boolean,
    showPrograms?: boolean,
    showChapters?: boolean,
    countFrames?: boolean,
    countPackets?: boolean,
    selectStreams?: string,
    readIntervals?: string
  }
}
```

**Response**:
```typescript
{
  success: true,
  data: {
    format: any,
    streams: any[],
    frames?: any[],
    packets?: any[],
    programs?: any[],
    chapters?: any[]
  },
  cached: boolean,
  metadata: {
    fileId,
    timestamp: string
  }
}
```

### 4. Frame Extraction
**GET** `/api/what-the-ffmpeg/frames`
- Extract specific frames
- Generate thumbnails
- Frame metadata

**Request**:
```typescript
{
  fileId: string,
  streamIndex?: number,
  frameNumbers?: number[],
  timeRange?: { start: number, end: number },
  frameType?: 'I' | 'P' | 'B' | 'all',
  thumbnailSize?: { width: number, height: number }
}
```

**Response**:
```typescript
{
  frames: Array<{
    frameNumber: number,
    timestamp: number,
    type: string,
    size: number,
    thumbnailUrl?: string,
    metadata: any
  }>
}
```

### 5. Packet Analysis
**GET** `/api/what-the-ffmpeg/packets`
- Extract and analyze packets
- Packet filtering and search

**Request**:
```typescript
{
  fileId: string,
  streamIndex?: number,
  timeRange?: { start: number, end: number },
  filters?: {
    minSize?: number,
    maxSize?: number,
    flags?: string[]
  }
}
```

**Response**:
```typescript
{
  packets: Array<{
    packetNumber: number,
    timestamp: number,
    duration: number,
    size: number,
    streamIndex: number,
    flags: string[],
    data?: string // hex dump if requested
  }>,
  statistics: {
    totalPackets: number,
    totalSize: number,
    averageSize: number,
    packetRate: number
  }
}
```

### 6. Bitstream Extraction
**GET** `/api/what-the-ffmpeg/bitstream`
- Extract bitstream data
- Parse NAL units (for H.264/H.265)
- Codec-specific parsing

**Request**:
```typescript
{
  fileId: string,
  streamIndex: number,
  format: 'hex' | 'binary' | 'parsed',
  codecSpecific?: boolean
}
```

**Response**:
```typescript
{
  bitstream: string | any,
  nalUnits?: Array<{
    type: number,
    size: number,
    data: string,
    parsed?: any
  }>,
  parameterSets?: any
}
```

### 7. File Metadata
**GET** `/api/what-the-ffmpeg/[fileId]/metadata`
- **REUSES**: Redis storage pattern
- Get cached file metadata from `wtf:file:{fileId}`
- Quick access to basic info
- Falls back to GCS metadata if not in Redis

**Implementation**:
```typescript
// Get from Redis
const fileData = await kv.get(`wtf:file:${fileId}`);
if (!fileData) {
  // Fallback: get from GCS or original video record
  const videoData = await kv.get(`video:${fileId}`);
  // ...
}
```

### 8. Stream Data
**GET** `/api/what-the-ffmpeg/[fileId]/streams`
- **REUSES**: FFProbe analysis pattern
- Get stream-specific data from cached probe results
- Stream comparison
- Uses `wtf:probe:{fileId}` cache

### 9. Export
**GET** `/api/what-the-ffmpeg/[fileId]/export`
- **REUSES**: Storage utilities for file generation
- Export analysis data in various formats
- Generates files and stores in GCS (reuses `uploadFile` from `/lib/storage.ts`)

---

## UI/UX Design

### Design Principles
1. **Information Density**: Show maximum detail without overwhelming
2. **Progressive Disclosure**: Start with overview, drill down to details
3. **Visual Hierarchy**: Use color, typography, and spacing effectively
4. **Interactive Exploration**: Make data explorable, not just readable
5. **Performance**: Lazy load heavy visualizations

### Color Scheme
- Primary: Purple/Pink gradient (matching existing app)
- Success: Green (for healthy files)
- Warning: Yellow (for warnings)
- Error: Red (for errors/issues)
- Info: Blue (for informational data)
- Code/Data: Dark theme with syntax highlighting

### Component Library
**Reuses**:
- All existing `/components/ui/` components (Card, Button, Progress, Input, Label, Dialog, Popover, Alert)
- Styling patterns: `bg-white/10 backdrop-blur-lg border-white/20`
- Icon library: `lucide-react`

**New Specialized Components** (follows existing patterns):
- `DataTable.tsx` - Expandable data tables (uses Card, Button)
- `HexViewer.tsx` - Hex dump viewer (uses Card, custom styling)
- `Timeline.tsx` - Interactive timeline (uses Card, Progress)
- `StreamCard.tsx` - Stream information card (extends Card pattern)
- `FrameViewer.tsx` - Frame display and navigation (uses Card, Button, Dialog)
- `PacketList.tsx` - Packet list with filtering (uses Card, Input, Button)
- `CodecBadge.tsx` - Codec information badge (uses existing badge pattern)
- `MetricCard.tsx` - Metric display card (extends Card pattern)

**Component Pattern**:
```typescript
// Follow existing component structure
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// ... other imports

interface ComponentProps {
  fileId: string;
  onUpdate?: (updates: any) => void;
}

export function Component({ fileId, onUpdate }: ComponentProps) {
  // Follow existing patterns
}
```

### Layout Structure
```
┌─────────────────────────────────────────┐
│  Header: "What the FFMPEG"             │
│  Navigation: Overview | Streams | ... │
├─────────────────────────────────────────┤
│                                         │
│  Main Content Area                     │
│  (Dynamic based on selected view)       │
│                                         │
├─────────────────────────────────────────┤
│  Sidebar: File Info & Quick Actions    │
└─────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Foundation ✅ COMPLETED
**Goal**: Basic file upload and overview display

**Tasks**:
1. ✅ Create route structure (`/app/what-the-ffmpeg/`)
2. ✅ **Reuse** `DirectUpload` component, extend for multiple file types
3. ✅ **Reuse** existing upload endpoints (`/api/upload/signed-url`, `/api/upload/complete`)
4. ✅ Create WTF-specific metadata storage endpoint (extends existing pattern)
5. ✅ **Reuse** existing FFProbe service via enhanced wrapper
6. ✅ Implement overview dashboard with basic metadata (uses existing Card/Button components)
7. ✅ Add navigation between sections (refactored to tabs for better UX)

**Deliverables**:
- ✅ File upload working (reuses existing infrastructure)
- ✅ Basic file metadata displayed (from FFProbe via Cloud Run)
- ✅ Navigation structure in place (tabbed interface)
- ✅ Redis storage for WTF metadata working

**Note**: Refactored to use tabbed interface instead of separate pages for better UX.

### Phase 2: Stream Analysis ✅ COMPLETED
**Goal**: Detailed stream information display

**Tasks**:
1. ✅ Build stream analyzer component
2. ✅ Enhance FFProbe API with stream-specific options
3. ✅ Create stream visualization components
4. ✅ Add stream comparison features (summary statistics)
5. ✅ Implement codec parameter display

**Deliverables**:
- ✅ Stream analysis tab functional
- ✅ Codec information displayed (detailed codec parameters)
- ✅ Stream comparison working (summary with counts by type)

**Note**: Implemented in tabbed interface with enhanced stream details including profile, level, color space, and all codec-specific parameters.

### Phase 3: Frame Analysis ✅ COMPLETED
**Goal**: Frame-level inspection and visualization

**Tasks**:
1. ✅ Build frame extraction API (via FFProbe service)
2. ✅ Create frame viewer component
3. ✅ Implement frame navigation (prev/next, jump to)
4. ⏳ Add frame timeline visualization (basic stats implemented)
5. ⏳ Build GOP structure visualization (frame type stats implemented)
6. ⏳ Add thumbnail generation (to be added)

**Deliverables**:
- ✅ Frame viewer working
- ✅ Frame navigation functional
- ✅ Frame statistics display (I/P/B frame counts)
- ⏳ Timeline visualization (basic implementation)

**Note**: Frame data loading, navigation, and statistics implemented. Thumbnail generation and advanced GOP visualization can be added later.

### Phase 4: Packet & Bitstream (Week 7-8) ✅ COMPLETED
**Goal**: Low-level packet and bitstream analysis

**Tasks**:
1. ✅ Build packet analysis API (via FFProbe service)
2. ✅ Create packet viewer/list component (with pagination)
3. ✅ Implement packet filtering and search (by stream, size)
4. ✅ Build bitstream viewer component (codec info display)
5. ✅ Create bitstream analysis UI (codec-specific support detection)
6. ⏳ Add NAL unit parsing (for H.264/H.265) - Foundation ready, advanced parsing pending
7. ⏳ Implement codec-specific bitstream parsing - Foundation ready

**Deliverables**:
- ✅ Packet analysis working (with filtering, pagination, statistics)
- ✅ Bitstream viewer functional (codec detection and info display)
- ⏳ NAL unit parsing (foundation ready, advanced parsing can be added)

**Note**: Packet analysis includes filtering by stream and size, pagination, and statistics. Bitstream viewer shows codec-specific information and detects H.264/H.265 support for NAL unit analysis. Advanced hex viewer and NAL unit parsing can be added as enhancements.

### Phase 5: Advanced Features (Week 9-10) ✅ COMPLETED
**Goal**: Advanced analysis tools and visualizations

**Tasks**:
1. ✅ Build timeline visualizer (frame, stream, packet timelines)
2. ✅ Implement sync analysis (audio/video synchronization)
3. ✅ Add quality metrics calculation (bitrate, resolution, frame rate, avg frame size)
4. ⏳ Create error detection features (foundation ready)
5. ✅ Build export functionality (JSON export)
6. ⏳ Add reporting features (export ready, advanced reports pending)

**Deliverables**:
- ✅ Timeline visualization complete (interactive frame/stream/packet timelines)
- ✅ Export functionality working (JSON export with all analysis data)
- ✅ Advanced analysis tools functional (sync analysis, quality metrics, keyframe distribution)

**Note**: Timeline visualizer shows frame types (I/P/B), stream activity, packet distribution, keyframe markers, and GOP analysis. Sync analysis detects audio/video synchronization offsets. Quality metrics display bitrate, resolution, frame rate, and average frame size. Export functionality allows downloading complete analysis as JSON.

### Phase 6: Polish & Optimization (Week 11-12)
**Goal**: Performance optimization and UI polish

**Tasks**:
1. Optimize API responses (caching, pagination)
2. Add loading states and skeletons
3. Implement error handling and recovery
4. Add tooltips and help text
5. Performance testing and optimization
6. Mobile responsiveness
7. Accessibility improvements

**Deliverables**:
- Optimized performance
- Polished UI/UX
- Full accessibility support

---

## Technical Details

### FFProbe Commands

**Note**: These commands are executed via the Cloud Run FFProbe service, not directly. The service already supports these patterns.

#### Basic Analysis
```bash
# Executed via Cloud Run service
ffprobe -v quiet -print_format json -show_format -show_streams file.mp4
```
**API Call**:
```typescript
POST ${FFPROBE_SERVICE_URL}/probe
{ url: fileUrl, detailed: false }
```

#### Detailed Frame Analysis
```bash
# Executed via Cloud Run service
ffprobe -v quiet -print_format json -show_frames -select_streams v:0 file.mp4
```
**API Call**:
```typescript
POST ${FFPROBE_SERVICE_URL}/probe
{ url: fileUrl, detailed: true }
// Service adds: -count_frames -count_packets -show_frames
```

#### Packet Analysis
```bash
# Executed via Cloud Run service
ffprobe -v quiet -print_format json -show_packets file.mp4
```
**API Call**:
```typescript
POST ${FFPROBE_SERVICE_URL}/probe
{ url: fileUrl, detailed: true }
// Service adds: -show_packets
```

#### Bitstream Extraction (H.264)
**Note**: This requires FFMPEG, not FFProbe. May need Cloud Run service enhancement or local processing.
```bash
ffmpeg -i file.mp4 -c:v copy -bsf:v h264_mp4toannexb -f h264 output.h264
```
**Implementation**: Could extend Cloud Run service or use server-side FFMPEG

#### Frame Extraction
**Note**: This requires FFMPEG. May need Cloud Run service enhancement or local processing.
```bash
ffmpeg -i file.mp4 -vf "select=eq(n\,100)" -vframes 1 frame_100.jpg
```
**Implementation**: Could extend Cloud Run service or use server-side FFMPEG

### Data Structures

#### File Metadata
```typescript
interface FileMetadata {
  fileId: string;
  filename: string;
  size: number;
  format: {
    formatName: string;
    formatLongName: string;
    duration: number;
    bitrate: number;
    size: number;
  };
  streams: StreamMetadata[];
  analyzedAt: string;
}
```

#### Stream Metadata
```typescript
interface StreamMetadata {
  index: number;
  codecName: string;
  codecLongName: string;
  codecType: 'video' | 'audio' | 'subtitle' | 'data';
  // Video-specific
  width?: number;
  height?: number;
  pixelFormat?: string;
  frameRate?: string;
  // Audio-specific
  sampleRate?: number;
  channels?: number;
  channelLayout?: string;
  // Common
  bitrate?: number;
  duration?: number;
  // Codec-specific
  codecParams?: Record<string, any>;
}
```

#### Frame Data
```typescript
interface FrameData {
  frameNumber: number;
  streamIndex: number;
  pts: number;
  ptsTime: number;
  dts?: number;
  dtsTime?: number;
  duration?: number;
  durationTime?: number;
  pktSize: number;
  pictType: string; // I, P, B, S
  keyFrame: boolean;
  thumbnailUrl?: string;
}
```

### Performance Considerations

1. **Caching**: 
   - Cache FFProbe results in Redis with TTL (reuses existing Redis pattern)
   - Cache keys: `wtf:probe:{fileId}:{optionsHash}`
   - TTL: 1 hour for basic, 24 hours for detailed analysis

2. **Pagination**: 
   - Paginate frame/packet lists (use `react-window` or `react-virtualized`)
   - API endpoints support `limit` and `offset` parameters

3. **Lazy Loading**: 
   - Load visualizations on demand (Next.js dynamic imports)
   - Load frames/packets only when tab is active

4. **Background Processing**: 
   - Use existing Redis pattern for job tracking
   - Store job status: `wtf:job:{jobId}`

5. **Streaming**: 
   - For large data sets, stream from GCS (reuses `downloadFromGCS` pattern)
   - Use chunked responses for large JSON

6. **Compression**: 
   - Compress API responses (Next.js handles automatically)
   - Store compressed data in Redis for large payloads

### Error Handling

1. **File Validation**: Validate files before upload
2. **FFProbe Errors**: Handle FFProbe errors gracefully
3. **Timeout Handling**: Set appropriate timeouts
4. **Retry Logic**: Retry failed operations
5. **User Feedback**: Clear error messages

### Security Considerations

1. **File Size Limits**: Enforce upload limits
2. **File Type Validation**: Validate file types
3. **Rate Limiting**: Limit API requests
4. **Sanitization**: Sanitize file names and paths
5. **Access Control**: Implement file access control

---

## Dependencies

### New Dependencies Needed
- `recharts` or `chart.js` - For data visualizations
- `react-hex-view` or custom hex viewer - For bitstream display
- `react-virtualized` or `react-window` - For large lists
- `file-saver` - For export functionality
- `jspdf` - For PDF report generation

### Existing Dependencies (Already in use)
- `fluent-ffmpeg` - FFMPEG wrapper
- `next` - Framework
- `react` - UI library
- `tailwindcss` - Styling

---

## Success Metrics

1. **Functionality**: All planned features implemented
2. **Performance**: Analysis completes within reasonable time
3. **Usability**: Intuitive interface, easy to navigate
4. **Accuracy**: Analysis data matches FFProbe output
5. **Reliability**: Handles edge cases and errors gracefully

---

## Future Enhancements

1. **Real-time Analysis**: Stream analysis as file uploads
2. **Comparison Tool**: Compare two files side-by-side
3. **Batch Processing**: Analyze multiple files at once
4. **Custom Scripts**: Allow users to run custom FFMPEG commands
5. **Integration**: Integrate with other tools (e.g., MediaInfo)
6. **AI Insights**: Use AI to provide insights and recommendations
7. **Video Player Integration**: Integrate with video player for frame-accurate analysis

---

## Notes

- This plan is comprehensive and can be implemented incrementally
- Each phase builds on the previous one
- Features can be prioritized based on user needs
- The design is flexible and can be adjusted during implementation
- Consider user feedback after each phase for course correction

