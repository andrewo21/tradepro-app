/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  experimental: {
    turbo: false,
    webpackBuildWorker: false,
    serverMinification: false,
  },
};

module.exports = nextConfig;
