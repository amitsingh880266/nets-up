import { ImageResponse } from "next/og";

export const alt = "NetsUp — Cricket Net Practice Tracker";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#050505",
          color: "#f5f5f5",
        }}
      >
        <div style={{ display: "flex", fontSize: 128, fontWeight: 900 }}>
          Nets
          <span style={{ color: "#a3e635" }}>Up</span>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontSize: 34,
            color: "rgba(255,255,255,0.7)",
          }}
        >
          Track every ball. Improve every session.
        </div>
      </div>
    ),
    { ...size },
  );
}
