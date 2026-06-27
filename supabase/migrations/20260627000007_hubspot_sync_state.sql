-- HubSpot CRM lead sync state. Powers funnel stages 3-7 (Lead → Client).
-- Apollo enriches contacts in-place via HubSpot custom properties.

create table if not exists hubspot_contacts (
  id                  bigserial primary key,
  hubspot_id          text unique not null,
  email               text,
  first_name          text,
  last_name           text,
  company             text,
  job_title           text,
  lifecycle_stage     text,                       -- subscriber|lead|mql|sql|opportunity|customer
  lead_status         text,
  source              text,
  apollo_enriched     boolean default false,
  apollo_data         jsonb default '{}'::jsonb,
  properties          jsonb default '{}'::jsonb,
  first_seen_at       timestamptz,
  last_activity_at    timestamptz,
  synced_at           timestamptz default now()
);

create index if not exists idx_hs_email      on hubspot_contacts (email);
create index if not exists idx_hs_lifecycle  on hubspot_contacts (lifecycle_stage);
create index if not exists idx_hs_synced     on hubspot_contacts (synced_at desc);

create table if not exists hubspot_sync_state (
  id                  integer primary key default 1,
  last_full_sync_at   timestamptz,
  last_delta_sync_at  timestamptz,
  cursor              text,
  status              text default 'idle',        -- idle|running|error
  last_error          text,
  contacts_count      integer default 0,
  check (id = 1)                                  -- singleton row
);

insert into hubspot_sync_state (id) values (1) on conflict (id) do nothing;

-- Email events from Resend webhook → funnel MQL signal.
create table if not exists email_events (
  id              bigserial primary key,
  ts              timestamptz default now(),
  email           text not null,
  event           text not null,                  -- delivered|opened|clicked|bounced|complained
  campaign_id     uuid references marketing_campaigns(id) on delete set null,
  resend_id       text,
  metadata        jsonb default '{}'::jsonb
);

create index if not exists idx_email_events_email    on email_events (email);
create index if not exists idx_email_events_ts       on email_events (ts desc);
create index if not exists idx_email_events_campaign on email_events (campaign_id);

alter table hubspot_contacts enable row level security;
alter table hubspot_sync_state enable row level security;
alter table email_events enable row level security;

drop policy if exists "hs_contacts_cmo_all" on hubspot_contacts;
create policy "hs_contacts_cmo_all" on hubspot_contacts
  for all using (auth.jwt() ->> 'email' = 'ranl.woohoo@gmail.com')
  with check (auth.jwt() ->> 'email' = 'ranl.woohoo@gmail.com');

drop policy if exists "hs_sync_cmo_all" on hubspot_sync_state;
create policy "hs_sync_cmo_all" on hubspot_sync_state
  for all using (auth.jwt() ->> 'email' = 'ranl.woohoo@gmail.com')
  with check (auth.jwt() ->> 'email' = 'ranl.woohoo@gmail.com');

drop policy if exists "email_events_cmo_read" on email_events;
create policy "email_events_cmo_read" on email_events
  for select using (auth.jwt() ->> 'email' = 'ranl.woohoo@gmail.com');

comment on table hubspot_contacts is 'Mirror of HubSpot CRM contacts + Apollo enrichment.';
comment on table hubspot_sync_state is 'Singleton row tracking HubSpot sync cursor/status.';
comment on table email_events is 'Resend webhook events. Funnel MQL signal.';
