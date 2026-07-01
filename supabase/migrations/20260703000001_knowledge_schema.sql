-- Knowledge / Docs suite v1: markdown docs + fulltext + embeddings + backlinks + cross-suite attach.

create extension if not exists vector;

create table if not exists knowledge_docs (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  body_md           text default '',
  doc_type          text not null default 'note', -- sop|adr|brand|prompt|template|note|meeting|retro|learning|glossary|other
  suite             text,                          -- 'sales'|'marketing'|'finance'|'product'|'knowledge'|'general'
  status            text not null default 'draft', -- draft|published
  tags              text[] default '{}',
  parent_id         uuid references knowledge_docs(id) on delete set null,
  drive_file_id     text,
  drive_preview_url text,
  embedding         vector(1024),
  meta              jsonb default '{}'::jsonb,
  ai_summary        text,
  auto_tags         text[],
  created_by        text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Generated tsvector column for fulltext search
alter table knowledge_docs
  add column if not exists search_vector tsvector
  generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(array_to_string(tags, ' '), '')), 'B') ||
    setweight(to_tsvector('english', coalesce(body_md, '')), 'C')
  ) stored;

create index if not exists idx_knowledge_search on knowledge_docs using gin(search_vector);
create index if not exists idx_knowledge_embedding on knowledge_docs using hnsw (embedding vector_cosine_ops);
create index if not exists idx_knowledge_doc_type on knowledge_docs (doc_type);
create index if not exists idx_knowledge_suite    on knowledge_docs (suite);
create index if not exists idx_knowledge_status   on knowledge_docs (status);
create index if not exists idx_knowledge_parent   on knowledge_docs (parent_id) where parent_id is not null;
create index if not exists idx_knowledge_updated  on knowledge_docs (updated_at desc);

create or replace function touch_knowledge_updated() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists trg_knowledge_updated on knowledge_docs;
create trigger trg_knowledge_updated before update on knowledge_docs
  for each row execute function touch_knowledge_updated();

-- Wiki backlinks: from doc → mentions to doc
create table if not exists knowledge_backlinks (
  id           uuid primary key default gen_random_uuid(),
  from_doc_id  uuid not null references knowledge_docs(id) on delete cascade,
  to_doc_id    uuid not null references knowledge_docs(id) on delete cascade,
  created_at   timestamptz not null default now(),
  unique (from_doc_id, to_doc_id)
);
create index if not exists idx_backlinks_to on knowledge_backlinks (to_doc_id);
create index if not exists idx_backlinks_from on knowledge_backlinks (from_doc_id);

-- Cross-suite attach columns
alter table sales_deals          add column if not exists linked_docs jsonb default '[]'::jsonb;
alter table marketing_campaigns  add column if not exists linked_docs jsonb default '[]'::jsonb;
alter table invoices             add column if not exists linked_docs jsonb default '[]'::jsonb;

-- RLS
alter table knowledge_docs      enable row level security;
alter table knowledge_backlinks enable row level security;

drop policy if exists "knowledge_docs_cmo_all"      on knowledge_docs;
drop policy if exists "knowledge_backlinks_cmo_all" on knowledge_backlinks;

create policy "knowledge_docs_cmo_all" on knowledge_docs
  for all using (auth.jwt() ->> 'email' = 'ranl.woohoo@gmail.com')
  with check  (auth.jwt() ->> 'email' = 'ranl.woohoo@gmail.com');

create policy "knowledge_backlinks_cmo_all" on knowledge_backlinks
  for all using (auth.jwt() ->> 'email' = 'ranl.woohoo@gmail.com')
  with check  (auth.jwt() ->> 'email' = 'ranl.woohoo@gmail.com');

-- RPCs used by /api/knowledge/[action].js
create or replace function knowledge_search(q text)
returns setof knowledge_docs
language sql security definer as $$
  select * from knowledge_docs
  where search_vector @@ websearch_to_tsquery('english', q)
  order by ts_rank(search_vector, websearch_to_tsquery('english', q)) desc
  limit 50
$$;

create or replace function knowledge_similar(in_id uuid, k int)
returns table (id uuid, title text, doc_type text, distance float)
language sql security definer as $$
  with src as (select embedding from knowledge_docs where id = in_id)
  select d.id, d.title, d.doc_type, (d.embedding <=> (select embedding from src)) as distance
  from knowledge_docs d, src
  where d.id != in_id and d.embedding is not null and src.embedding is not null
  order by d.embedding <=> src.embedding
  limit k
$$;

create or replace function knowledge_ask_search(in_emb vector(1024), k int, in_suite text)
returns table (id uuid, title text, doc_type text, body_md text, distance float)
language sql security definer as $$
  select d.id, d.title, d.doc_type, d.body_md, (d.embedding <=> in_emb) as distance
  from knowledge_docs d
  where d.embedding is not null
    and (in_suite is null or d.suite = in_suite)
  order by d.embedding <=> in_emb
  limit k
$$;
