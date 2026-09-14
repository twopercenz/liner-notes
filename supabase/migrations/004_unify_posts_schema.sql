-- ⚠️ 파괴적 마이그레이션: 이전 버전(entries/annotations/tracks/track_annotations)의
-- 모든 데이터를 지우고, 통합된 works/tracks/posts 구조로 다시 만든다.
-- "곡" 타입과 "앨범 트랙"이 서로 다른 경로였던 걸 하나로 합쳐서 가사 해석을
-- posts라는 하나의 콘텐츠 단위로 통일하고, 좋아요/댓글/태그/전문검색을 추가한다.
--
-- 기존 데이터를 보존하고 싶다면 이 파일을 실행하기 전에 Supabase 대시보드에서
-- 데이터를 내보내두세요 (SQL Editor에서 각 테이블 select 결과를 CSV로 export).
--
-- SQL Editor에 이 파일 내용을 붙여넣고 실행하세요.

drop table if exists track_annotations cascade;
drop table if exists annotations cascade;
drop table if exists tracks cascade;
drop table if exists entries cascade;

-- 아래는 schema.sql과 동일한 내용 (새 구조 생성).

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

create table if not exists likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  device_id text not null,
  created_at timestamptz not null default now(),
  unique (post_id, device_id)
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  author_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);

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

create index if not exists tracks_work_id_idx on tracks (work_id);
create index if not exists tracks_lyrics_search_idx on tracks using gin (lyrics_search);
create index if not exists posts_track_id_idx on posts (track_id);
create index if not exists posts_created_at_idx on posts (created_at desc);
create index if not exists posts_search_idx on posts using gin (search_vector);
create index if not exists likes_post_id_idx on likes (post_id);
create index if not exists comments_post_id_idx on comments (post_id);
create index if not exists post_tags_tag_id_idx on post_tags (tag_id);

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
