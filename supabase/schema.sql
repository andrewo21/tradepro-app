-- TradePro Database Schema
-- Run this in the Supabase SQL Editor (New Query → paste → Run).
-- Expected result: "Success. No rows returned"

-- ─── RESUMES ──────────────────────────────────────────────────────────────────
create table if not exists public.resumes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null default 'My Resume',
  data        jsonb not null default '{}',
  locale      text not null default 'en',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Auto-update updated_at on every save
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists resumes_updated_at on public.resumes;
create trigger resumes_updated_at
  before update on public.resumes
  for each row execute procedure public.set_updated_at();

-- Row-level security: users can only access their own resumes
alter table public.resumes enable row level security;

create policy "Users can view own resumes"
  on public.resumes for select using (auth.uid() = user_id);

create policy "Users can insert own resumes"
  on public.resumes for insert with check (auth.uid() = user_id);

create policy "Users can update own resumes"
  on public.resumes for update using (auth.uid() = user_id);

create policy "Users can delete own resumes"
  on public.resumes for delete using (auth.uid() = user_id);

-- Index for fast lookups by user
create index if not exists resumes_user_id_idx on public.resumes(user_id);
