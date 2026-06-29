import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin the workspace root so an unrelated lockfile elsewhere on disk can't be
  // inferred as the root (we use this project's bun.lockb).
  turbopack: { root: import.meta.dirname },
  // Strict, modern image config so future poster/thumbnail art is optimized by default.
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
