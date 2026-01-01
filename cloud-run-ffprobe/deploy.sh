#!/bin/bash

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

# Set your project ID
PROJECT_ID="beemmeup"  # CORRECT project
REGION="us-central1"
SERVICE_NAME="ffprobe-service"
AR_REPO="cloud-run-source-deploy"  # Default Artifact Registry repo for Cloud Run

echo "🚀 Deploying FFprobe service to Cloud Run..."
echo "📁 Working directory: $(pwd)"

# Enable required APIs
echo "📋 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com --project=$PROJECT_ID
gcloud services enable run.googleapis.com --project=$PROJECT_ID
gcloud services enable artifactregistry.googleapis.com --project=$PROJECT_ID

# Create Artifact Registry repository if it doesn't exist
echo "📦 Setting up Artifact Registry..."
gcloud artifacts repositories create $AR_REPO \
  --repository-format=docker \
  --location=$REGION \
  --description="Docker repository for Cloud Run" \
  --project=$PROJECT_ID \
  2>/dev/null || echo "Repository already exists"

# Configure Docker to use gcloud as credential helper for Artifact Registry
echo "🔧 Configuring Docker for Artifact Registry..."
gcloud auth configure-docker ${REGION}-docker.pkg.dev

# Build and push the image using Cloud Build to Artifact Registry
echo "🏗️ Building Docker image with Cloud Build..."
echo "📋 Dockerfile location: $(pwd)/Dockerfile"
# Verify Dockerfile exists
if [ ! -f "Dockerfile" ]; then
  echo "❌ Dockerfile not found in $(pwd). Aborting deployment."
  exit 1
fi
# Cloud Build will automatically detect Dockerfile in the current directory
if ! gcloud builds submit --tag ${REGION}-docker.pkg.dev/$PROJECT_ID/$AR_REPO/$SERVICE_NAME:latest --project=$PROJECT_ID .; then
  echo "❌ Build failed! Aborting deployment."
  exit 1
fi

# Deploy to Cloud Run
echo "☁️ Deploying to Cloud Run..."
echo "🔐 Using service account: devcli@beemmeup.iam.gserviceaccount.com"
gcloud run deploy $SERVICE_NAME \
  --image ${REGION}-docker.pkg.dev/$PROJECT_ID/$AR_REPO/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --project=$PROJECT_ID \
  --service-account=devcli@beemmeup.iam.gserviceaccount.com \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --timeout 60 \
  --concurrency 80 \
  --max-instances 10

# Get the service URL
echo "✅ Deployment complete!"
echo "🔗 Service URL:"
gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --project=$PROJECT_ID --format 'value(status.url)'