import { ImageResponse } from "next/og";
import { siteDescription } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
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
          gap: 28,
          background: "#fdf6ec",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              border: "10px solid #d97706",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: "#d97706",
              }}
            />
          </div>
          <div style={{ fontSize: 84, fontWeight: 800, color: "#2a2019", display: "flex" }}>
            Liner Notes
          </div>
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#6b5c4c",
            display: "flex",
            maxWidth: 820,
            textAlign: "center",
          }}
        >
          {siteDescription}
        </div>
      </div>
    ),
    { ...size }
  );
}
