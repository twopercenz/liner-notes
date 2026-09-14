-- Liner Notes 데이터베이스 스키마
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 실행하세요.

create table if not exists entries (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('album', 'ep', 'single', 'song')),
  artist text not null,
  title text not null,
  year text,
  cover_url text,
  apple_music_id text,
  rating int not null default 0 check (rating between 0 and 5),
  review text,
  interpretation text, -- 옛 버전(줄 단위 해석 이전)의 자유 텍스트 해석. 하위호환용으로 남겨둠.
  lyrics text, -- 가사 전문. 이 위에 annotations로 구절별 해석을 붙인다.
  created_at timestamptz not null default now()
);

-- Row Level Security 활성화
alter table entries enable row level security;

-- 이 프로젝트는 "누구나 공개적으로 쓸 수 있는" 방식을 선택했으므로
-- anon(비로그인) 역할에게 읽기/쓰기를 모두 허용합니다.
-- 나중에 로그인 기반으로 바꾸고 싶다면 이 정책들을 auth.uid() 체크로 교체하세요.
create policy "public can read entries"
  on entries for select
  using (true);

create policy "public can insert entries"
  on entries for insert
  with check (true);

create policy "public can update entries"
  on entries for update
  using (true);

create policy "public can delete entries"
  on entries for delete
  using (true);

create index if not exists entries_created_at_idx on entries (created_at desc);

-- 가사 구절 하이라이트 + 해석. start_offset/end_offset은 entries.lyrics 문자열 기준
-- 0-based 문자 인덱스(끝 미포함)이고, quote는 그 구간의 텍스트를 그대로 복사해
-- 보관한다 (가사가 나중에 수정돼도 예전 해석이 어떤 구절이었는지 알 수 있도록).
create table if not exists annotations (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references entries(id) on delete cascade,
  start_offset int not null,
  end_offset int not null,
  quote text not null,
  note text not null,
  created_at timestamptz not null default now()
);

alter table annotations enable row level security;

create policy "public can read annotations"
  on annotations for select
  using (true);

create policy "public can insert annotations"
  on annotations for insert
  with check (true);

create policy "public can update annotations"
  on annotations for update
  using (true);

create policy "public can delete annotations"
  on annotations for delete
  using (true);

create index if not exists annotations_entry_id_idx on annotations (entry_id);
