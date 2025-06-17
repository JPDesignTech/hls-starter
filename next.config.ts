import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Enable server actions with larger body size
    serverActions: {
      bodySizeLimit: '2gb',
    },
  },
  // Add webpack configuration to handle fluent-ffmpeg issues
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ignore the lib-cov folder that fluent-ffmpeg tries to require
      config.resolve.alias = {
        ...config.resolve.alias,
        './lib-cov/fluent-ffmpeg': false,
      };
      
      // Mark fluent-ffmpeg as external to prevent bundling issues
      config.externals = [...(config.externals || []), 'fluent-ffmpeg'];
    }
    return config;
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
