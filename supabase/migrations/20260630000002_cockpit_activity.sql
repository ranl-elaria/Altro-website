-- Cross-suite activity log. Cockpit Home feed reads from here.
-- Any suite can log events: { suite, actor, action, target }.

create table if not exists cockpit_activity (
  id      uuid primary key default gen_random_uuid(),
  suite   text not null,        -- 'sales' | 'marketing' | 'finance' | 'product' | 'knowledge' | 'analytics' | 'settings'
  actor   text,                 -- user email or 'system' / 'cron' / 'agent:<slug>'
  action  text not null,        -- 'campaign_published' | 'lead_created' | 'proposal_sent' | etc
  target  text,                 -- ref id or slug for the affected object
  meta    jsonb default '{}'::jsonb,
  ts      timestamptz default now()
);

create index if not exists idx_cockpit_activity_ts on cockpit_activity (ts desc);
create index if not exists idx_cockpit_activity_suite on cockpit_activity (suite, ts desc);

alter table cockpit_activity enable row level security;

drop policy if exists "cockpit_activity_cmo_all" on cockpit_activity;
create policy "cockpit_activity_cmo_all" on cockpit_activity
  for all using (auth.jwt() ->> 'email' = 'ranl.woohoo@gmail.com')
  with check (auth.jwt() ->> 'email' = 'ranl.woohoo@gmail.com');
