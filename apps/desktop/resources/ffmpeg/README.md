# FFmpeg Binaries

This directory contains platform-specific FFmpeg and FFprobe binaries.

## Directory Structure

```
ffmpeg/
├── darwin-arm64/    # macOS Apple Silicon (M1/M2/M3)
│   ├── ffmpeg
│   └── ffprobe
├── darwin-x64/      # macOS Intel
│   ├── ffmpeg
│   └── ffprobe
└── win32-x64/       # Windows 64-bit
    ├── ffmpeg.exe
    └── ffprobe.exe
```

## Download Instructions

### macOS (Both arm64 and x64)

Download static builds from:
- https://evermeet.cx/ffmpeg/

Or use ffmpeg-static npm package:
```bash
pnpm install -g ffmpeg-static ffprobe-static
```

Then copy the binaries to the appropriate directory:
```bash
# For Apple Silicon (M1/M2/M3)
cp $(which ffmpeg) darwin-arm64/ffmpeg
cp $(which ffprobe) darwin-arm64/ffprobe

# For Intel
cp $(which ffmpeg) darwin-x64/ffmpeg
cp $(which ffprobe) darwin-x64/ffprobe
```

Make them executable:
```bash
chmod +x darwin-arm64/ffmpeg darwin-arm64/ffprobe
chmod +x darwin-x64/ffmpeg darwin-x64/ffprobe
```

### Windows

Download static builds from:
- https://www.gyan.dev/ffmpeg/builds/
- Use "ffmpeg-release-essentials.zip"

Extract and copy:
```cmd
copy ffmpeg.exe win32-x64\ffmpeg.exe
copy ffprobe.exe win32-x64\ffprobe.exe
```

## Size Information

- FFmpeg: ~80-120 MB per platform
- FFprobe: ~40-60 MB per platform

## Version Recommendation

Use FFmpeg 6.x or later for best compatibility and performance.

## Verification

After downloading, verify the binaries work:

```bash
# macOS
./darwin-arm64/ffmpeg -version
./darwin-arm64/ffprobe -version

# Windows
.\win32-x64\ffmpeg.exe -version
.\win32-x64\ffprobe.exe -version
```

## License

FFmpeg is licensed under LGPL 2.1 or later. The binaries are built from the official FFmpeg source code.
See: https://ffmpeg.org/legal.html
