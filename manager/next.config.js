const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: false,

  // Silence Turbopack + webpack config clash; we force webpack via dev script.
  turbopack: {},

  webpack: (config) => {
    config.watchOptions = {
      poll: false,
      aggregateTimeout: 10000,
    };
    return config;
  },

  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
