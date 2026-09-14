-- 가사 + 구절별 해석(annotations) 기능을 추가하는 마이그레이션.
-- 이미 schema.sql을 실행해서 배포한 적이 있는 Supabase 프로젝트라면
-- (처음부터 새로 만드는 게 아니라면) SQL Editor에 이 파일 내용을 붙여넣고 실행하세요.
-- 새 프로젝트라면 이 파일은 필요 없고 schema.sql 하나만 실행하면 됩니다.

alter table entries add column if not exists lyrics text;

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
