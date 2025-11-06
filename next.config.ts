import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@node-rs/argon2",
    "@node-rs/bcrypt",
    "@supabase/supabase-js",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Allow cross-origin requests in development only (Codespaces/local)
  // This configuration is NOT applied in production for security
  ...(process.env.NODE_ENV === "development" && {
    experimental: {
      allowedDevOrigins: [
        "127.0.0.1",
        "localhost",
        "*.codespaces.githubusercontent.com",
        "*.github.dev",
      ],
    },
  }),
};

export default nextConfig;
