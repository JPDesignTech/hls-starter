#!/bin/bash

# Set your project ID
PROJECT_ID="personalportfolio-4caf3"  # I see this from your console
REGION="us-central1"
SERVICE_NAME="ffprobe-service"
AR_REPO="cloud-run-source-deploy"  # Default Artifact Registry repo for Cloud Run

echo "🚀 Deploying FFprobe service to Cloud Run..."

# Enable required APIs
echo "📋 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com

# Create Artifact Registry repository if it doesn't exist
echo "📦 Setting up Artifact Registry..."
gcloud artifacts repositories create $AR_REPO \
  --repository-format=docker \
  --location=$REGION \
  --description="Docker repository for Cloud Run" \
  2>/dev/null || echo "Repository already exists"

# Configure Docker to use gcloud as credential helper for Artifact Registry
echo "🔧 Configuring Docker for Artifact Registry..."
gcloud auth configure-docker ${REGION}-docker.pkg.dev

# Build and push the image using Cloud Build to Artifact Registry
echo "🏗️ Building Docker image with Cloud Build..."
gcloud builds submit --tag ${REGION}-docker.pkg.dev/$PROJECT_ID/$AR_REPO/$SERVICE_NAME .

# Deploy to Cloud Run
echo "☁️ Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image ${REGION}-docker.pkg.dev/$PROJECT_ID/$AR_REPO/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --timeout 60 \
  --concurrency 80 \
  --max-instances 10

# Get the service URL
echo "✅ Deployment complete!"
echo "🔗 Service URL:"
gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)' 