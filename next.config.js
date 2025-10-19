/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  reactStrictMode: false, // ปิด strict เพื่อ dev ง่ายขึ้น
  webpack: (config) => {
    config.resolve.alias["@"] = path.resolve(__dirname); // ✅ ใช้ @ ชี้ไป root
    return config;
  },
};

module.exports = nextConfig;