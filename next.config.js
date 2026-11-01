/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    qualities: [60, 75, 80, 85],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Cloudflare tunnel configuration for external access
  // These origins are allowed to access the dev server
  allowedDevOrigins: [
    '127.0.0.1', // Localhost IP
    'localhost', // Localhost hostname
    '*.trycloudflare.com', // Allow all Cloudflare tunnel domains
    'adipex-alumni-cloth-focus.trycloudflare.com', // Previous tunnel (kept for compatibility)
    'dvd-finder-applicable-drainage.trycloudflare.com', // Previous tunnel (kept for compatibility)
    'blue-metals-processing-photographic.trycloudflare.com', // Previous tunnel (kept for compatibility)
    'moderator-variable-two-named.trycloudflare.com', // Previous tunnel (kept for compatibility)
    'surgeons-intellectual-transparent-roy.trycloudflare.com', // Previous tunnel (kept for compatibility)
    'harder-renewal-translation-lance.trycloudflare.com', // Previous tunnel (kept for compatibility)
    'harley-oklahoma-inn-ultram.trycloudflare.com', // Previous tunnel (kept for compatibility)
    'set-limited-ice-cheap.trycloudflare.com', // Previous tunnel (kept for compatibility)
    '100.112.31.210' // Local network IP
  ],



  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
            priority: 10,
          },
          radix: {
            name: 'radix',
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
            chunks: 'all',
            priority: 20,
          },
          recharts: {
            name: 'recharts',
            test: /[\\/]node_modules[\\/]recharts[\\/]/,
            chunks: 'all',
            priority: 20,
          },
        },
      },
    };
    return config;
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts'],
    optimizeCss: true,
  },
  compiler: {
    removeConsole: false,
    reactRemoveProperties: false,
  },
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig
