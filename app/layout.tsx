import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import GlobalNav from "@/components/GlobalNav";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { siteDescription, siteName, siteUrl } from "@/lib/site";

// 클레이모피즘 톤에 맞춰 큼직하고 둥근 느낌의 헤딩용 폰트(Baloo 2)와
// 가독성 좋은 본문용 폰트(Nunito)를 함께 쓴다. 둘 다 둥근 글자 끝이
// 특징이라 카드/버튼의 말랑한 그림자와 잘 어울린다.
const headingFont = Baloo_2({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-heading",
});

const bodyFont = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — 나만의 음악 해석 노트`,
    template: `%s · ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: ["음악 리뷰", "앨범 리뷰", "가사 해석", "음악 다이어리", "K-indie", "인디 락"],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName,
    title: `${siteName} — 나만의 음악 해석 노트`,
    description: siteDescription,
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} — 나만의 음악 해석 노트`,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#ff7a59",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body>
        <GlobalNav />
        {!isSupabaseConfigured && (
          <p className="config-warning text-caption">
            ⚠️ Supabase 환경변수가 설정되지 않았어요. 글쓰기/저장이 동작하지
            않습니다. Vercel 프로젝트 → Settings → Environment Variables에
            NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY를 추가하고
            다시 배포해주세요.
          </p>
        )}
        <main>{children}</main>
        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-brand">
              <span className="footer-logo">Liner Notes</span>
              <p className="text-fine-print">나만의 음악 해석 노트</p>
            </div>
            <nav className="footer-links">
              <Link href="/" className="text-caption">
                홈
              </Link>
              <Link href="/browse" className="text-caption">
                둘러보기
              </Link>
              <Link href="/write" className="text-caption">
                새 글쓰기
              </Link>
            </nav>
          </div>
          <p className="text-fine-print footer-copyright">
            © {new Date().getFullYear()} {siteName}
          </p>
        </footer>
      </body>
    </html>
  );
}
