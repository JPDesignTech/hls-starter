# "What the FFMPEG" - Quick Reference Guide

## 🎯 Key Reuse Points

### Upload Infrastructure (100% Reuse)
```typescript
// 1. Use existing upload endpoints
POST /api/upload/signed-url
POST /api/upload/complete

// 2. Reuse DirectUpload component
import { DirectUpload } from '@/components/direct-upload';

// 3. Extend for audio/image support
accept="video/*,audio/*,image/*"
```

### FFProbe Integration (100% Reuse)
```typescript
// Use existing Cloud Run service
const ffprobeServiceUrl = process.env.FFPROBE_SERVICE_URL;

// Call existing pattern
POST ${ffprobeServiceUrl}/probe
{
  url: fileUrl,
  initUrl?: string,
  detailed: boolean
}

// Response format (already established)
{
  success: boolean,
  data: FFProbeOutput,
  metadata: { ... }
}
```

### Storage Pattern (Extend Existing)
```typescript
// Existing: video metadata
await kv.set(`video:${videoId}`, { ... });

// New: WTF metadata (same pattern)
await kv.set(`wtf:file:${fileId}`, {
  fileId,
  videoId,  // Link to existing
  filename,
  type: 'what-the-ffmpeg',
  uploadedAt: new Date().toISOString()
});

// Cache probe results
await kv.setex(`wtf:probe:${fileId}:${hash}`, 3600, probeData);
```

### Component Pattern (Follow Existing)
```typescript
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ComponentProps {
  fileId: string;
  onUpdate?: (updates: any) => void;
}

export function Component({ fileId, onUpdate }: ComponentProps) {
  // Follow existing patterns
  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      {/* ... */}
    </Card>
  );
}
```

## 📁 File Structure

```
/app/what-the-ffmpeg/
  ├── page.tsx                    # Main page (reuses DirectUpload)
  └── [fileId]/
      ├── page.tsx                # Dashboard (reuses Card components)
      ├── overview/page.tsx
      ├── streams/page.tsx
      ├── frames/page.tsx
      ├── packets/page.tsx
      ├── bitstream/page.tsx
      └── timeline/page.tsx

/app/api/what-the-ffmpeg/
  ├── analyze/route.ts           # Uses existing FFProbe service
  ├── probe/route.ts             # Extends existing probe pattern
  ├── frames/route.ts
  ├── packets/route.ts
  └── [fileId]/
      ├── metadata/route.ts      # Uses Redis pattern
      └── export/route.ts        # Uses storage.ts utilities
```

## 🔄 API Flow Examples

### Upload Flow (Reuses Existing)
```typescript
// 1. Get signed URL (existing endpoint)
const { uploadUrl, videoId, filename } = await fetch('/api/upload/signed-url', {
  method: 'POST',
  body: JSON.stringify({ filename, contentType })
}).then(r => r.json());

// 2. Upload to GCS (direct PUT)
await fetch(uploadUrl, {
  method: 'PUT',
  body: file,
  headers: { 'Content-Type': contentType }
});

// 3. Complete upload (existing endpoint)
await fetch('/api/upload/complete', {
  method: 'POST',
  body: JSON.stringify({ videoId, filename, size, type })
});

// 4. Store WTF metadata (new endpoint, same pattern)
await fetch('/api/what-the-ffmpeg/upload/complete', {
  method: 'POST',
  body: JSON.stringify({ videoId, filename, size, type })
});
```

### Analysis Flow (Reuses FFProbe Service)
```typescript
// 1. Get file URL from GCS
const fileUrl = `https://storage.googleapis.com/${bucket}/${filename}`;

// 2. Call FFProbe service (existing pattern)
const probeResult = await fetch(`${FFPROBE_SERVICE_URL}/probe`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: fileUrl,
    detailed: true
  }),
  signal: AbortSignal.timeout(60000)
}).then(r => r.json());

// 3. Cache result (Redis pattern)
await kv.setex(`wtf:probe:${fileId}:${hash}`, 3600, probeResult);

// 4. Return to client
return NextResponse.json({ success: true, data: probeResult.data });
```

## 🎨 UI Component Reuse

### Card Pattern
```typescript
<Card className="bg-white/10 backdrop-blur-lg border-white/20">
  <CardHeader>
    <CardTitle className="text-white">Title</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### Button Pattern
```typescript
<Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
  <Icon className="mr-2 h-4 w-4" />
  Button Text
</Button>
```

### Progress Pattern
```typescript
<Progress value={progress} className="w-full" />
<div className="text-sm text-gray-300 text-center">
  {progress.toFixed(0)}% complete
</div>
```

## 📦 Dependencies

### Already Available ✅
- `@google-cloud/storage` - GCS client
- `@upstash/redis` - Redis client
- `uuid` - UUID generation
- `lucide-react` - Icons
- `next`, `react`, `tailwindcss` - Framework

### To Add 🆕
- `recharts` - Charts/visualizations
- `react-window` - Virtualized lists
- `file-saver` - Export functionality
- `jspdf` - PDF reports (optional)

## 🚀 Implementation Checklist

### Phase 1: Foundation
- [ ] Create `/app/what-the-ffmpeg/` route structure
- [ ] Extend `DirectUpload` for audio/image support
- [ ] Create WTF metadata storage endpoint
- [ ] Create enhanced FFProbe wrapper (reuses existing service)
- [ ] Build overview dashboard (reuses Card components)
- [ ] Add navigation structure

### Phase 2: Stream Analysis
- [ ] Build stream analyzer component
- [ ] Enhance FFProbe API with stream options
- [ ] Create stream visualization (uses recharts)
- [ ] Add stream comparison features

### Phase 3: Frame Analysis
- [ ] Build frame extraction API
- [ ] Create frame viewer component
- [ ] Implement frame navigation
- [ ] Add timeline visualization

### Phase 4: Advanced Features
- [ ] Packet analysis
- [ ] Bitstream visualization
- [ ] Export functionality
- [ ] Performance optimization

## 💡 Key Patterns to Follow

1. **Always check Redis cache first** before calling FFProbe service
2. **Use existing error handling patterns** (try/catch with user-friendly messages)
3. **Follow component callback pattern** for parent-child communication
4. **Reuse GCS utilities** from `/lib/storage.ts`
5. **Use existing styling patterns** for consistency
6. **Store metadata in Redis** with appropriate TTLs
7. **Link WTF files to existing video records** via `videoId`

## 🔍 Testing Strategy

1. **Unit Tests**: Test API endpoints (reuse existing test patterns)
2. **Integration Tests**: Test FFProbe service integration
3. **Component Tests**: Test UI components (follow existing test patterns)
4. **E2E Tests**: Test full upload → analysis flow

## 📝 Notes

- All uploads go through existing GCS infrastructure
- FFProbe analysis uses existing Cloud Run service
- Redis storage follows existing key patterns
- UI components follow existing shadcn/ui patterns
- Error handling follows existing try/catch patterns
- Styling follows existing Tailwind patterns

