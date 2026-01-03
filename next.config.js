import withPWA from "next-pwa";

const isProd = process.env.NODE_ENV === "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

const pwaConfig = {
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: !isProd,
};

export default withPWA(pwaConfig)(nextConfig);
