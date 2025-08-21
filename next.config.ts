import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },

  // Optimize for development
  reactStrictMode: true,

  // Reduce source map size in development
  productionBrowserSourceMaps: false,

  // TypeScript and ESLint optimizations
  typescript: {
    // During development, you might want to temporarily set this to true
    // to skip type checking for faster builds
    ignoreBuildErrors: false,
  },
  eslint: {
    // During development builds, you might want to temporarily set this to true
    ignoreDuringBuilds: false,
  },



  // Webpack configuration to handle Node.js modules in client-side code
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      // Client-side configuration - provide empty module for async_hooks
      const mockPath = require('path').resolve(__dirname, 'lib/mocks/async-hooks.js');

      config.resolve = {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          // Provide empty module for async_hooks
          async_hooks: mockPath,
        },
        fallback: {
          ...config.resolve?.fallback,
          // Set fallbacks to false
          async_hooks: false,
          fs: false,
          net: false,
          tls: false,
          dns: false,
          child_process: false,
        },
      };

      // Add a plugin to handle the empty module
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /async_hooks/,
          (resource: { request: string }) => {
            if (resource.request === 'async_hooks') {
              resource.request = mockPath;
            }
          }
        )
      );
    }

    return config;
  },


};

export default nextConfig;
