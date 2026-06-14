import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/google',
        destination: '/oauth/callback',
        permanent: false,
      },
      {
        source: '/github',
        destination: '/oauth/callback',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
