-- 앨범/EP/싱글의 곡별 가사+해석 기능을 추가하는 마이그레이션.
-- schema.sql이나 002_lyrics_and_annotations.sql을 이미 실행한 적 있는 프로젝트라면
-- SQL Editor에 이 파일 내용을 붙여넣고 실행하세요. 새 프로젝트는 schema.sql 하나면 충분합니다.

create table if not exists tracks (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references entries(id) on delete cascade,
  title text not null,
  track_number int,
  lyrics text,
  created_at timestamptz not null default now()
);

alter table tracks enable row level security;

create policy "public can read tracks"
  on tracks for select
  using (true);

create policy "public can insert tracks"
  on tracks for insert
  with check (true);

create policy "public can update tracks"
  on tracks for update
  using (true);

create policy "public can delete tracks"
  on tracks for delete
  using (true);

create index if not exists tracks_entry_id_idx on tracks (entry_id);

create table if not exists track_annotations (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references tracks(id) on delete cascade,
  start_offset int not null,
  end_offset int not null,
  quote text not null,
  note text not null,
  created_at timestamptz not null default now()
);

alter table track_annotations enable row level security;

create policy "public can read track_annotations"
  on track_annotations for select
  using (true);

create policy "public can insert track_annotations"
  on track_annotations for insert
  with check (true);

create policy "public can update track_annotations"
  on track_annotations for update
  using (true);

create policy "public can delete track_annotations"
  on track_annotations for delete
  using (true);

create index if not exists track_annotations_track_id_idx on track_annotations (track_id);
