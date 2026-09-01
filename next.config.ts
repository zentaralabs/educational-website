import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * First-party proxy for GA4. Tracker blockers (Brave Shields, uBlock,
   * Firefox strict mode, some corporate DNS filters) block requests to
   * googletagmanager.com / google-analytics.com by domain — proxying them
   * through our own domain means the browser only ever sees same-origin
   * requests, which those domain-based blocklists don't match. This does
   * not defeat every blocker (some do content/behaviour sniffing), but it
   * recovers a meaningful share of otherwise-invisible traffic.
   *
   * Client side lives in src/components/site/Analytics.tsx — script src
   * points at /js/site.js, and gtag's `transport_url` config points at
   * /api/hit so event beacons route through here too.
   */
  async rewrites() {
    return [
      {
        source: "/js/site.js",
        destination: "https://www.googletagmanager.com/gtag/js",
      },
      {
        source: "/api/hit/:path*",
        destination: "https://www.google-analytics.com/:path*",
      },
    ];
  },
};

export default nextConfig;
