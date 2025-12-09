import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export', // Removed for standard dynamic deployment
  // trailingSlash: true, // Removed for standard routing
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
