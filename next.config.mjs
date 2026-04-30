/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // These packages use Node.js internals that cannot be bundled by webpack.
  // Mark them as external so Next.js loads them directly from node_modules.
  serverExternalPackages: ["openai", "pdfkit", "pdf-parse-fixed", "ioredis", "mammoth"],
};

export default nextConfig;
