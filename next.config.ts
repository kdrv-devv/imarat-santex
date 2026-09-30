import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev rejimida boshqa hostlardan (telefon, 127.0.0.1) kirishga ruxsat
  allowedDevOrigins: ["127.0.0.1", "localhost", "192.168.*.*", "10.*.*.*"],
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
