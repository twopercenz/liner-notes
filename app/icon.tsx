import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// 브라우저 탭 파비콘. 작은 사이즈라 디테일을 최소화하고
// clay 느낌의 그라데이션 배경 + 비닐 레코드 실루엣만 남긴다.
export default function Icon() {
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
          borderRadius: 8,
        }}
      >
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#fff6ec",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
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
