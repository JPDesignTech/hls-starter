# FFprobe Cloud Run Service

This service provides FFprobe functionality for the HLS Analyzer app when deployed to Vercel.

## Deployment to Google Cloud Run

1. **Build and push the Docker image:**
```bash
# Set your project ID
export PROJECT_ID=your-gcp-project-id

# Build the image
docker build -t gcr.io/$PROJECT_ID/ffprobe-service .

# Push to Google Container Registry
docker push gcr.io/$PROJECT_ID/ffprobe-service
```

2. **Deploy to Cloud Run:**
```bash
gcloud run deploy ffprobe-service \
  --image gcr.io/$PROJECT_ID/ffprobe-service \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1
```

3. **Get the service URL:**
```bash
gcloud run services describe ffprobe-service \
  --platform managed \
  --region us-central1 \
  --format 'value(status.url)'
```

4. **Set the environment variable in Vercel:**
```
FFPROBE_SERVICE_URL=https://ffprobe-service-xxxxx-uc.a.run.app
```

## Usage

Once deployed, the service exposes a `/probe` endpoint:

```javascript
const response = await fetch(`${FFPROBE_SERVICE_URL}/probe`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://example.com/video.ts',
    detailed: false
  })
});

const result = await response.json();
```

## Local Testing

```bash
npm install
npm start
# Service runs on http://localhost:8080
```

## Cost Optimization

- Cloud Run only charges when the service is running
- The service scales to zero when not in use
- Consider implementing caching to reduce calls
- Use Cloud CDN for frequently accessed results 