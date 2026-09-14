import { ImageResponse } from "next/og";
import { siteDescription } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 링크 공유(카카오톡, 트위터/X, 슬랙 등)에 쓰이는 미리보기 이미지.
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
          gap: 32,
          background: "#2f5bff",
          backgroundImage:
            "radial-gradient(#14110f 2px, transparent 2px)",
          backgroundSize: "28px 28px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
            background: "#fdf3df",
            border: "6px solid #14110f",
            borderRadius: 32,
            padding: "36px 56px",
            boxShadow: "16px 16px 0 #14110f",
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "#ff2d55",
              border: "6px solid #14110f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#ffd400",
                border: "4px solid #14110f",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#14110f",
                }}
              />
            </div>
          </div>
          <div
            style={{
              fontSize: 92,
              fontWeight: 800,
              color: "#14110f",
              display: "flex",
            }}
          >
            Liner Notes
          </div>
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#fdf3df",
            display: "flex",
            maxWidth: 820,
            textAlign: "center",
            background: "#14110f",
            padding: "10px 24px",
            borderRadius: 999,
          }}
        >
          {siteDescription}
        </div>
      </div>
    ),
    { ...size }
  );
}
