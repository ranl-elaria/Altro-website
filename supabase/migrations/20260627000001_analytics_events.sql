-- Self-built website analytics. Replaces Plausible.
-- Source: public/track.js → /api/track → this table.
-- Funnel viz joins this with hubspot_sync_state for stages 1-2 (Awareness, Visitor).

-- Cleanup from prior failed push (CLI version-collision bug). Idempotent.
delete from supabase_migrations.schema_migrations where version = '20260627';

create table if not exists analytics_events (
  id            bigserial primary key,
  ts            timestamptz not null default now(),
  session_id    text not null,
  event         text not null,                  -- 'pageview' | 'lead_submit' | 'cta_click' | custom
  path          text,
  referrer      text,
  user_agent    text,
  country       text,
  props         jsonb default '{}'::jsonb,
  is_bot        boolean default false
);

create index if not exists idx_analytics_ts          on analytics_events (ts desc);
create index if not exists idx_analytics_session     on analytics_events (session_id);
create index if not exists idx_analytics_event       on analytics_events (event);
create index if not exists idx_analytics_path        on analytics_events (path);
create index if not exists idx_analytics_ts_event    on analytics_events (ts desc, event) where is_bot = false;

alter table analytics_events enable row level security;

-- Only the CMO email can read. Adjust to your auth scheme.
drop policy if exists "analytics_cmo_read" on analytics_events;
create policy "analytics_cmo_read" on analytics_events
  for select using (
    auth.jwt() ->> 'email' = 'ranl.woohoo@gmail.com'
  );

-- Ingest via service role only (api/track.js uses service key). No public insert policy.

comment on table analytics_events is 'Self-built pageview + custom-event tracker. Ingested by /api/track.';
