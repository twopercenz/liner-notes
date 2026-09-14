import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// 브라우저 탭 파비콘. 맥시멀리즘 팔레트: 핑크 배경 + 검정 테두리의 비닐 레코드.
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
          background: "#ff2d55",
          border: "2px solid #14110f",
          borderRadius: 6,
        }}
      >
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#ffd400",
            border: "2px solid #14110f",
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
              background: "#14110f",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
