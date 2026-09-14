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
          background: "linear-gradient(160deg, #fff6ec 0%, #ffe4d3 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "linear-gradient(145deg, #ffab8a, #ff7a59)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "10px 10px 24px rgba(200,110,70,0.25)",
            }}
          >
            <div
              style={{
                width: 66,
                height: 66,
                borderRadius: "50%",
                background: "#fff6ec",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "#ff7a59",
                }}
              />
            </div>
          </div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 800,
              color: "#4a2f22",
              display: "flex",
            }}
          >
            Liner Notes
          </div>
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#8a6a56",
            display: "flex",
            maxWidth: 860,
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
