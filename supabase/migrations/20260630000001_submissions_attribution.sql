-- Add attribution capture to submissions for campaign tracking.
alter table submissions
  add column if not exists attribution jsonb default '{}'::jsonb;

create index if not exists idx_submissions_utm_campaign
  on submissions ((attribution->>'utm_campaign'))
  where attribution->>'utm_campaign' is not null;
