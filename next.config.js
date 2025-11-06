/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias["@"] = path.resolve(__dirname); // ✅ ใช้ @ ชี้ไป root
    return config;
  },
};

module.exports = nextConfig;