import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Enable server actions with larger body size
    serverActions: {
      bodySizeLimit: '2gb',
    },
  },
  // Configure headers for HLS streaming
  async headers() {
    return [
      {
        source: '/streams/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, OPTIONS',
          },
        ],
      },
      {
        source: '/streams/:path*.m3u8',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/vnd.apple.mpegurl',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache',
          },
        ],
      },
      {
        source: '/streams/:path*.ts',
        headers: [
          {
            key: 'Content-Type',
            value: 'video/mp2t',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
