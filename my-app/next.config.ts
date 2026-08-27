import type { NextConfig } from "next";

const isElectron = process.env.ELECTRON === "true";

const nextConfig: NextConfig = {
  output: "export",
  devIndicators: false,
  ...(isElectron
    ? {
        assetPrefix: "./",
        trailingSlash: true,
      }
    : {}),
};

export default nextConfig;
