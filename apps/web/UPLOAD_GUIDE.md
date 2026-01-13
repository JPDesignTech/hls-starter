# Video Upload Guide for Vercel Deployment

## Overview

Vercel has strict request body size limits that prevent direct video uploads:
- **Edge Functions**: 4.5MB max
- **Serverless Functions**: 4.5MB default (50MB on Pro plans)

This guide provides three solutions to handle large video uploads.

## Solution 1: Direct Upload to Google Cloud Storage (Recommended)

This approach bypasses Vercel's limits by uploading directly from the browser to Google Cloud Storage.

### Setup

1. **Configure Google Cloud Storage**
   ```bash
   # Set these environment variables in Vercel
   GCS_BUCKET_NAME=your-bucket-name
   GCP_PROJECT_ID=your-project-id
   ```

2. **Create a Service Account**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a service account with Storage Admin permissions
   - Download the JSON key file
   - Add the contents to Vercel environment variables

3. **Update your upload code**
   ```typescript
   // Use the DirectUpload component
   import { DirectUpload } from '@/components/direct-upload';
   ```

### Flow
1. Client requests a signed URL from `/api/upload/signed-url`
2. Client uploads directly to GCS using the signed URL
3. Client notifies the backend at `/api/upload/complete`
4. Backend processes the video from GCS

## Solution 2: Chunked Upload (For Local Storage)

Splits large files into smaller chunks that fit within Vercel's limits.

### Usage
```typescript
// Use the ChunkedUpload component
import { ChunkedUpload } from '@/components/chunked-upload';
```

### Configuration
- Default chunk size: 2MB
- Uploads chunks sequentially
- Reassembles on the server

## Solution 3: External Upload Service

For production applications, consider using:
- **Cloudinary**: Video upload and processing
- **Mux**: Video streaming platform
- **AWS S3 + Lambda**: Custom solution
- **Uploadcare**: File upload service

## Environment Variables

Create these in your Vercel project settings:

```env
# Redis (Required)
UPSTASH_REDIS_REST_URL=your_url
UPSTASH_REDIS_REST_TOKEN=your_token

# Google Cloud Storage (For Solution 1)
GCS_BUCKET_NAME=your-bucket-name
GCP_PROJECT_ID=your-project-id

# For local development
GOOGLE_APPLICATION_CREDENTIALS=path/to/key.json
```

## Testing Locally

1. **Test the build**
   ```bash
   npm run build
   vercel build --prod --debug
   ```

2. **Test with Vercel CLI**
   ```bash
   vercel dev
   ```

3. **Monitor logs**
   ```bash
   vercel logs
   ```

## Troubleshooting

### "Request Entity Too Large" Error
- You're trying to upload directly through Vercel
- Switch to direct GCS upload or chunked upload

### "FFmpeg not found" Error
- FFmpeg binaries aren't available in Vercel's environment
- Consider using a separate processing service
- Or use Vercel Functions with custom layers

### Build Failures
- Check `next.config.ts` webpack configuration
- Ensure all dependencies are listed in `package.json`
- Use dynamic imports for server-only modules

## Best Practices

1. **Always validate file types** before uploading
2. **Show upload progress** to users
3. **Handle errors gracefully** with retry logic
4. **Clean up temporary files** after processing
5. **Set appropriate CORS headers** for direct uploads

## Production Recommendations

1. Use a CDN for serving processed videos
2. Implement rate limiting on upload endpoints
3. Add virus scanning for uploaded files
4. Monitor storage costs and implement quotas
5. Use background jobs for video processing 