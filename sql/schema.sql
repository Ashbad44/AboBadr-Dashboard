-- ============================================================
-- Monthly Earning Report — Supabase schema
-- Run this once in Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- 1. Branches (editable list — add / rename / archive any time)
create table if not exists branches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order int not null default 0,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

-- 2. Earning sources (Bank 1, Bank 2, Cash Deposit, etc — also editable)
create table if not exists earning_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order int not null default 0,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

-- 3. Per-branch income & expenses, one row per branch per month
create table if not exists monthly_branch_data (
  id uuid primary key default gen_random_uuid(),
  month date not null,               -- always the 1st of the month, e.g. 2026-07-01
  branch_id uuid not null references branches(id) on delete cascade,
  income numeric not null default 0,
  expenses numeric not null default 0,
  unique (month, branch_id)
);

-- 4. Deductions block, one row per month
create table if not exists monthly_deductions (
  id uuid primary key default gen_random_uuid(),
  month date not null unique,
  other_deduction numeric not null default 0,
  electricity_water numeric not null default 0,
  salaries numeric not null default 0,
  other_payment numeric not null default 0
);

-- 5. Per-earning-source amounts, one row per source per month
create table if not exists monthly_earning_source_data (
  id uuid primary key default gen_random_uuid(),
  month date not null,
  source_id uuid not null references earning_sources(id) on delete cascade,
  amount numeric not null default 0,
  unique (month, source_id)
);

-- ============================================================
-- Row Level Security — single-user app: any signed-in user
-- (i.e. only you, once you stop public sign-ups) can read/write.
-- ============================================================
alter table branches enable row level security;
alter table earning_sources enable row level security;
alter table monthly_branch_data enable row level security;
alter table monthly_deductions enable row level security;
alter table monthly_earning_source_data enable row level security;

create policy "authenticated full access" on branches
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated full access" on earning_sources
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated full access" on monthly_branch_data
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated full access" on monthly_deductions
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated full access" on monthly_earning_source_data
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============================================================
-- Starter data — matches your original spreadsheet exactly.
-- Edit branch/source names later from the Settings page any time.
-- ============================================================
insert into branches (name, sort_order) values
  ('Branch 1', 1), ('Branch 2', 2), ('Branch 3', 3), ('Branch 4', 4), ('Branch 5', 5);

insert into earning_sources (name, sort_order) values
  ('Bank 1', 1), ('Bank 2', 2), ('Bank 3', 3), ('Bank 4', 4), ('Bank 5', 5),
  ('Cash Deposit', 6), ('Cash Received', 7), ('Remaining', 8);
