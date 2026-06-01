import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Block speech synthesis in all iframes (prevents Stonly TTS guides)
          {
            key: 'Permissions-Policy',
            value: 'speaker-selection=(self), microphone=()',
          },
        ],
      },
    ]
  },
};

export default nextConfig;
