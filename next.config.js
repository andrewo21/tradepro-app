/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep standalone output if you want — it’s fine
  output: "standalone",

  experimental: {
    // Disable Turbopack so Vercel uses Webpack instead
    turbo: false,

    // These are fine to keep — they do NOT affect PDF generation
    webpackBuildWorker: false,
    serverMinification: false,
  },
};

export default nextConfig;
