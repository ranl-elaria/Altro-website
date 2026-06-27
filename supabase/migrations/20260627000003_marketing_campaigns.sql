-- Campaign artifacts from the 10-step wizard.
-- State machine: INTAKE → INSPIRE → BRAND_PULL → CONCEPTS → COPY → VISUALS →
--                POLISH → TIMING → STAGE → PUBLISH_READY → [PUBLISHED|DRAFTED] → ARCHIVE → MEASURE

create table if not exists marketing_campaigns (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,        -- '2026-06-27_ai-automation-q3'
  name              text not null,
  goal              text,                        -- awareness|lead-gen|launch|nurture
  audience          jsonb default '{}'::jsonb,
  budget_usd        numeric(10,2),
  deadline          date,
  channels          text[] default array[]::text[], -- ['meta','linkedin','email','x']
  state             text not null default 'INTAKE',
  state_history     jsonb default '[]'::jsonb,   -- [{state, at, by, note}]
  -- Step outputs
  inspiration       jsonb default '{}'::jsonb,   -- competitor cards + trends
  brand_context     jsonb default '{}'::jsonb,   -- pulled from Canva + Drive
  concepts          jsonb default '[]'::jsonb,   -- 3 concepts, one marked chosen
  copy_variants     jsonb default '{}'::jsonb,   -- {channel: [variants]}
  visuals           jsonb default '[]'::jsonb,   -- 4 Canva designs, one+ chosen
  polish_notes      jsonb default '[]'::jsonb,
  timing            jsonb default '{}'::jsonb,   -- {channel: [{slot, reason}]}
  publish_status    jsonb default '{}'::jsonb,   -- {channel: draft|scheduled|published}
  archive_paths     jsonb default '{}'::jsonb,   -- {drive_folder, canva_folder}
  metrics           jsonb default '{}'::jsonb,   -- post-launch: impressions, ctr, leads
  created_by        text not null,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create index if not exists idx_campaigns_state    on marketing_campaigns (state);
create index if not exists idx_campaigns_created  on marketing_campaigns (created_at desc);
create index if not exists idx_campaigns_deadline on marketing_campaigns (deadline);

alter table marketing_campaigns enable row level security;

drop policy if exists "campaigns_cmo_all" on marketing_campaigns;
create policy "campaigns_cmo_all" on marketing_campaigns
  for all using (auth.jwt() ->> 'email' = 'ranl.woohoo@gmail.com')
  with check (auth.jwt() ->> 'email' = 'ranl.woohoo@gmail.com');

create or replace function touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists trg_campaigns_updated on marketing_campaigns;
create trigger trg_campaigns_updated before update on marketing_campaigns
  for each row execute function touch_updated_at();

-- Backfill FK from marketing_runs (created in 02)
alter table marketing_runs
  drop constraint if exists fk_runs_campaign,
  add constraint fk_runs_campaign foreign key (campaign_id)
    references marketing_campaigns(id) on delete set null;

comment on table marketing_campaigns is 'Campaign state machine + step artifacts. One row per campaign.';
