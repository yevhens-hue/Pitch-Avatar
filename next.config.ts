import type { NextConfig } from "next";

const nextConfig: any = {
  /* config options here */
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
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
