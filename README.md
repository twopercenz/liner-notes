# 🎧 Liner Notes

인디 밴드 가사의 한 구절과 그 해석을 나누는 곳. 가사 구절 + 해석("post")이
피드에 흐르고, 좋아요·댓글·무드 태그·가사 전문 검색까지 되는 온라인 커뮤니티입니다.

- **프론트엔드**: Next.js (App Router) + TypeScript
- **UI**: [shadcn/ui](https://ui.shadcn.com) (Radix UI 프리미티브 + Tailwind CSS v4) + [Interop](https://www.jhaemin.com) 폰트
- **데이터베이스**: Supabase (Postgres, `tsvector` 전문검색 포함)
- **곡/앨범 검색 자동완성**: iTunes Search API (무료, API 키 불필요)
- **가사**: lrclib.net (무료, API 키 불필요)
- **배포**: Vercel

## 핵심 개념: Work → Track → Post

- **Work**: 앨범/EP/싱글/곡 — 리뷰 대상이 되는 발매 단위
- **Track**: Work 안의 곡 하나. "곡" 타입 Work는 트랙이 정확히 1개(자기 자신)라
  앨범이든 싱글이든 곡이든 가사 처리 로직이 항상 동일하다.
- **Post**: 가사 구절 + 해석. **이 사이트의 핵심 콘텐츠 단위**이자 피드에
  흐르는 것. 좋아요, 댓글, 태그가 전부 Post에 붙는다.

## 1. Supabase 프로젝트 만들기

1. [supabase.com](https://supabase.com)에서 새 프로젝트 생성
2. **SQL Editor**에서 [`supabase/schema.sql`](./supabase/schema.sql) 실행
   - `works`, `tracks`, `posts`, `likes`, `comments`, `tags`, `post_tags` 테이블과
     로그인 없이도 누구나 읽고 쓸 수 있게 하는 RLS 정책이 생성됩니다.
   - `tracks.lyrics`, `posts`(quote+note)에 `tsvector` 전문검색 인덱스가 포함됩니다.
   - **이전 버전(entries/annotations/tracks/track_annotations)을 이미 배포했다면**
     `schema.sql` 대신 [`supabase/migrations/004_unify_posts_schema.sql`](./supabase/migrations/004_unify_posts_schema.sql)을
     실행하세요. ⚠️ **파괴적 마이그레이션**이라 기존 데이터가 삭제됩니다 — 보존하고
     싶은 데이터가 있다면 실행 전에 SQL Editor에서 CSV로 내보내두세요.
3. **Settings → API**에서 `Project URL`과 `anon public` 키를 복사

## 2. 환경변수 설정

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

## 3. 로컬 개발

```bash
npm install
npm run dev
```

<http://localhost:3000> 에서 확인할 수 있습니다.

## 4. Vercel로 배포하기

1. 이 저장소를 [vercel.com/new](https://vercel.com/new)에서 Import (Next.js 자동 감지)
2. **Environment Variables**에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 추가
3. **Deploy** — 이후 `main` 브랜치 푸시마다 자동 재배포

## 5. (선택) 커스텀 도메인

Vercel 프로젝트 → **Settings → Domains**에서 도메인을 연결하고, 연결한 도메인으로
`NEXT_PUBLIC_SITE_URL` 환경변수를 설정하면 Open Graph/sitemap이 그 도메인 기준으로 생성됩니다.

## 기능

- **가사 피드** (`/`) — 가사 구절 + 해석이 최신순으로 흐르는 메인 화면
- **좋아요/댓글** — 로그인 없이, 브라우저별 익명 id로 좋아요 중복만 방지
- **무드/태그 탐색** (`/explore`) — 태그로 필터링, 전체 작품 카탈로그
- **가사 전문 검색** — Postgres 전문검색으로 가사 구절/해석 본문을 검색 (아티스트·제목뿐 아니라 가사 내용까지)
- **Apple Music(iTunes) 검색 자동완성** — 아티스트/제목/발매연도/커버 자동 완성
- **가사 자동 가져오기 + 구절별 해석** — lrclib.net에서 가사를 받아오고, 구절을 드래그해서 해석 + 무드 태그를 달 수 있음 (Genius 스타일)
- **앨범/EP/싱글은 곡(트랙)별로 따로** — 트랙 목록 자동 가져오기, 트랙마다 독립적으로 가사/해석
- 별점, 감상평, 수정/삭제

## 파일 구조

```
liner-notes/
├── app/
│   ├── page.tsx               # 홈: 가사 피드
│   ├── explore/page.tsx        # 검색 + 태그/작품 탐색
│   ├── write/page.tsx           # 새 글쓰기
│   ├── write/[id]/page.tsx      # 글 수정
│   ├── entry/[id]/page.tsx      # 작품 상세 (트랙 목록 + 가사)
│   ├── post/[id]/page.tsx       # 가사 구절 상세 (좋아요/댓글)
│   ├── api/search/route.ts      # iTunes Search API 프록시
│   ├── api/lyrics/route.ts      # lrclib.net 프록시
│   ├── api/tracklist/route.ts   # iTunes Lookup 프록시
│   ├── layout.tsx, globals.css  # shadcn/ui 테마 + Interop 폰트
│   ├── icon.tsx / apple-icon.tsx / opengraph-image.tsx
│   └── manifest.ts, robots.ts, sitemap.ts, not-found.tsx
├── components/
│   ├── ui/                     # shadcn/ui 프리미티브 (button, card, input, dialog, ...)
│   ├── GlobalNav.tsx, SiteFooter.tsx
│   ├── PostCard.tsx             # 피드 카드
│   ├── LikeButton.tsx, CommentSection.tsx, TagPicker.tsx
│   ├── WorkForm.tsx             # 작성/수정 폼
│   ├── TrackList.tsx, WorkTracks.tsx  # 트랙별 가사 편집/보기
│   ├── LyricsAnnotator.tsx      # 가사 하이라이트 + 구절별 해석 (작성/보기 공용)
│   └── WorkCard.tsx
├── lib/
│   ├── supabaseClient.ts, site.ts, types.ts, utils.ts (shadcn cn())
│   ├── posts.ts                 # 피드/검색/태그별 조회 쿼리
│   ├── device.ts                # 익명 좋아요용 device id
│   └── textOffset.ts            # 텍스트 선택 ↔ 문자 오프셋 변환
├── fonts/interop/                # Interop 폰트 (OFL 라이선스, fonts/interop/OFL.txt)
├── supabase/
│   ├── schema.sql                # 새 프로젝트용 전체 스키마
│   └── migrations/004_unify_posts_schema.sql
└── .claude/skills/                # ui-ux-pro-max 스킬 번들 (디자인 레퍼런스)
```

## 폰트 라이선스

[Interop](https://www.jhaemin.com)은 Jang Haemin이 만든, SIL Open Font License로
배포되는 서체입니다 (한글 지원). 전체 라이선스는 [`fonts/interop/OFL.txt`](./fonts/interop/OFL.txt)를 참고하세요.

## 다음에 해볼 만한 것들

- 다크모드 토글 (CSS 변수는 이미 준비되어 있음, 스위치 UI만 추가하면 됨)
- Supabase Auth로 로그인 붙여서 "내 계정" 도입
- 무한 스크롤 피드, 인기순 정렬
- 댓글 대댓글, 신고 기능
