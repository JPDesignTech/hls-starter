# HLS Starter Desktop

Electron-based desktop application for local FFmpeg video processing.

## Features

- Local FFmpeg/FFprobe execution (no cloud costs)
- Multi-quality HLS transcoding
- Native file picker integration
- Optional cloud upload for sharing
- Cross-platform (macOS, Windows)

## Development

```bash
# Install dependencies
pnpm install

# Run in development mode (starts Next.js + Electron)
pnpm run electron:dev

# Build for production
pnpm run electron:build

# Package for distribution
pnpm run electron:make
```

## Architecture

- **Main Process**: Electron window management and IPC handlers
- **Renderer Process**: Next.js web app (localhost:3000 in dev)
- **FFmpeg Integration**: Local binary execution via child_process
- **Storage**: Local filesystem with optional GCS upload
