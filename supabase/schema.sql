-- ============================================================
-- Supabase Schema — MD Muntasir Shihab Portfolio
-- এই SQL Supabase SQL Editor এ run করতে হবে
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ============================================================
-- 1. CONTACT MESSAGES (contact form submissions)
-- ============================================================
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text default '',
  message     text not null,
  ip          text default '',
  country     text default '',
  is_read     boolean default false,
  replied_at  timestamptz,
  created_at  timestamptz default now()
);

create index if not exists idx_messages_created_at on public.messages (created_at desc);
create index if not exists idx_messages_is_read on public.messages (is_read);

-- ============================================================
-- 2. CV DOWNLOADS (download tracking)
-- ============================================================
create table if not exists public.cv_downloads (
  id          uuid primary key default gen_random_uuid(),
  ip          text default '',
  country     text default '',
  device      text default '',
  created_at  timestamptz default now()
);

create index if not exists idx_cv_downloads_created_at on public.cv_downloads (created_at desc);

-- ============================================================
-- 3. VISITORS (visitor tracking)
-- ============================================================
create table if not exists public.visitors (
  id           uuid primary key default gen_random_uuid(),
  session_id   text unique,
  country      text default '',
  city         text default '',
  device       text default '',
  browser      text default '',
  os           text default '',
  ip           text default '',
  referrer     text default '',
  duration     integer default 0,
  created_at   timestamptz default now()
);

create index if not exists idx_visitors_created_at on public.visitors (created_at desc);

-- ============================================================
-- 4. PORTFOLIO CONTENT (editable content blocks)
-- ============================================================
create table if not exists public.portfolio_content (
  id          uuid primary key default gen_random_uuid(),
  key         text unique not null,
  value       jsonb,
  updated_at  timestamptz default now()
);

-- ============================================================
-- 5. ANALYTICS EVENTS (custom events tracking)
-- ============================================================
create table if not exists public.analytics_events (
  id          uuid primary key default gen_random_uuid(),
  event_type  text not null,
  event_data  jsonb,
  ip          text default '',
  created_at  timestamptz default now()
);

create index if not exists idx_analytics_events_type on public.analytics_events (event_type);
create index if not exists idx_analytics_events_created on public.analytics_events (created_at desc);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
alter table public.messages enable row level security;
alter table public.cv_downloads enable row level security;
alter table public.visitors enable row level security;
alter table public.portfolio_content enable row level security;
alter table public.analytics_events enable row level security;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- MESSAGES: যে কেউ insert করতে পারবে (contact form),
-- শুধু admin read/update/delete করতে পারবে (service role bypasses)
create policy "Anyone can submit messages"
  on public.messages for insert
  to anon, authenticated
  with check (true);

create policy "Service role can read messages"
  on public.messages for select
  to service_role
  using (true);

create policy "Service role can update messages"
  on public.messages for update
  to service_role
  using (true);

create policy "Service role can delete messages"
  on public.messages for delete
  to service_role
  using (true);

-- CV DOWNLOADS: insert public, read service role
create policy "Anyone can log cv downloads"
  on public.cv_downloads for insert
  to anon, authenticated
  with check (true);

create policy "Service role can read cv downloads"
  on public.cv_downloads for select
  to service_role
  using (true);

-- VISITORS: insert public, read service role
create policy "Anyone can log visitors"
  on public.visitors for insert
  to anon, authenticated
  with check (true);

create policy "Service role can read visitors"
  on public.visitors for select
  to service_role
  using (true);

-- PORTFOLIO CONTENT: read public (anon), write service role
create policy "Anyone can read portfolio content"
  on public.portfolio_content for select
  to anon, authenticated
  using (true);

create policy "Service role can write portfolio content"
  on public.portfolio_content for all
  to service_role
  using (true);

-- ANALYTICS EVENTS: insert public, read service role
create policy "Anyone can log analytics events"
  on public.analytics_events for insert
  to anon, authenticated
  with check (true);

create policy "Service role can read analytics events"
  on public.analytics_events for select
  to service_role
  using (true);

-- ============================================================
-- STORAGE BUCKETS (auto-create via Supabase Dashboard if needed)
-- ============================================================
-- এই buckets Supabase Dashboard → Storage থেকে manually create করতে হবে:
-- 1. "images"  — public bucket (project images, profile photo, testimonials)
-- 2. "pdfs"    — public bucket (CV PDFs)
-- 3. "media"   — public bucket (general media library)

-- ============================================================
-- HELPER: upsert portfolio content
-- ============================================================
create or replace function public.upsert_portfolio_content(p_key text, p_value jsonb)
returns void as $$
begin
  insert into public.portfolio_content (key, value, updated_at)
  values (p_key, p_value, now())
  on conflict (key)
  do update set value = excluded.value, updated_at = now();
end;
$$ language plpgsql security definer;

-- ============================================================
-- HELPER: mark message as read (security definer — callable by anon)
-- ============================================================
create or replace function public.mark_message_read(p_id uuid)
returns void as $$
begin
  update public.messages set is_read = true where id = p_id;
end;
$$ language plpgsql security definer;

-- ============================================================
-- HELPER: delete a message (security definer — callable by anon)
-- ============================================================
create or replace function public.delete_message(p_id uuid)
returns void as $$
begin
  delete from public.messages where id = p_id;
end;
$$ language plpgsql security definer;

-- ============================================================
-- HELPER: reset all portfolio content (security definer)
-- ============================================================
create or replace function public.reset_portfolio_content()
returns void as $$
begin
  delete from public.portfolio_content where key != '';
end;
$$ language plpgsql security definer;

-- ============================================================
-- HELPER: read all messages (security definer — callable by anon)
-- ============================================================
create or replace function public.read_all_messages()
returns setof public.messages as $$
begin
  return query select * from public.messages order by created_at desc;
end;
$$ language plpgsql security definer;

-- ============================================================
-- DONE — Schema ready
-- ============================================================
