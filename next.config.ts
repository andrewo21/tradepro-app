import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  serverExternalPackages: ["@sparticuz/chromium"],

  experimental: {
    // keep anything else you need
  },
};

export default nextConfig;
