import type { NextConfig } from "next";

const embedFrameAncestors = process.env.EMBED_FRAME_ANCESTORS ?? "'self'";

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

export default nextConfig;
