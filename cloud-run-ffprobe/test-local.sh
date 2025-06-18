#!/bin/bash

echo "🐳 Building Docker image locally..."
docker build -t ffprobe-test .

echo "🏃 Running container locally..."
docker run -d -p 8080:8080 --name ffprobe-local ffprobe-test

echo "⏳ Waiting for service to start..."
sleep 5

echo "🧪 Testing health check..."
curl -f http://localhost:8080 || echo "❌ Health check failed"

echo "🧪 Testing FFprobe..."
curl -X POST http://localhost:8080/probe \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://storage.googleapis.com/hls-starter-bucket/041e5ea7-1c32-4f52-9a3f-31c07b7d3c77/hls-1080p0000000000.ts",
    "detailed": false
  }' | jq .

echo "🧹 Cleaning up..."
docker stop ffprobe-local
docker rm ffprobe-local

echo "✅ Local test complete!" 