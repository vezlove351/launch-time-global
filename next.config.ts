import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost:3000, localhost:3001', 'api.ideogram.ai'], // Add 'api.ideogram.ai' to the list and domains of your image sources here
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  optimizeFonts: false // disable automatic font optimization
  
};

export default nextConfig;

