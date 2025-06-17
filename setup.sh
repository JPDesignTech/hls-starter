#!/bin/bash

echo "🎬 HLS Streaming Service Setup"
echo "=============================="

# Check if FFmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ FFmpeg is not installed!"
    echo "Please install FFmpeg first:"
    echo "  macOS: brew install ffmpeg"
    echo "  Ubuntu: sudo apt-get install ffmpeg"
    echo "  Windows: Download from https://ffmpeg.org/download.html"
    exit 1
else
    echo "✅ FFmpeg is installed"
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p uploads output public/streams
echo "✅ Directories created"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOL
# Redis (optional - will use in-memory storage if not provided)
# KV_REST_API_URL=your_redis_url
# KV_REST_API_TOKEN=your_redis_token

# Google Cloud Storage (optional - will use local storage if not provided)
# GCS_BUCKET_NAME=your-bucket-name
# GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
EOL
    echo "✅ .env.local created (please update with your credentials)"
else
    echo "✅ .env.local already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
if command -v pnpm &> /dev/null; then
    pnpm install
elif command -v npm &> /dev/null; then
    npm install
else
    echo "❌ Neither pnpm nor npm found. Please install Node.js and a package manager."
    exit 1
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your Redis and GCS credentials (optional)"
echo "2. Run 'pnpm dev' to start the development server"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "Happy streaming! 🎥" 