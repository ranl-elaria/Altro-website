-- No backfill: legacy submissions are not automatically forwarded.
alter table public.submissions
  add column if not exists phone text,
  add column if not exists crm_status text check (crm_status in ('pending','delivered','failed')),
  add column if not exists crm_attempts integer not null default 0 check (crm_attempts >= 0),
  add column if not exists crm_last_error text,
  add column if not exists crm_next_attempt_at timestamptz;
create index if not exists idx_submissions_crm_pending
  on public.submissions (crm_next_attempt_at) where crm_status = 'pending';
