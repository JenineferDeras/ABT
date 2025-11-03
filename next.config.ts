import type { NextConfig } from "next";

const nextConfig: NextConfig = {
<<<<<<< HEAD
  serverExternalPackages: [
    "@node-rs/argon2",
    "@node-rs/bcrypt",
    "@supabase/supabase-js",
  ],
=======
  serverExternalPackages: ["@node-rs/argon2", "@node-rs/bcrypt"],
>>>>>>> 420d661fb588b567d48bc8c8f6ee52b18239beb5
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
