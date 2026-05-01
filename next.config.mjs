/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // These packages use Node.js internals that cannot be bundled by webpack.
  serverExternalPackages: ["openai", "pdfkit", "pdf-parse-fixed", "ioredis", "mammoth"],

  // Redirect tradeprotech.com.br root to the Brazilian portal
  async redirects() {
    return [
      {
        source: "/",
        has: [{ type: "host", value: "tradeprotech.com.br" }],
        destination: "/br",
        permanent: false,
      },
      {
        source: "/",
        has: [{ type: "host", value: "www.tradeprotech.com.br" }],
        destination: "/br",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
