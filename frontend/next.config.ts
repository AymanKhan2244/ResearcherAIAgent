import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://researcheraiagent-1.onrender.com/:path*", // Proxy to Backend
      },
    ];
  },
};

export default nextConfig;
