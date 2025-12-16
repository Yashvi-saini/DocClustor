import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
