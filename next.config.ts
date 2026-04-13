export default {
  output: "standalone",

  serverExternalPackages: ["@sparticuz/chromium"],

  // ⭐ Disable Turbopack for server builds
  experimental: {
    serverMinification: false,
  },
};
