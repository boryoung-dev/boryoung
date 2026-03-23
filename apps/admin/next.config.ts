import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@repo/ui", "@repo/database"],
  serverExternalPackages: ["@prisma/client", "prisma"],
  outputFileTracingIncludes: {
    "/api/**": [
      "../../node_modules/.prisma/client/**",
      "../../node_modules/@prisma/client/**",
      "../../node_modules/.pnpm/@prisma+client@*/node_modules/.prisma/client/**",
      "../../packages/database/node_modules/.prisma/client/**",
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "postfiles.pstatic.net",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
};

export default nextConfig;
