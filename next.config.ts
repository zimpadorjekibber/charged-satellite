import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Restored static export for stability
  trailingSlash: true, // Restored for consistent routing
  // @ts-ignore
  turbopack: {
    root: 'c:\\Users\\Asus\\.gemini\\antigravity\\playground\\charged-satellite'
  },
  experimental: {

  },
  images: {
    unoptimized: true,
  },
  /* config options here */
};

export default nextConfig;
