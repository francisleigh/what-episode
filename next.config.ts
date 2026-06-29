import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Strict, modern image config so future poster/thumbnail art is optimized by default.
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
