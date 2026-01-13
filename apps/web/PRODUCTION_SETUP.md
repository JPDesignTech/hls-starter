# Production Setup Guide

## Overview
This guide explains how to deploy the HLS Starter application to production, particularly on Vercel, and addresses common issues related to file system limitations.

## Key Production Fixes

### 1. File System Limitations
In production environments like Vercel:
- The application runs in a **read-only file system**
- Only `/tmp` directory is writable
- Maximum `/tmp` storage is typically 512MB

### 2. Directory Path Updates
We've implemented environment-aware directory paths:

```javascript
// Development paths
uploads/          → /tmp/uploads/         (in production)
output/           → /tmp/output/          (in production)
temp/             → /tmp/               (in production)
public/streams/   → Google Cloud Storage (recommended for production)
```

### 3. Environment Variables
Set these environment variables in your Vercel dashboard:

```bash
# Required for production
VERCEL=1                    # Auto-set by Vercel
NODE_ENV=production         # Auto-set by Vercel

# Required: FFprobe Service URL (Cloud Run)
FFPROBE_SERVICE_URL=https://your-ffprobe-service.run.app

# Google Cloud Storage (Required)
GCS_BUCKET_NAME=your-bucket-name
GCP_PROJECT_ID=your-project-id
GCP_SERVICE_ACCOUNT_KEY=eyJ0eXBlIjoic2VydmljZV9hY2NvdW50Ii...
# ^ Set this to BASE64-ENCODED JSON of your service account key file
# Encode with: base64 -i key.json
# This works in ALL environments: local dev, preview, production
# Get your key from: https://console.cloud.google.com/iam-admin/serviceaccounts

# Redis/Upstash (Required)
REDIS_URL=your-redis-url
REDIS_TOKEN=your-redis-token

# Optional
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_FFPROBE_SERVICE_URL=https://your-ffprobe-service.run.app
```

## Production Deployment Steps

### 1. Set Up Google Cloud Storage

1. Create a GCS bucket:
```bash
gsutil mb gs://your-hls-bucket
```

2. Enable public access:
```bash
gsutil iam ch allUsers:objectViewer gs://your-hls-bucket
```

3. Create a service account 
4. Download the JSON key file for the service account
5. **Set `GCP_SERVICE_ACCOUNT_KEY` environment variable** with **base64-encoded JSON**:
   - Encode your key file: `base64 -i key.json`
   - Copy the base64 output
   - **Local dev**: Add to `.env.local` as `GCP_SERVICE_ACCOUNT_KEY=eyJ0eXBlIjo...`
   - **Vercel (preview/production)**: Add to Vercel environment variables as `GCP_SERVICE_ACCOUNT_KEY` with the base64 string
   - This is the ONLY credential method - works in ALL environments

6. **Configure CORS for direct uploads**:
   The GCS bucket must be configured with CORS to allow direct browser uploads from your Vercel deployments.
   
   Run the CORS configuration script:
   ```bash
   # Set environment variables
   export GCS_BUCKET_NAME=your-bucket-name
   export GCP_PROJECT_ID=your-project-id
   
   # Optionally set your production domain (will be auto-detected from VERCEL_URL)
   export NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   
   # Run the CORS configuration script
   ./scripts/configure-gcs-cors.sh
   ```
   
   This script automatically configures CORS to allow uploads from:
   - `http://localhost:3000` and `http://localhost:*` (for local development)
   - `https://*.vercel.app` (for all Vercel preview branches)
   - Your custom production domain (if `NEXT_PUBLIC_APP_URL` or `VERCEL_URL` is set)
   
   **Important**: Run this script after deploying to ensure uploads work from preview branches and production.

### 2. Set Up Redis (Upstash)

1. Create an Upstash Redis database at https://upstash.com
2. Copy the Redis URL and token
3. Add them to Vercel environment variables

### 3. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 4. Configure Vercel Settings

In your `vercel.json` (create if not exists):

```json
{
  "functions": {
    "app/api/process/route.ts": {
      "maxDuration": 300
    },
    "app/api/upload/route.ts": {
      "maxDuration": 300
    }
  }
}
```

## Production Limitations & Solutions

### 1. FFmpeg in Vercel
- FFmpeg is NOT available by default in Vercel
- Solutions:
  - Use a separate processing service (recommended)
  - Use Vercel Edge Functions with WebAssembly FFmpeg (limited)
  - Process videos using external services like:
    - AWS MediaConvert
    - Google Cloud Transcoder API
    - Mux.com
    - Cloudflare Stream

### 2. File Size Limits
- Vercel has a 4.5MB request body limit
- Use chunked uploads (already implemented)
- Or upload directly to GCS using signed URLs (recommended)

### 3. Execution Time Limits
- Vercel functions have a maximum execution time (5 minutes on Pro plan)
- For video processing, consider:
  - Background jobs using external services
  - Webhook-based processing notifications
  - Queue-based processing with services like AWS SQS

## Recommended Production Architecture

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│   Client    │────▶│   Vercel    │────▶│     GCS      │
└─────────────┘     └─────────────┘     └──────────────┘
                           │                     │
                           ▼                     │
                    ┌─────────────┐             │
                    │   Upstash   │             │
                    │    Redis    │             │
                    └─────────────┘             │
                           │                     │
                           ▼                     ▼
                    ┌─────────────┐     ┌──────────────┐
                    │  External   │────▶│   Processed  │
                    │ Transcoding │     │    Videos    │
                    └─────────────┘     └──────────────┘
```

## Testing Production Locally

To test production behavior locally:

```bash
# Set production environment
export NODE_ENV=production
export VERCEL=1

# Run build
npm run build

# Start production server
npm start
```

## Monitoring & Debugging

1. **Vercel Functions Logs**: Check the Functions tab in Vercel dashboard
2. **Error Tracking**: Consider adding Sentry or similar
3. **Performance Monitoring**: Use Vercel Analytics

## Common Issues & Solutions

### Issue: "ENOENT: no such file or directory, mkdir '/var/task/temp'"
**Solution**: Already fixed by using `/tmp` directory in production

### Issue: "FFmpeg not found"
**Solution**: Use external transcoding service or fallback to serving original video

### Issue: "Request body too large"
**Solution**: Use chunked upload or direct-to-GCS upload

### Issue: "Function timeout"
**Solution**: Offload processing to external service with webhooks

### Issue: "Upload failed" or CORS errors when uploading from Vercel
**Solution**: Configure CORS on your GCS bucket by running `./scripts/configure-gcs-cors.sh`. 
   The script automatically includes Vercel preview branch domains (`*.vercel.app`) and your production domain.
   Make sure to run this script after deploying to a new environment.

## Next Steps

1. **Implement External Transcoding**: 
   - Set up AWS MediaConvert or similar
   - Update `/api/process` to trigger external job
   - Use webhooks to update video status

2. **Add CDN**:
   - Use Cloudflare or Vercel Edge Network
   - Cache HLS segments for better performance

3. **Implement Monitoring**:
   - Add error tracking
   - Monitor upload success rates
   - Track transcoding times

4. **Security Enhancements**:
   - Add authentication
   - Implement upload limits
   - Add rate limiting

</rewritten_file> 