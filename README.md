# 🎧 Liner Notes

앨범, 싱글, EP, 곡에 대한 리뷰와 감상평, 해석을 기록하는 온라인 음악 다이어리입니다.
Next.js + Supabase로 만들어져 누구나 접속해서 글을 쓰고 읽을 수 있습니다.

- **프론트엔드**: Next.js (App Router) + TypeScript
- **데이터베이스**: Supabase (Postgres)
- **곡/앨범 검색 자동완성**: iTunes Search API (무료, API 키 불필요)
- **가사**: lrclib.net (무료, API 키 불필요)
- **배포**: Vercel
- **디자인**: 클레이모피즘(claymorphism) — 따뜻한 크림/코랄 팔레트 + 이중톤(raised/pressed) 그림자로 말랑한 느낌 (원래 참고했던 `DESIGN.md`의 Apple 스타일에서 전환)
- **3D 오브젝트**: 랜딩 히어로에 떠 있는 clay 도형들. 순수 CSS(`perspective` + `rotateX/Y`)로 구현 — WebGL 라이브러리 없이도 진짜 3D처럼 보임
- **SEO/공유**: Open Graph 이미지, 파비콘/앱 아이콘, `sitemap.xml`, `robots.txt`, PWA `manifest.webmanifest`까지 자동 생성

## 1. Supabase 프로젝트 만들기

1. [supabase.com](https://supabase.com)에서 새 프로젝트 생성
2. 프로젝트의 **SQL Editor**로 이동해서 [`supabase/schema.sql`](./supabase/schema.sql) 내용을 붙여넣고 실행
   - `entries`, `annotations`, `tracks`, `track_annotations` 테이블과, 로그인 없이도
     누구나 읽고 쓸 수 있게 하는 RLS 정책이 생성됩니다.
   - (나중에 특정 사용자만 쓰기 가능하게 바꾸고 싶다면, 이 정책들을 Supabase Auth 기반으로 교체하면 됩니다.)
   - **이미 예전 버전으로 배포해서 `entries` 테이블이 있다면** `schema.sql`을 다시 실행하지 말고
     아래 마이그레이션을 "실행한 적 없는 것만" 순서대로 실행하세요:
     1. [`002_lyrics_and_annotations.sql`](./supabase/migrations/002_lyrics_and_annotations.sql) — 가사 컬럼 + annotations 테이블
     2. [`003_tracks.sql`](./supabase/migrations/003_tracks.sql) — 앨범/EP/싱글의 곡별(트랙) 가사 + 해석
3. **Settings → API**에서 `Project URL`과 `anon public` 키를 복사

## 2. 환경변수 설정

`.env.example`을 복사해서 `.env.local`을 만들고 값을 채워주세요.

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

1. 이 저장소를 [vercel.com/new](https://vercel.com/new)에서 Import
2. Framework Preset은 자동으로 **Next.js**가 감지됩니다
3. **Environment Variables**에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 추가 (2단계와 동일한 값)
4. **Deploy** 클릭 → `https://liner-notes-<random>.vercel.app` 같은 주소로 배포 완료
5. 이후에는 `main` 브랜치에 푸시할 때마다 자동으로 재배포됩니다

## 5. (선택) 커스텀 도메인 연결하기

1. 원하는 도메인을 구매 (가비아, Namecheap, Vercel Domains 등 아무 곳이나)
2. Vercel 프로젝트 → **Settings → Domains** → 구매한 도메인 입력 → 안내되는 DNS 레코드(A/CNAME)를
   도메인 등록업체 설정에 추가
3. DNS가 반영되면(보통 몇 분~몇 시간) Vercel이 자동으로 SSL 인증서까지 발급해줌
4. Vercel 프로젝트 **Environment Variables**에 `NEXT_PUBLIC_SITE_URL=https://내도메인.com` 추가하고 재배포
   - 이 값은 `lib/site.ts`에서 Open Graph 링크, `sitemap.xml`, `robots.txt`의 기준 주소로 쓰입니다.
   - 설정 안 해도 사이트는 정상 동작하고, 그냥 Vercel 기본 도메인이 대신 쓰입니다.

## 기능

- 앨범 / EP / 싱글 / 곡 단위로 리뷰·감상평 작성
- **Apple Music(iTunes) 검색 자동완성** — 제목을 입력하면 실시간으로 검색 결과가 뜨고, 선택하면 아티스트/제목/발매연도/커버 이미지가 자동으로 채워짐
- **가사 자동 가져오기 + 구절별 해석** — "가사 자동으로 가져오기" 버튼으로 lrclib.net에서 가사를 받아오거나 직접 붙여넣고, 해석하고 싶은 구절을 마우스로 드래그해서 선택하면 그 부분에만 해석을 달 수 있음 (Genius 스타일). 상세 페이지에서는 가사 전문이 보이고, 해석이 달린 구절은 밑줄로 표시되어 클릭하면 해석이 펼쳐짐
- **앨범/EP/싱글은 곡(트랙)별로 따로** — 항목 제목이 앨범명이라 그대로는 가사를 못 찾으므로, "트랙 목록 자동으로 가져오기"(Apple Music에 있는 트랙리스트를 통째로 불러옴)나 "+ 트랙 추가"로 곡을 하나씩 추가하고, 각 트랙마다 독립적으로 가사를 가져와 구절별 해석을 달 수 있음
- 분류별 필터, 아티스트/제목 검색
- 별점
- 수정/삭제
- 모든 데이터는 Supabase에 저장되어 어느 기기에서 접속해도 동일하게 보임 (로그인 없이 누구나 쓰기 가능)
- 랜딩 페이지(`/`)에 3D clay 오브젝트가 떠 있는 히어로, 최근 리뷰 미리보기
- 커스텀 파비콘/앱 아이콘, 링크 공유 시 미리보기 카드(Open Graph), 검색엔진용 sitemap/robots

## 파일 구조

```
liner-notes/
├── app/
│   ├── page.tsx              # 랜딩 페이지: 히어로 + 최근 리뷰 미리보기
│   ├── browse/page.tsx        # 메인 페이지: 전체 목록 + 필터/검색
│   ├── write/page.tsx         # 새 글쓰기
│   ├── write/[id]/page.tsx    # 글 수정
│   ├── entry/[id]/page.tsx    # 상세 보기 (가사 + 구절별 해석 표시)
│   ├── api/search/route.ts    # iTunes Search API 프록시 (자동완성)
│   ├── api/lyrics/route.ts    # lrclib.net 프록시 (가사 가져오기)
│   ├── api/tracklist/route.ts # iTunes Lookup 프록시 (앨범의 트랙 목록 가져오기)
│   ├── layout.tsx
│   ├── globals.css            # 클레이모피즘 디자인 토큰
│   ├── icon.tsx / apple-icon.tsx / opengraph-image.tsx  # 아이콘 · 공유 미리보기 이미지 (자동 생성)
│   ├── manifest.ts            # PWA 매니페스트
│   ├── robots.ts / sitemap.ts # 검색엔진용
│   └── not-found.tsx          # 커스텀 404
├── components/
│   ├── GlobalNav.tsx
│   ├── ClayShapes.tsx         # 랜딩 히어로의 CSS 3D 오브젝트
│   ├── EntryBrowser.tsx       # 필터/검색 + 그리드
│   ├── EntryCard.tsx
│   ├── EntryForm.tsx          # 작성/수정 폼 + 검색 자동완성 + 가사/해석
│   ├── LyricsAnnotator.tsx    # 가사 하이라이트 + 구절별 해석 (작성/보기 공용)
│   ├── TrackList.tsx          # 앨범/EP/싱글의 곡별 가사 편집 (작성 폼용)
│   ├── TrackListView.tsx      # 곡별 가사 아코디언 (상세 페이지, 읽기 전용)
│   └── DeleteButton.tsx
├── lib/
│   ├── supabaseClient.ts
│   ├── site.ts                # 배포 도메인 등 사이트 전역 상수
│   ├── types.ts
│   └── textOffset.ts          # 텍스트 선택 ↔ 문자 오프셋 변환 유틸
└── supabase/
    ├── schema.sql             # 새 프로젝트용 전체 스키마
    └── migrations/
        ├── 002_lyrics_and_annotations.sql  # 가사/해석 기능 추가
        └── 003_tracks.sql                  # 앨범 등의 곡별(트랙) 가사/해석 추가
```

## 구절별 해석은 어떻게 저장되나요?

**"곡" 타입**은 항목 자체가 노래 한 곡이므로 `entries.lyrics` + `annotations` 테이블에 바로 저장합니다.
**"앨범/EP/싱글" 타입**은 곡이 여러 개라서 `tracks` 테이블(트랙별 `lyrics`) + `track_annotations`
테이블로 따로 관리합니다. 두 경우 모두 해석은 `start_offset`/`end_offset`(가사 문자열 기준 문자
인덱스), `quote`(해당 구절 텍스트), `note`(해석)로 저장됩니다. 가사를 수정하면 기존 해석들의
위치가 어긋날 수 있어서, 가사를 바꾸면 확인 후 그 가사에 달린 해석이 모두 초기화됩니다.

## 다음에 해볼 만한 것들

- Supabase Auth로 로그인 붙여서 "나만 쓰기" 모드로 전환
- 월간 감상 통계, 좋아하는 아티스트 랭킹
- 리뷰에 태그(장르, 무드) 붙이기
