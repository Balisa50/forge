import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  // Client router cache: keep a visited dynamic page's RSC payload for 30s so
  // switching back to a tab you just left is INSTANT instead of a full server
  // round trip (Neon cold starts + slow networks made every tab click feel
  // dead). Mutations still bust it via router.refresh()/revalidate.
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  // The roadmap + actuary loaders read JSON from /data at runtime via
  // fs.readdirSync(process.cwd()/data/...). Dynamic reads are NOT auto-traced
  // into Vercel's serverless bundle, so without this the files are missing in
  // production and loadAllExamPaths()/loadAllRoadmaps() silently return [] (the
  // section just vanishes). Force-include the data dir for the learn routes.
  outputFileTracingIncludes: {
    "/learn": ["./data/**"],
    "/learn/**": ["./data/**"],
    "/learn/exam/[slug]": ["./data/exam-paths/**"],
    "/learn/exam/[slug]/[concept]": ["./data/exam-paths/**"],
  },
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
