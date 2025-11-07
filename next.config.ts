import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "**.githubusercontent.com",
      },
    ],
    unoptimized: process.env.NODE_ENV === "development",
  },
  headers: async () => {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Content-Type",
            value: "application/json",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },
  redirects: async () => {
    return [
      {
        source: "/auth/callback",
        destination: "/dashboard",
        permanent: false,
      },
    ];
  },
  typedRoutes: true,
};

export default nextConfig;
