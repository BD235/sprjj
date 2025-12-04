import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Explicitly set the workspace root so dev/build/test commands don't
    // accidentally pick the parent directory when multiple lockfiles exist.
    root: __dirname,
  },
};

export default nextConfig;
