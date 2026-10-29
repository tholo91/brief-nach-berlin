import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(self), geolocation=(), interest-cohort=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  logging: {
    serverFunctions: false,
    incomingRequests: { ignore: [/\/rueckmeldung(?:[/?]|$)/] },
  },
  // Die spezifische Regel /schule/ablauf muss vor jeder /schule-Regel stehen; /schule selbst wird nie umgeleitet (D-07).
  async redirects() {
    return [
      { source: "/schule/ablauf", destination: "/unterricht/ablauf", statusCode: 301 },
      { source: "/lehrer", destination: "/unterricht", statusCode: 301 },
      { source: "/lehrkraefte", destination: "/unterricht", statusCode: 301 },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
