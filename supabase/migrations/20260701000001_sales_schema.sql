-- Sales suite v1: leads + deals + activities.
-- HubSpot Deals API stores standard CRM fields. These tables store extension
-- data: UTM, AI score, proposal markdown, activity log.

create table if not exists sales_leads (
  id              uuid primary key default gen_random_uuid(),
  email           text,
  name            text,
  company         text,
  message         text,
  source          text not null,                  -- 'website' | 'xplace' | 'referral' | 'linkedin' | ...
  source_ref      text,                           -- submission_id / xplace_project_id / external id
  utm_source      text,
  utm_medium      text,
  utm_campaign    text,
  utm_content     text,
  utm_term        text,
  referrer        text,
  landing_path    text,
  ai_score        int,
  ai_score_reason text,
  status          text not null default 'new',    -- 'new' | 'converted' | 'discarded'
  notes           text,
  created_at      timestamptz not null default now(),
  qualified_at    timestamptz
);

create index if not exists idx_sales_leads_status     on sales_leads (status);
create index if not exists idx_sales_leads_source     on sales_leads (source);
create index if not exists idx_sales_leads_utm        on sales_leads (utm_campaign) where utm_campaign is not null;
create index if not exists idx_sales_leads_created    on sales_leads (created_at desc);

create table if not exists sales_deals (
  id                  uuid primary key default gen_random_uuid(),
  lead_id             uuid references sales_leads(id) on delete set null,
  hub_deal_id         text,
  name                text not null,
  company             text,
  contact_email       text,
  stage               text not null default 'qualified', -- qualified|discovery|proposal_sent|negotiation|won|lost
  lost_reason         text,
  value_usd           numeric(12,2),
  expected_close_date date,
  closed_at           timestamptz,
  proposal_md         text,
  proposal_sent_at    timestamptz,
  source              text,
  utm_campaign        text,
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_sales_deals_stage   on sales_deals (stage);
create index if not exists idx_sales_deals_created on sales_deals (created_at desc);
create index if not exists idx_sales_deals_hub     on sales_deals (hub_deal_id) where hub_deal_id is not null;

create or replace function touch_sales_deals_updated() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists trg_sales_deals_updated on sales_deals;
create trigger trg_sales_deals_updated before update on sales_deals
  for each row execute function touch_sales_deals_updated();

create table if not exists sales_activities (
  id       uuid primary key default gen_random_uuid(),
  deal_id  uuid references sales_deals(id) on delete cascade,
  lead_id  uuid references sales_leads(id) on delete cascade,
  kind     text not null,                         -- stage_change|email_sent|call|note|proposal_sent|lead_qualified|deal_won|deal_lost
  actor    text default 'system',
  body     jsonb default '{}'::jsonb,
  ts       timestamptz not null default now()
);

create index if not exists idx_sales_activities_deal on sales_activities (deal_id, ts desc);
create index if not exists idx_sales_activities_lead on sales_activities (lead_id, ts desc);
create index if not exists idx_sales_activities_kind on sales_activities (kind, ts desc);

-- RLS — CMO only.
alter table sales_leads      enable row level security;
alter table sales_deals      enable row level security;
alter table sales_activities enable row level security;

drop policy if exists "sales_leads_cmo_all"      on sales_leads;
drop policy if exists "sales_deals_cmo_all"      on sales_deals;
drop policy if exists "sales_activities_cmo_all" on sales_activities;

create policy "sales_leads_cmo_all" on sales_leads
  for all using (auth.jwt() ->> 'email' = 'ranl.woohoo@gmail.com')
  with check  (auth.jwt() ->> 'email' = 'ranl.woohoo@gmail.com');

create policy "sales_deals_cmo_all" on sales_deals
  for all using (auth.jwt() ->> 'email' = 'ranl.woohoo@gmail.com')
  with check  (auth.jwt() ->> 'email' = 'ranl.woohoo@gmail.com');

create policy "sales_activities_cmo_all" on sales_activities
  for all using (auth.jwt() ->> 'email' = 'ranl.woohoo@gmail.com')
  with check  (auth.jwt() ->> 'email' = 'ranl.woohoo@gmail.com');
