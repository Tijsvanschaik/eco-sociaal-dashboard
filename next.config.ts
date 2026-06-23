import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";

import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const embedFrameAncestors = process.env.EMBED_FRAME_ANCESTORS ?? "'self'";

const revision =
  spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout.trim() || randomUUID();

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  additionalPrecacheEntries: [{ url: "/~offline", revision }],
  disable: process.env.NODE_ENV === "development",
  globPublicPatterns: ["icons/**/*.{png,svg}"],
});

const securityHeadersApp = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=()" },
];

const securityHeadersEmbed = [
  {
    key: "Content-Security-Policy",
    value: `frame-ancestors ${embedFrameAncestors};`,
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: true,
  async headers() {
    return [
      {
        source: "/embed/:path*",
        headers: securityHeadersEmbed,
      },
      {
        source: "/:path((?!embed).*)",
        headers: securityHeadersApp,
      },
    ];
  },
};

export default withSerwist(nextConfig);
