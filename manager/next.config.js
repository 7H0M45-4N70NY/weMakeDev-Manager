const withPWA = require("@ducanh2912/next-pwa").default({
    dest: "public",
    register: true,
    skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    /* config options here */
    reactCompiler: false,
    webpack: (config) => {
        config.watchOptions = {
            poll: false,
            aggregateTimeout: 10000,
        };
        return config;
    },
};

module.exports = withPWA(nextConfig);
