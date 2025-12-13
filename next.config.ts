import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/google',
        destination: '/oauth/callback',
        permanent: true,
      },
      {
        source: '/github',
        destination: '/oauth/callback',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
