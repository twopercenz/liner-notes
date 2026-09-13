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
  interpretation text,
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
