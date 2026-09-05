import { ImageResponse } from "next/og";

// iOS home-screen icon. Apple doesn't accept the SVG used for the browser
// favicon (see icon.svg), so this re-renders the same mark — navy square,
// dashed ring, serif "W" — as a PNG at the size iOS expects.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1B2A4A",
          borderRadius: 40,
        }}
      >
        <div
          style={{
            width: 118,
            height: 118,
            borderRadius: "50%",
            border: "3px solid #FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 84,
              fontWeight: 700,
              color: "#FFFFFF",
            }}
          >
            W
          </div>
        </div>
      </div>
    ),
    size,
  );
}
