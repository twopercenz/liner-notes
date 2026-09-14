import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS 홈 화면 아이콘. 사이즈가 커서 clay 특유의 이중 하이라이트(살짝 밝은 반사광)까지 표현한다.
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
          background: "linear-gradient(145deg, #ffab8a, #ff7a59)",
        }}
      >
        <div
          style={{
            position: "relative",
            width: 112,
            height: 112,
            borderRadius: "50%",
            background: "#fff6ec",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "inset 6px 6px 14px rgba(255,122,89,0.18)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 14,
              left: 22,
              width: 34,
              height: 18,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.65)",
              transform: "rotate(-25deg)",
              display: "flex",
            }}
          />
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "#ff7a59",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
