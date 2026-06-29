-- Run this entire file in the Supabase SQL Editor:
-- Dashboard → SQL Editor → New query → paste → Run

-- 1. Profiles table (linked to Supabase auth users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null default '',
  age integer,
  sex text check (sex in ('male', 'female')),
  weight_kg numeric(5,2),
  height_cm numeric(5,1),
  created_at timestamptz default now()
);

-- 2. Row Level Security — users can only access their own row
alter table public.profiles enable row level security;

create policy "own profile select"
  on public.profiles for select
  using (auth.uid() = id);

create policy "own profile insert"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "own profile update"
  on public.profiles for update
  using (auth.uid() = id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Food logs table

create table if not exists public.food_logs (
  id        uuid        default gen_random_uuid() primary key,
  user_id   uuid        references auth.users(id) on delete cascade not null,
  name      text        not null,
  meta      text,
  tag       text,
  tone      text,
  glyph     text,
  meal      text,
  logged_at timestamptz default now()
);

alter table public.food_logs enable row level security;

create policy "own food logs"
  on public.food_logs for all
  using (auth.uid() = user_id);

-- Done. Also disable email confirmation in:
-- Authentication → Settings → Email Auth → toggle off "Confirm email"
