import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import GlobalNav from "@/components/GlobalNav";
import SiteFooter from "@/components/SiteFooter";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { siteDescription, siteName, siteUrl } from "@/lib/site";

// Interop — Jang Haemin, OFL 라이선스 (fonts/interop/OFL.txt 참고).
// Inter 제작자 Rasmus Andersson과 Google 크레딧이 들어간, 한글까지 지원하는
// 산세리프. next/font/local로 직접 로드해서 자체 호스팅한다.
const interop = localFont({
  src: [
    { path: "../fonts/interop/Interop-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/interop/Interop-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/interop/Interop-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../fonts/interop/Interop-Bold.woff2", weight: "700", style: "normal" },
    { path: "../fonts/interop/Interop-ExtraBold.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-interop",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — 인디 가사 해석 아카이브`,
    template: `%s · ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    "인디 가사",
    "가사 해석",
    "가사 구절",
    "인디 음악",
    "음악 커뮤니티",
    "K-indie",
  ],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName,
    title: `${siteName} — 인디 가사 해석 아카이브`,
    description: siteDescription,
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} — 인디 가사 해석 아카이브`,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "oklch(0.99 0.004 75)" },
    { media: "(prefers-color-scheme: dark)", color: "oklch(0.17 0.012 55)" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={interop.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            <GlobalNav />
            {!isSupabaseConfigured && (
              <p className="bg-destructive/10 text-destructive border-b px-4 py-2 text-center text-sm font-medium">
                ⚠️ Supabase 환경변수가 설정되지 않았어요. 글쓰기/저장이 동작하지
                않습니다. Vercel 프로젝트 → Settings → Environment Variables에
                NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY를
                추가하고 다시 배포해주세요.
              </p>
            )}
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
          <Toaster position="bottom-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
