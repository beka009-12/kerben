import type { NextConfig } from "next";

const backend = new URL(process.env.KERBEN_API_URL || process.env.KYRGYZGO_API_URL || "https://13.49.104.87");

const backendSocket = `${backend.protocol === "https:" ? "wss" : "ws"}://${backend.host}`;
const dev = process.env.NODE_ENV !== "production";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${backend.origin} https://images.unsplash.com https://upload.wikimedia.org https://tiles.openfreemap.org`,
  "font-src 'self' data: https://tiles.openfreemap.org",
  `connect-src 'self' ${backend.origin} ${backendSocket} https://tiles.openfreemap.org${dev ? " ws: wss:" : ""}`,
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "frame-src https://www.google.com https://www.openstreetmap.org",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  logging: { serverFunctions: false },
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*"],
  experimental: {
    serverActions: { bodySizeLimit: "5mb" },
    cpus: 2,
    staticGenerationMaxConcurrency: 4,
    staticGenerationRetryCount: 1,
  },
  images: {
    remotePatterns: [
      { protocol: backend.protocol.replace(":", "") as "http" | "https", hostname: backend.hostname, port: backend.port },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85, 90],
    minimumCacheTTL: 2678400,
  },
  async redirects() {
    const lang = ":lang(en|ru|de|zh)";
    return [
      { source: `/${lang}/login`, destination: "/:lang/chat", permanent: false },
      { source: `/${lang}/saved`, destination: "/:lang/trips?tab=saved", permanent: false },
      { source: `/${lang}/requests`, destination: "/:lang/trips", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
          { key: "Content-Security-Policy", value: csp },
          ...(dev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]),
        ],
      },
    ];
  },
};

export default nextConfig;
