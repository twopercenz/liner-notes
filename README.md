# 🎧 Liner Notes

앨범, 싱글, EP, 곡에 대한 리뷰와 감상평, 해석을 기록하는 개인 음악 다이어리입니다.
음반 재킷 안쪽에 들어있는 해설지("liner notes")에서 이름을 따왔습니다.

## 기능

- 앨범 / EP / 싱글 / 곡 단위로 기록 작성
- 별점, 감상평(한줄평), 해석(가사·컨셉 분석) 작성
- 분류별 필터, 아티스트/제목 검색
- 커버 이미지 URL 등록 가능
- 모든 데이터는 브라우저 `localStorage`에 저장 (별도 서버/DB 없음)

## 실행 방법

빌드 과정이 필요 없는 순수 HTML/CSS/JS 프로젝트입니다.

- `index.html`을 브라우저로 바로 열거나
- VS Code의 "Live Server" 확장 등으로 열면 됩니다.

## GitHub Pages로 배포하기

1. 이 저장소의 **Settings → Pages** 로 이동
2. **Source**를 `Deploy from a branch`로 설정
3. Branch를 `main` / `(root)`로 선택 후 저장
4. 잠시 후 `https://twopercenz.github.io/liner-notes/` 에서 접속 가능

## 파일 구조

```
liner-notes/
├── index.html   # 마크업 + 작성/상세 모달
├── style.css    # 다크 테마 스타일
├── app.js       # 데이터 저장/렌더링 로직
└── README.md
```

## 다음에 해볼 만한 것들

- Last.fm / MusicBrainz API로 앨범 커버 자동 검색
- Supabase 연동으로 로그인 + 여러 기기 동기화
- 월간 감상 통계, 좋아하는 아티스트 랭킹
