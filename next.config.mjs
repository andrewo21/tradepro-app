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

  // Security headers — applied to all routes
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking — stops your site being embedded in iframes on other domains
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Prevent MIME type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Force HTTPS for 1 year
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          // Control referrer info sent to third parties
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Limit browser features (camera, mic, etc.) — only what's needed
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Basic XSS protection for older browsers
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
      },
    ];
  },

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
