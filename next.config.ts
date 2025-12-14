import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Restored static export for stability
  trailingSlash: true, // Restored for consistent routing

  experimental: {

  },
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  /* config options here */
};

export default nextConfig;
