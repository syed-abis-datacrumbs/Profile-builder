import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable double-rendering in React dev mode to eliminate browser lag on large Studio components
  reactStrictMode: false,

  serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium', '@prisma/client', 'prisma'],
  
  // Tree-shake heavy package imports (lucide-react, framer-motion, clerk) so dev/build bundler doesn't process thousands of unused modules
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@clerk/nextjs',
      'canvas-confetti',
    ],
  },

  // Disable browser source maps in production to cut build time & bundle size
  productionBrowserSourceMaps: false,

  // Skip TypeScript type-check step during compilation
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
