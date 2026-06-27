-- Pointers to brand assets living in Canva + Google Drive.
-- Source of truth = Canva/Drive themselves. This table = searchable index + metadata cache.
-- Refreshed on: integration sync, campaign archive, manual reindex.

create extension if not exists pg_trgm;

create table if not exists marketing_assets (
  id              uuid primary key default gen_random_uuid(),
  source          text not null,                 -- 'canva' | 'drive'
  external_id     text not null,                 -- canva design_id or drive file_id
  kind            text not null,                 -- 'logo'|'template'|'ad'|'social'|'deck'|'guideline'|'video'|'image'|'doc'
  folder_path     text,                          -- 'AltroAI/Marketing/04_Ads' or '07_Campaigns/2026-06-27_xyz'
  name            text not null,
  thumbnail_url   text,
  edit_url        text,                          -- deep-link to Canva editor or Drive view
  download_url    text,
  brand_tags      text[] default array[]::text[],
  campaign_id     uuid references marketing_campaigns(id) on delete set null,
  size_bytes      bigint,
  mime_type       text,
  metadata        jsonb default '{}'::jsonb,
  indexed_at      timestamptz default now(),
  unique (source, external_id)
);

create index if not exists idx_assets_source     on marketing_assets (source);
create index if not exists idx_assets_kind       on marketing_assets (kind);
create index if not exists idx_assets_folder     on marketing_assets (folder_path);
create index if not exists idx_assets_campaign   on marketing_assets (campaign_id);
create index if not exists idx_assets_name_trgm  on marketing_assets using gin (name gin_trgm_ops);

alter table marketing_assets enable row level security;

drop policy if exists "assets_cmo_all" on marketing_assets;
create policy "assets_cmo_all" on marketing_assets
  for all using (auth.jwt() ->> 'email' = 'ranl.woohoo@gmail.com')
  with check (auth.jwt() ->> 'email' = 'ranl.woohoo@gmail.com');

comment on table marketing_assets is 'Index of brand assets in Canva + Drive. Source of truth is the external platform.';
