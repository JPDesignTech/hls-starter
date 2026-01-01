#!/bin/bash

# Configure CORS for GCS bucket to allow direct browser uploads
# Usage: ./scripts/configure-gcs-cors.sh
#
# This script configures CORS to allow uploads from:
# - Localhost (for development)
# - All Vercel preview branches (*.vercel.app)
# - Custom production domain (if NEXT_PUBLIC_APP_URL or VERCEL_URL is set)

set -e

BUCKET_NAME="${GCS_BUCKET_NAME:-hls-starter-bucket}"
PROJECT_ID="${GCP_PROJECT_ID:-beemmeup}"

echo "🔧 Configuring CORS for GCS bucket: $BUCKET_NAME"
echo "📋 Project: $PROJECT_ID"

# Build origins array
ORIGINS=(
  "http://localhost:3000"
  "http://localhost:*"
  "https://*.vercel.app"
)

# Add custom production domain if provided
PRODUCTION_DOMAIN="${NEXT_PUBLIC_APP_URL:-${VERCEL_URL}}"
if [ -n "$PRODUCTION_DOMAIN" ]; then
  # Remove protocol if present
  PRODUCTION_DOMAIN="${PRODUCTION_DOMAIN#https://}"
  PRODUCTION_DOMAIN="${PRODUCTION_DOMAIN#http://}"
  # Remove trailing slash
  PRODUCTION_DOMAIN="${PRODUCTION_DOMAIN%/}"
  if [ -n "$PRODUCTION_DOMAIN" ]; then
    ORIGINS+=("https://$PRODUCTION_DOMAIN")
    echo "✅ Adding production domain: https://$PRODUCTION_DOMAIN"
  fi
fi

# Build JSON array of origins
ORIGINS_JSON="["
for i in "${!ORIGINS[@]}"; do
  if [ $i -gt 0 ]; then
    ORIGINS_JSON+=", "
  fi
  ORIGINS_JSON+="\"${ORIGINS[$i]}\""
done
ORIGINS_JSON+="]"

# Create CORS configuration JSON
cat > /tmp/cors-config.json << EOF
[
  {
    "origin": $ORIGINS_JSON,
    "method": ["PUT", "POST", "GET", "OPTIONS"],
    "responseHeader": ["Content-Type", "x-goog-resumable", "x-goog-*"],
    "maxAgeSeconds": 3600
  }
]
EOF

echo "📋 CORS origins configured:"
for origin in "${ORIGINS[@]}"; do
  echo "   - $origin"
done

# Apply CORS configuration
echo ""
echo "📋 Applying CORS configuration..."
if ! gcloud storage buckets update gs://$BUCKET_NAME \
  --cors-file=/tmp/cors-config.json \
  --project=$PROJECT_ID 2>&1; then
  echo "❌ Failed to apply CORS configuration"
  rm -f /tmp/cors-config.json
  exit 1
fi

# Verify CORS configuration
echo "✅ CORS configuration applied!"
echo "🔍 Verifying CORS configuration..."
gcloud storage buckets describe gs://$BUCKET_NAME \
  --format="yaml(cors)" \
  --project=$PROJECT_ID

# Cleanup
rm -f /tmp/cors-config.json

echo ""
echo "✅ CORS configuration complete!"
echo ""
echo "📝 Configured origins:"
for origin in "${ORIGINS[@]}"; do
  echo "   - $origin"
done
echo ""
echo "💡 To add additional domains, set NEXT_PUBLIC_APP_URL or VERCEL_URL environment variable"
echo "   and run this script again."
