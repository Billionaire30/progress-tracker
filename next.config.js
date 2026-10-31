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
  },

  // Cloudflare tunnel configuration for external access
  // These origins are allowed to access the dev server
  allowedDevOrigins: [
    '127.0.0.1', // Localhost IP
    'localhost', // Localhost hostname
    process.env.CLOUDFLARE_TUNNEL_URL || 'dvd-finder-applicable-drainage.trycloudflare.com', // Current Cloudflare tunnel
    'dvd-finder-applicable-drainage.trycloudflare.com', // Current tunnel (kept for compatibility)
    'blue-metals-processing-photographic.trycloudflare.com', // Previous tunnel (kept for compatibility)
    'moderator-variable-two-named.trycloudflare.com', // Previous tunnel (kept for compatibility)
    'surgeons-intellectual-transparent-roy.trycloudflare.com', // Previous tunnel (kept for compatibility)
    'harder-renewal-translation-lance.trycloudflare.com', // Previous tunnel (kept for compatibility)
    '100.112.31.210' // Local network IP
  ],

  // Environment variables to expose to the browser
  env: {
    CLOUDFLARE_TUNNEL_URL: process.env.CLOUDFLARE_TUNNEL_URL,
  },

  turbopack: {},
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
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig
