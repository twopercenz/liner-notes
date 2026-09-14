import type { Metadata, Viewport } from "next";
import { Black_Han_Sans, Gothic_A1 } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import GlobalNav from "@/components/GlobalNav";
import MarqueeBar from "@/components/MarqueeBar";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { siteDescription, siteName, siteUrl } from "@/lib/site";

// 맥시멀리즘: 두껍고 시끄러운 포스터체(Black Han Sans)를 헤딩에, 개성 있는
// 지오메트릭 산세리프(Gothic A1)를 본문에 쓴다. 둘 다 한글을 지원한다 —
// 이 사이트 텍스트의 대부분이 한글이라, 예전에 썼던 Inter/Baloo 2/Nunito는
// 사실 한글 글리프가 없어서 한글 텍스트에는 전혀 적용되지 않고 있었다.
const headingFont = Black_Han_Sans({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-heading",
});

const bodyFont = Gothic_A1({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
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
  themeColor: "#ff2d55",
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
        <MarqueeBar />
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
