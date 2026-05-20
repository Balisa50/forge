import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Lint errors shouldn't block production deploys; run lint in CI separately.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "source.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    unoptimized: true, // Unsplash already serves optimized images
  },
};

export default nextConfig;
