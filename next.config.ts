/** @type {import('next').NextConfig} */
const nextConfig = {
  // ⭐ Required so Vercel bundles node_modules (including Chromium)
  output: "standalone",

  // ⭐ Required so Next.js does NOT tree-shake Chromium
  serverExternalPackages: ["@sparticuz/chromium"],

  experimental: {
    // ⭐ Forces Webpack for server builds (disables Turbopack server compiler)
    webpackBuildWorker: false,

    // ⭐ Prevents certain Turbopack optimizations that strip binaries
    serverMinification: false,
  },
};

export default nextConfig;
