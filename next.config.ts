import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/doprava", destination: "/", permanent: false },
      { source: "/zastupitelstvo", destination: "/", permanent: false },
      { source: "/stavby", destination: "/", permanent: false },
      { source: "/komunita", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
