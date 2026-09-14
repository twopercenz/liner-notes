import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS 홈 화면 아이콘. 맥시멀리즘 팔레트: 핑크 배경 + 두꺼운 검정 테두리 비닐 레코드.
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
          background: "#ff2d55",
        }}
      >
        <div
          style={{
            position: "relative",
            width: 116,
            height: 116,
            borderRadius: "50%",
            background: "#ffd400",
            border: "6px solid #14110f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
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
