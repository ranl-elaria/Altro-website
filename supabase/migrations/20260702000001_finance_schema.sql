-- Finance suite v1: config, fx rates, invoices, expenses.

create table if not exists finance_config (
  id                smallint primary key default 1,
  start_balance_usd numeric(12,2) default 0,
  base_currency     text not null default 'USD',
  vat_pct           numeric(4,2) default 18,
  invoice_prefix    text default 'INV',
  updated_at        timestamptz default now()
);
insert into finance_config (id) values (1) on conflict (id) do nothing;

create table if not exists fx_rates (
  date    date primary key,
  usd_ils numeric(10,6),
  ils_usd numeric(10,6),
  source  text default 'exchangerate.host',
  fetched_at timestamptz default now()
);

create table if not exists expense_categories (
  id     serial primary key,
  slug   text unique not null,
  label  text not null,
  color  text default '#3C6E71'
);
insert into expense_categories (slug, label, color) values
  ('ai_tooling',        'AI / Tooling',        '#3C6E71'),
  ('marketing',         'Marketing',           '#a78bfa'),
  ('legal_accounting',  'Legal / Accounting',  '#fbbf24'),
  ('software_subs',     'Software subs',       '#60a5fa')
on conflict (slug) do nothing;

create table if not exists invoices (
  id            uuid primary key default gen_random_uuid(),
  number        text unique not null,
  deal_id       uuid references sales_deals(id) on delete set null,
  client_email  text,
  client_name   text,
  client_company text,
  issue_date    date not null default current_date,
  due_date      date,
  currency      text not null default 'USD',
  fx_rate       numeric(10,6),
  subtotal      numeric(12,2) not null default 0,
  vat           numeric(12,2) not null default 0,
  total         numeric(12,2) not null default 0,
  total_usd     numeric(12,2) not null default 0,
  status        text not null default 'draft', -- draft|sent|paid|overdue|cancelled
  paid_at       timestamptz,
  sent_at       timestamptz,
  notes         text,
  pdf_url       text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
create index if not exists idx_invoices_status on invoices (status);
create index if not exists idx_invoices_due    on invoices (due_date);
create index if not exists idx_invoices_deal   on invoices (deal_id);

create table if not exists invoice_items (
  id          uuid primary key default gen_random_uuid(),
  invoice_id  uuid not null references invoices(id) on delete cascade,
  description text not null,
  qty         numeric(10,2) default 1,
  unit_price  numeric(12,2) default 0,
  amount      numeric(12,2) default 0,
  position    int default 0
);
create index if not exists idx_invoice_items_invoice on invoice_items (invoice_id, position);

create table if not exists expenses (
  id            uuid primary key default gen_random_uuid(),
  vendor        text,
  description   text,
  category_id   int references expense_categories(id),
  amount        numeric(12,2) not null,
  currency      text not null default 'USD',
  amount_usd    numeric(12,2) not null,
  fx_rate       numeric(10,6),
  date          date not null default current_date,
  receipt_url   text,
  source        text default 'manual', -- manual|csv|ai_parser
  metadata      jsonb default '{}'::jsonb,
  created_at    timestamptz default now()
);
create index if not exists idx_expenses_date     on expenses (date desc);
create index if not exists idx_expenses_category on expenses (category_id);

create or replace function touch_finance_updated() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists trg_invoices_updated on invoices;
create trigger trg_invoices_updated before update on invoices
  for each row execute function touch_finance_updated();

drop trigger if exists trg_finance_config_updated on finance_config;
create trigger trg_finance_config_updated before update on finance_config
  for each row execute function touch_finance_updated();

-- RLS
alter table finance_config     enable row level security;
alter table fx_rates           enable row level security;
alter table expense_categories enable row level security;
alter table invoices           enable row level security;
alter table invoice_items      enable row level security;
alter table expenses           enable row level security;

drop policy if exists "finance_config_cmo_all"     on finance_config;
drop policy if exists "fx_rates_cmo_all"           on fx_rates;
drop policy if exists "expense_categories_cmo_all" on expense_categories;
drop policy if exists "invoices_cmo_all"           on invoices;
drop policy if exists "invoice_items_cmo_all"      on invoice_items;
drop policy if exists "expenses_cmo_all"           on expenses;

create policy "finance_config_cmo_all"     on finance_config     for all using (auth.jwt() ->> 'email' = 'ranl.woohoo@gmail.com') with check (auth.jwt() ->> 'email' = 'ranl.woohoo@gmail.com');
create policy "fx_rates_cmo_all"           on fx_rates           for all using (auth.jwt() ->> 'email' = 'ranl.woohoo@gmail.com') with check (auth.jwt() ->> 'email' = 'ranl.woohoo@gmail.com');
create policy "expense_categories_cmo_all" on expense_categories for all using (auth.jwt() ->> 'email' = 'ranl.woohoo@gmail.com') with check (auth.jwt() ->> 'email' = 'ranl.woohoo@gmail.com');
create policy "invoices_cmo_all"           on invoices           for all using (auth.jwt() ->> 'email' = 'ranl.woohoo@gmail.com') with check (auth.jwt() ->> 'email' = 'ranl.woohoo@gmail.com');
create policy "invoice_items_cmo_all"      on invoice_items      for all using (auth.jwt() ->> 'email' = 'ranl.woohoo@gmail.com') with check (auth.jwt() ->> 'email' = 'ranl.woohoo@gmail.com');
create policy "expenses_cmo_all"           on expenses           for all using (auth.jwt() ->> 'email' = 'ranl.woohoo@gmail.com') with check (auth.jwt() ->> 'email' = 'ranl.woohoo@gmail.com');
