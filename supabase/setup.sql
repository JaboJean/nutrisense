-- Run this entire file in the Supabase SQL Editor:
-- Dashboard → SQL Editor → New query → paste → Run
-- Safe to re-run: uses IF NOT EXISTS and drops policies before recreating them.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Profiles table
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id         uuid references auth.users(id) on delete cascade primary key,
  name       text        not null default '',
  age        integer,
  sex        text        check (sex in ('male', 'female')),
  weight_kg  numeric(5,2),
  height_cm  numeric(5,1),
  role       text        not null default 'patient',
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "own profile select" on public.profiles;
drop policy if exists "own profile insert" on public.profiles;
drop policy if exists "own profile update" on public.profiles;

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
-- 2. Food logs table
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.food_logs (
  id        uuid        default gen_random_uuid() primary key,
  user_id   uuid        references auth.users(id) on delete cascade not null,
  name      text        not null,
  meta      text,
  tag       text,
  tone      text,
  glyph     text,
  meal      text,
  img       text,
  logged_at timestamptz default now()
);

alter table public.food_logs enable row level security;

drop policy if exists "own food logs" on public.food_logs;

create policy "own food logs"
  on public.food_logs for all
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Nutritionist applications
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.nutritionist_applications (
  id            uuid        default gen_random_uuid() primary key,
  user_id       uuid        references auth.users(id) on delete cascade not null,
  full_name     text        not null,
  email         text        not null,
  credential_no text        not null,
  institution   text        not null,
  note          text,
  status        text        not null default 'pending',
  reviewed_at   timestamptz,
  created_at    timestamptz default now()
);

alter table public.nutritionist_applications enable row level security;

drop policy if exists "applicants read own" on public.nutritionist_applications;
drop policy if exists "applicants insert own" on public.nutritionist_applications;
drop policy if exists "admins read all applications" on public.nutritionist_applications;
drop policy if exists "admins update applications" on public.nutritionist_applications;

create policy "applicants read own"
  on public.nutritionist_applications for select
  using (auth.uid() = user_id);

create policy "applicants insert own"
  on public.nutritionist_applications for insert
  with check (auth.uid() = user_id);

create policy "admins read all applications"
  on public.nutritionist_applications for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "admins update applications"
  on public.nutritionist_applications for update
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Patient assignments (nutritionist ↔ patient)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.patient_assignments (
  id               uuid        default gen_random_uuid() primary key,
  nutritionist_id  uuid        references auth.users(id) on delete cascade not null,
  patient_id       uuid        references auth.users(id) on delete cascade not null,
  assigned_at      timestamptz default now(),
  unique (nutritionist_id, patient_id)
);

alter table public.patient_assignments enable row level security;

drop policy if exists "nutritionists manage own assignments" on public.patient_assignments;
drop policy if exists "patients read own assignment" on public.patient_assignments;

create policy "nutritionists manage own assignments"
  on public.patient_assignments for all
  using (auth.uid() = nutritionist_id);

create policy "patients read own assignment"
  on public.patient_assignments for select
  using (auth.uid() = patient_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Nutritionist Directory (public read, admin write)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.nutritionist_directory (
  id          uuid        default gen_random_uuid() primary key,
  name        text        not null,
  credential  text,
  institution text,
  district    text        not null,
  address     text,
  phone       text,
  email       text,
  specialty   text[]      default '{}',
  available   boolean     default true,
  verified    boolean     default true,
  source      text,
  created_at  timestamptz default now()
);

alter table public.nutritionist_directory enable row level security;

drop policy if exists "auth users read directory" on public.nutritionist_directory;
drop policy if exists "admins insert directory"   on public.nutritionist_directory;
drop policy if exists "admins update directory"   on public.nutritionist_directory;

create policy "auth users read directory"
  on public.nutritionist_directory for select
  using (auth.uid() is not null);

create policy "admins insert directory"
  on public.nutritionist_directory for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "admins update directory"
  on public.nutritionist_directory for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- Seed: Real nutritionists and nutrition departments in Rwanda
-- Sources: nutrirwanda.com · afridoctor.com · kfh.rw
--          rwandamilitaryhospital.rw · lifecare.rw
-- ─────────────────────────────────────────────────────────────────────────────
insert into public.nutritionist_directory
  (name, credential, institution, district, address, phone, email, specialty, verified, source)
values
  (
    'Philemon Kwizera',
    'Registered Nutritionist-Dietitian (RAHPC)',
    'Nutri-Santé Rwanda',
    'Kicukiro, Kigali',
    'KK 10 AVE / IMELA HOUSE, Kicukiro (near Ziniya market)',
    '+250 780 626 378',
    null,
    ARRAY['Weight Management','Non-Communicable Diseases','Sports Nutrition'],
    true,
    'nutrirwanda.com'
  ),
  (
    'Umulisa Claudine',
    'Registered Nutritionist-Dietitian (RAHPC)',
    'Nutri-Santé Rwanda',
    'Kicukiro, Kigali',
    'KK 10 AVE / IMELA HOUSE, Kicukiro (near Ziniya market)',
    '+250 788 606 046',
    null,
    ARRAY['Weight Management','Diabetes Nutrition','Pregnancy & Maternal Nutrition'],
    true,
    'nutrirwanda.com'
  ),
  (
    'Dr. Odette UWERA KAMANZI',
    'Nutritionist / Dietitian',
    null,
    'Kigali',
    null,
    null,
    null,
    ARRAY['Clinical Dietetics','Medical Nutrition Therapy'],
    true,
    'afridoctor.com'
  ),
  (
    'Nutrition & Dietetics Department',
    'Hospital Department',
    'King Faisal Hospital Rwanda',
    'Gasabo, Kigali',
    'KG 544 Street 10, Kacyiru, Gasabo',
    '+250 788 123 200',
    'info@kfhkigali.com',
    ARRAY['Medical Nutrition Therapy','Weight Management','Paediatric Nutrition','Sports Nutrition'],
    true,
    'kfh.rw'
  ),
  (
    'Nutrition Department',
    'Hospital Department',
    'Rwanda Military Hospital',
    'Kicukiro, Kigali',
    'KK 739st, Kicukiro',
    '+250 788 330 247',
    'info@rmh.rw',
    ARRAY['Clinical Nutrition','Medical Nutrition Therapy'],
    true,
    'rwandamilitaryhospital.rw'
  ),
  (
    'Nutrition & Dietetics',
    'Multi-Speciality Clinic',
    'AIM LifeCare Clinic',
    'Gasabo, Kigali',
    'Vision Arcade Building, Gacuriro, Kigali',
    '+250 794 107 123',
    'customercare@lifecare.rw',
    ARRAY['Nutrition Counselling','Weight Management','Clinical Nutrition'],
    true,
    'lifecare.rw'
  )
on conflict do nothing;

-- ─────────────────────────────────────────────────────────────────────────────
-- After running: disable email confirmation in
-- Authentication → Settings → Email Auth → toggle off "Confirm email"
-- ─────────────────────────────────────────────────────────────────────────────
