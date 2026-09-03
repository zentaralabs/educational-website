import type { NextConfig } from "next";

/**
 * Response headers. Nothing here existed before — every page was served with
 * no CSP, no framing rule, no MIME-sniffing rule and no referrer policy, so
 * these are the baseline browser-enforced defences.
 *
 * The CSP deliberately keeps `'unsafe-inline'` for scripts. A nonce-based
 * policy has to be minted per request in `proxy.ts`, which would make every
 * page dynamic and give up the prerendering the whole site depends on. The
 * three directives that actually stop the attacks we can be hit by —
 * `object-src`, `base-uri` and `frame-ancestors` — need no nonce, so we take
 * those in full and treat inline script as the accepted residual risk.
 * (Stored-XSS through JSON-LD is closed at the source instead: see
 * src/lib/json-ld.tsx.)
 */
const CSP = [
  "default-src 'self'",
  // 'unsafe-inline'/'unsafe-eval': Next's inline bootstrap + the gtag snippet.
  // googletagmanager/google-analytics stay listed as a fallback for visitors
  // whose requests don't go through the first-party rewrites below.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://www.googletagmanager.com",
  // No plugins, no embedded frames, and this site is never framed by anyone.
  "object-src 'none'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  // Stops an injected <base> from re-pointing every relative URL, and stops
  // an injected form from posting credentials off-site.
  "base-uri 'self'",
  "form-action 'self'",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP },
  // Vercel already sends HSTS but without subdomain coverage or preload.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Legacy twin of frame-ancestors, for browsers that predate CSP level 2.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "accelerometer=(), autoplay=(), camera=(), display-capture=(), encrypted-media=(), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), usb=(), xr-spatial-tracking=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

// Authenticated + credential-handling routes. These must never be cached by a
// shared cache, never framed, never indexed, and never readable cross-origin
// (the platform's default `Access-Control-Allow-Origin: *` on HTML responses
// is explicitly overridden back to same-origin here).
const PRIVATE_HEADERS = [
  ...SECURITY_HEADERS,
  { key: "Cache-Control", value: "no-store, max-age=0, must-revalidate" },
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "Access-Control-Allow-Origin", value: "null" },
];

const nextConfig: NextConfig = {
  // Don't advertise the framework version to fingerprinting scanners.
  poweredByHeader: false,

  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      { source: "/admin/:path*", headers: PRIVATE_HEADERS },
      { source: "/login", headers: PRIVATE_HEADERS },
      { source: "/forgot-password", headers: PRIVATE_HEADERS },
      { source: "/reset-password", headers: PRIVATE_HEADERS },
      // Long-lived immutable assets: the OG cards are regenerated only when
      // their source page changes, and crawlers refetch them rarely.
      {
        source: "/:path*/og",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },

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
