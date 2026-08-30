import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site-config";

/** Shared 1200×630 social card. Route-level `opengraph-image.tsx` files
 * pull the page's own title/eyebrow through here so every share and link
 * preview carries the specific page, not one generic sitewide image. The
 * visual language matches the root app/opengraph-image.tsx fallback. */
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

// Served to crawlers, which refetch rarely — cache hard at the edge, and
// let ISR-style revalidation refresh in the background.
const OG_CACHE_CONTROL =
  "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";

export function ogCard(opts: { eyebrow: string; title: string }) {
  const title =
    opts.title.length > 110
      ? `${opts.title.slice(0, 107).trimEnd()}…`
      : opts.title;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#16233f",
          color: "#ffffff",
          padding: "80px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 30,
            letterSpacing: 1,
            color: "#9db3c9",
          }}
        >
          <span>{SITE_NAME.toUpperCase()}</span>
          <span>{opts.eyebrow.toUpperCase()}</span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: title.length > 70 ? 58 : 72,
            lineHeight: 1.12,
            fontWeight: 700,
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{ display: "flex", height: 10, width: 220, background: "#3f6b4f" }}
          />
          <div style={{ display: "flex", fontSize: 26, color: "#9db3c9" }}>
            Sourced, dated, independently verified.
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, headers: { "Cache-Control": OG_CACHE_CONTROL } },
  );
}
