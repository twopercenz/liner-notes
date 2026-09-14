// 배포 도메인을 한 곳에서 관리한다. 커스텀 도메인을 연결하면
// Vercel 프로젝트의 NEXT_PUBLIC_SITE_URL 환경변수만 바꿔주면 된다.
// (설정 안 하면 Vercel이 붙여준 기본 도메인으로 동작)
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const siteName = "Liner Notes";
export const siteDescription =
  "앨범, 싱글, EP, 곡에 대한 리뷰와 감상평, 구절별 해석을 기록하는 온라인 음악 다이어리";
