/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep standalone output if you want — it’s fine
  output: "standalone",

  // ❌ REMOVE Chromium bundling — no longer needed
  // serverExternalPackages: ["@sparticuz/chromium"],

  experimental: {
    // These are fine to keep or remove — they do NOT affect Playwright
    webpackBuildWorker: false,
    serverMinification: false,
  },
};

export default nextConfig;
