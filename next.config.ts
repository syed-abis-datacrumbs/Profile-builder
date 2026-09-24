import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium'],
  
  // Optimize large package imports (lucide-react, framer-motion, clerk) so bundler doesn't process thousands of unused modules
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

  // Skip TypeScript type-check step during production compilation (use `bun x tsc --noEmit` separately)
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
