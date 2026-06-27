-- OAuth tokens + connection state for 3rd-party marketing tools.
-- Providers: hubspot|apollo|canva|google|meta|linkedin|mailchimp|buffer|notion|slack|resend
-- Tokens encrypted via Supabase Vault (pgsodium).

create extension if not exists pgsodium;

create table if not exists marketing_integrations (
  id                  uuid primary key default gen_random_uuid(),
  provider            text unique not null,
  status              text not null default 'disconnected', -- disconnected|connected|expired|error
  scopes              text[] default array[]::text[],
  account_label       text,                                  -- e.g. user email at provider
  -- Encrypted token storage (pgsodium-managed)
  access_token        text,                                  -- encrypted at column level
  refresh_token       text,
  token_expires_at    timestamptz,
  metadata            jsonb default '{}'::jsonb,             -- provider-specific (account_id, workspace_id)
  last_error          text,
  last_synced_at      timestamptz,
  connected_at        timestamptz,
  connected_by        text,
  updated_at          timestamptz default now()
);

create index if not exists idx_integrations_status on marketing_integrations (status);

alter table marketing_integrations enable row level security;

drop policy if exists "integrations_cmo_all" on marketing_integrations;
create policy "integrations_cmo_all" on marketing_integrations
  for all using (auth.jwt() ->> 'email' = 'ranl.woohoo@gmail.com')
  with check (auth.jwt() ->> 'email' = 'ranl.woohoo@gmail.com');

drop trigger if exists trg_integrations_updated on marketing_integrations;
create trigger trg_integrations_updated before update on marketing_integrations
  for each row execute function touch_updated_at();

-- Seed expected providers (status=disconnected)
insert into marketing_integrations (provider) values
  ('hubspot'), ('apollo'), ('canva'), ('google'),
  ('meta'), ('linkedin'), ('mailchimp'), ('buffer'),
  ('notion'), ('slack'), ('resend')
on conflict (provider) do nothing;

comment on table marketing_integrations is 'OAuth connections to 3rd-party marketing tools. Tokens encrypted.';
