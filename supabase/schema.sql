-- Liner Notes 데이터베이스 스키마 (v2 — 통합 posts 모델)
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 실행하세요.
-- 이미 v1(entries/annotations/tracks/track_annotations)을 실행한 적 있다면
-- 이 파일 대신 supabase/migrations/004_unify_posts_schema.sql 을 실행하세요
-- (기존 데이터를 지우고 새 구조로 다시 만듭니다).

-- 앨범/EP/싱글/곡 — 리뷰 대상이 되는 발매 단위.
create table if not exists works (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('album', 'ep', 'single', 'song')),
  artist text not null,
  title text not null,
  year text,
  cover_url text,
  apple_music_id text,
  rating int not null default 0 check (rating between 0 and 5),
  review text,
  created_at timestamptz not null default now()
);

-- 작품 안의 곡. "곡" 타입 work는 트랙이 정확히 1개다 (앱이 그렇게 만든다).
create table if not exists tracks (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references works(id) on delete cascade,
  title text not null,
  track_number int,
  lyrics text,
  lyrics_search tsvector generated always as (
    to_tsvector('simple', coalesce(lyrics, ''))
  ) stored,
  created_at timestamptz not null default now()
);

-- 가사 구절 + 해석. 이 사이트의 핵심 콘텐츠(피드에 흐르는 것).
-- start_offset/end_offset은 tracks.lyrics 문자열 기준 0-based 문자 인덱스(끝 미포함).
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references tracks(id) on delete cascade,
  start_offset int not null,
  end_offset int not null,
  quote text not null,
  note text not null,
  search_vector tsvector generated always as (
    to_tsvector('simple', coalesce(quote, '') || ' ' || coalesce(note, ''))
  ) stored,
  created_at timestamptz not null default now()
);

-- 좋아요. 로그인이 없어서 브라우저 localStorage에 저장한 익명 device_id로 중복을 막는다.
create table if not exists likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  device_id text not null,
  created_at timestamptz not null default now(),
  unique (post_id, device_id)
);

-- 댓글. 로그인이 없어서 매번 입력하는 닉네임을 그대로 저장한다.
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  author_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);

-- 무드/태그 (우울함, 청춘, 이별 등).
create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

create table if not exists post_tags (
  post_id uuid not null references posts(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

-- 인덱스
create index if not exists tracks_work_id_idx on tracks (work_id);
create index if not exists tracks_lyrics_search_idx on tracks using gin (lyrics_search);
create index if not exists posts_track_id_idx on posts (track_id);
create index if not exists posts_created_at_idx on posts (created_at desc);
create index if not exists posts_search_idx on posts using gin (search_vector);
create index if not exists likes_post_id_idx on likes (post_id);
create index if not exists comments_post_id_idx on comments (post_id);
create index if not exists post_tags_tag_id_idx on post_tags (tag_id);

-- Row Level Security — 이 프로젝트는 "누구나 공개적으로 쓸 수 있는" 방식을 선택했으므로
-- anon(비로그인) 역할에게 읽기/쓰기를 모두 허용한다.
-- 나중에 로그인 기반으로 바꾸고 싶다면 이 정책들을 auth.uid() 체크로 교체하면 된다.
alter table works enable row level security;
alter table tracks enable row level security;
alter table posts enable row level security;
alter table likes enable row level security;
alter table comments enable row level security;
alter table tags enable row level security;
alter table post_tags enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['works', 'tracks', 'posts', 'likes', 'comments', 'tags', 'post_tags']
  loop
    execute format('create policy "public can read %1$s" on %1$s for select using (true)', t);
    execute format('create policy "public can insert %1$s" on %1$s for insert with check (true)', t);
    execute format('create policy "public can update %1$s" on %1$s for update using (true)', t);
    execute format('create policy "public can delete %1$s" on %1$s for delete using (true)', t);
  end loop;
end $$;
