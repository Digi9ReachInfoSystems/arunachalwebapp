import type { NextConfig } from "next";
 
const isDev = process.env.NODE_ENV !== "production";
 
const nextConfig: NextConfig = {
  poweredByHeader: false,

  // CVE-2025-55182 Protection: Disable experimental server actions
  experimental: {
    serverActions: {
      bodySizeLimit: '1mb', // Keep small limit for safety
      allowedOrigins: [], // Explicitly empty - don't allow server actions from any origin
    },
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "no-referrer" },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), usb=(), payment=(), clipboard-read=(), clipboard-write=(), accelerometer=(), autoplay=(self \"https://www.youtube.com\" \"https://www.youtube-nocookie.com\"), encrypted-media=(self \"https://www.youtube.com\" \"https://www.youtube-nocookie.com\"), fullscreen=(self \"https://www.youtube.com\"), gyroscope=(), magnetometer=(), midi=(), picture-in-picture=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://litfest.arunachal.gov.in",
              "worker-src 'self'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "img-src 'self' data: https: http: blob:",
              "media-src 'self' https: http: blob:",
              "connect-src 'self' data: https: http: ws: wss:",
              "frame-src 'self' https://www.youtube.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join("; ")
          },
          { key: "X-DNS-Prefetch-Control", value: isDev ? "on" : "off" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
      },
    ];
  },

  images: {
    domains: ["litfest.arunachal.gov.in", "localhost"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "litfest.arunachal.gov.in",
        pathname: "/api/v1/uploads/**",
      },
      {
        protocol: "https",
        hostname: "litfest.arunachal.gov.in",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/api/v1/uploads/**",
      },
    ],
    unoptimized: true, // ✅ allow encoded-space URLs & skip optimization issues
  },

};
 
export default nextConfig;
