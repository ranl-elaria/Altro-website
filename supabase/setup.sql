-- ─────────────────────────────────────────────────────────────
-- Altro Website — Supabase setup
-- Run this once in the Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────

-- 1. Create the submissions table
create table if not exists submissions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  company     text,
  email       text not null,
  message     text not null,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

-- 2. Enable Row Level Security
alter table submissions enable row level security;

-- 3. Allow authenticated users (admin) to read all submissions
create policy "Authenticated users can read submissions"
  on submissions for select
  to authenticated
  using (true);

-- 4. Allow authenticated users to update (mark read/unread)
create policy "Authenticated users can update submissions"
  on submissions for update
  to authenticated
  using (true);

-- 5. Block public read — inserts come through the API
--    using the service role key which bypasses RLS entirely.
--    No public select or insert policy needed.

-- ─────────────────────────────────────────────────────────────
-- XPlace Projects
-- ─────────────────────────────────────────────────────────────

-- 6. Create the xplace_projects table
create table if not exists xplace_projects (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  url         text not null,
  synced_at   timestamptz not null default now()
);

-- 7. Unique index on URL to prevent duplicates on re-sync
create unique index if not exists xplace_projects_url_idx on xplace_projects(url);

-- 8. Enable Row Level Security
alter table xplace_projects enable row level security;

-- 9. Allow authenticated users (admin) to read all projects
create policy "Authenticated users can read xplace_projects"
  on xplace_projects for select
  to authenticated
  using (true);
