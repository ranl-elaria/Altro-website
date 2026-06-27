-- Audit log for every marketing agent/skill execution.
-- Written by: src/lib/marketing/runner.js → api/marketing/agents/run.js
-- Read by:    Agents.jsx (history), Logs.jsx (audit), Dashboard.jsx (cost rollup)

create table if not exists marketing_runs (
  id              uuid primary key default gen_random_uuid(),
  user_email      text not null,
  agent_slug      text not null,                 -- 'ads-copy' | 'sales-find' | etc.
  status          text not null default 'pending', -- pending|running|done|error|cancelled
  inputs          jsonb not null default '{}'::jsonb,
  outputs         jsonb default '{}'::jsonb,
  error           text,
  cost_usd        numeric(10,6) default 0,
  tokens_in       integer default 0,
  tokens_out      integer default 0,
  duration_ms     integer,
  started_at      timestamptz not null default now(),
  finished_at     timestamptz,
  slack_notified  boolean default false,
  campaign_id     uuid,                          -- nullable; links to marketing_campaigns
  parent_run_id   uuid references marketing_runs(id) on delete set null
);

create index if not exists idx_runs_started      on marketing_runs (started_at desc);
create index if not exists idx_runs_agent        on marketing_runs (agent_slug);
create index if not exists idx_runs_status       on marketing_runs (status);
create index if not exists idx_runs_campaign     on marketing_runs (campaign_id);

alter table marketing_runs enable row level security;

drop policy if exists "runs_cmo_all" on marketing_runs;
create policy "runs_cmo_all" on marketing_runs
  for all using (auth.jwt() ->> 'email' = 'ranl.woohoo@gmail.com')
  with check (auth.jwt() ->> 'email' = 'ranl.woohoo@gmail.com');

comment on table marketing_runs is 'Every agent/skill execution. Inputs, outputs, cost, duration.';
