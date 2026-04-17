// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  experimental: {
    webpackBuildWorker: false,
    serverMinification: false,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
