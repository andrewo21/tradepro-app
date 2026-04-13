import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@sparticuz/chromium"],

  experimental: {
    // keep any experimental flags you need
  },
};

export default nextConfig;
