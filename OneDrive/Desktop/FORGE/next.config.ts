import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Type errors now HARD-FAIL the build. The whole codebase typechecks
  // clean (audited 2026-05). A type error can never silently ship to
  // production again. If the build fails on types, fix the type - do
  // NOT re-enable ignoreBuildErrors.
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
