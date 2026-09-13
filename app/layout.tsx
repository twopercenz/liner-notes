import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GlobalNav from "@/components/GlobalNav";

// SF Pro는 Apple 플랫폼 전용 시스템 폰트라 웹에서는 직접 로드할 수 없다.
// DESIGN.md가 권장하는 대체 폰트인 Inter를 CSS 변수로 노출해 globals.css에서 사용한다.
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Liner Notes",
  description:
    "앨범, 싱글, EP, 곡에 대한 리뷰와 감상평, 해석을 기록하는 온라인 음악 다이어리",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={inter.variable}>
      <body>
        <GlobalNav />
        <main>{children}</main>
        <footer className="footer">
          <p className="text-fine-print">
            Liner Notes — 나만의 음악 해석 노트
          </p>
        </footer>
      </body>
    </html>
  );
}
