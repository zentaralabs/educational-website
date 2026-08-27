import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site-config";

export const alt =
  "Where To Apply: university deadlines, admissions requirements, and costs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Default social-share card for every page that doesn't set its own image.
export default function Image() {
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
        <div style={{ display: "flex", fontSize: 34, letterSpacing: 1, color: "#9db3c9" }}>
          {SITE_NAME.toUpperCase()}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontSize: 74, lineHeight: 1.1, fontWeight: 700 }}>
            University deadlines, admissions, and costs in one place.
          </div>
          <div style={{ display: "flex", fontSize: 32, color: "#9db3c9" }}>
            Sourced, dated, and independently verified.
          </div>
        </div>
        <div style={{ display: "flex", height: 10, width: 220, background: "#3f6b4f" }} />
      </div>
    ),
    size,
  );
}
