# 🎧 Liner Notes

앨범, 싱글, EP, 곡에 대한 리뷰와 감상평, 해석을 기록하는 온라인 음악 다이어리입니다.
Next.js + Supabase로 만들어져 누구나 접속해서 글을 쓰고 읽을 수 있습니다.

- **프론트엔드**: Next.js 14 (App Router) + TypeScript
- **데이터베이스**: Supabase (Postgres)
- **곡/앨범 검색 자동완성**: iTunes Search API (무료, API 키 불필요)
- **배포**: Vercel
- **디자인**: `DESIGN.md`(Apple 스타일 디자인 시스템)의 컬러/타이포/컴포넌트 토큰을 그대로 구현

## 1. Supabase 프로젝트 만들기

1. [supabase.com](https://supabase.com)에서 새 프로젝트 생성
2. 프로젝트의 **SQL Editor**로 이동해서 [`supabase/schema.sql`](./supabase/schema.sql) 내용을 붙여넣고 실행
   - `entries` 테이블과, 로그인 없이도 누구나 읽고 쓸 수 있게 하는 RLS 정책이 생성됩니다.
   - (나중에 특정 사용자만 쓰기 가능하게 바꾸고 싶다면, 이 정책들을 Supabase Auth 기반으로 교체하면 됩니다.)
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

## 기능

- 앨범 / EP / 싱글 / 곡 단위로 리뷰·감상평·해석 작성
- **Apple Music(iTunes) 검색 자동완성** — 제목을 입력하면 실시간으로 검색 결과가 뜨고, 선택하면 아티스트/제목/발매연도/커버 이미지가 자동으로 채워짐
- 분류별 필터, 아티스트/제목 검색
- 별점, 감상평, 해석(가사·컨셉 분석) 작성
- 수정/삭제
- 모든 데이터는 Supabase에 저장되어 어느 기기에서 접속해도 동일하게 보임 (로그인 없이 누구나 쓰기 가능)

## 파일 구조

```
liner-notes/
├── app/
│   ├── page.tsx              # 홈: 히어로 + 필터/검색 + 카드 그리드
│   ├── write/page.tsx         # 새 글쓰기
│   ├── write/[id]/page.tsx    # 글 수정
│   ├── entry/[id]/page.tsx    # 상세 보기
│   ├── api/search/route.ts    # iTunes Search API 프록시 (자동완성)
│   ├── layout.tsx
│   └── globals.css            # DESIGN.md 디자인 토큰 구현
├── components/
│   ├── GlobalNav.tsx
│   ├── EntryBrowser.tsx       # 필터/검색 + 그리드
│   ├── EntryCard.tsx
│   ├── EntryForm.tsx          # 작성/수정 폼 + 검색 자동완성
│   └── DeleteButton.tsx
├── lib/
│   ├── supabaseClient.ts
│   └── types.ts
├── supabase/
│   └── schema.sql             # Supabase에 실행할 테이블/정책 SQL
└── DESIGN.md                  # 참고한 Apple 스타일 디자인 시스템 문서
```

## 다음에 해볼 만한 것들

- Supabase Auth로 로그인 붙여서 "나만 쓰기" 모드로 전환
- 월간 감상 통계, 좋아하는 아티스트 랭킹
- 리뷰에 태그(장르, 무드) 붙이기
