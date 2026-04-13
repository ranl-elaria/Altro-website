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
