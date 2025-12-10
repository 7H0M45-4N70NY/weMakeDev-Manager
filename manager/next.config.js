const withPWA = require("@ducanh2912/next-pwa").default({
    dest: "public",
    register: true,
    skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    /* config options here */
    reactCompiler: false,
};

module.exports = withPWA(nextConfig);
