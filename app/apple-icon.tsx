import { ImageResponse } from "next/og";

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
          background: "#2a2019",
        }}
      >
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            border: "14px solid #d97706",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "#d97706",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
