-- Auto-discovered competitors + weekly snapshots of their marketing materials.
-- Refreshed by: api/marketing/cron/competitors-weekly.js (Sundays 06:00 UTC)
-- Sources: Meta Ad Library (ads-spy), LinkedIn posts, website snapshots.

create table if not exists marketing_competitors (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  domain          text unique not null,
  source          text default 'auto',          -- auto|manual
  discovered_at   timestamptz default now(),
  active          boolean default true,
  notes           text,
  metadata        jsonb default '{}'::jsonb     -- {industry, size, region}
);

create index if not exists idx_competitors_active on marketing_competitors (active);

create table if not exists marketing_competitor_snapshots (
  id              uuid primary key default gen_random_uuid(),
  competitor_id   uuid not null references marketing_competitors(id) on delete cascade,
  snapshot_type   text not null,                -- 'meta_ads' | 'linkedin_posts' | 'website'
  captured_at     timestamptz default now(),
  data            jsonb not null,               -- raw scrape payload
  summary         text,                         -- LLM 1-paragraph digest
  asset_urls      text[] default array[]::text[]
);

create index if not exists idx_snapshots_competitor on marketing_competitor_snapshots (competitor_id);
create index if not exists idx_snapshots_captured   on marketing_competitor_snapshots (captured_at desc);
create index if not exists idx_snapshots_type       on marketing_competitor_snapshots (snapshot_type);

alter table marketing_competitors enable row level security;
alter table marketing_competitor_snapshots enable row level security;

drop policy if exists "competitors_cmo_all" on marketing_competitors;
create policy "competitors_cmo_all" on marketing_competitors
  for all using (auth.jwt() ->> 'email' = 'ranl.woohoo@gmail.com')
  with check (auth.jwt() ->> 'email' = 'ranl.woohoo@gmail.com');

drop policy if exists "snapshots_cmo_all" on marketing_competitor_snapshots;
create policy "snapshots_cmo_all" on marketing_competitor_snapshots
  for all using (auth.jwt() ->> 'email' = 'ranl.woohoo@gmail.com')
  with check (auth.jwt() ->> 'email' = 'ranl.woohoo@gmail.com');

comment on table marketing_competitors is 'Auto-discovered + manual competitor list.';
comment on table marketing_competitor_snapshots is 'Weekly captures of competitor marketing material.';
