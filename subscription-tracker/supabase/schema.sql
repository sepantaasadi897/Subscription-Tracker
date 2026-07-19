-- =============================================================
-- Subscription Tracker — Supabase schema
-- Run this in the Supabase SQL editor (or via `supabase db push`)
-- =============================================================

-- Extensions
create extension if not exists "pgcrypto";

-- -------------------------------------------------------------
-- ENUM TYPES
-- -------------------------------------------------------------
create type subscription_category as enum (
  'entertainment', 'internet', 'insurance', 'fitness', 'software', 'other'
);

create type billing_cycle as enum ('weekly', 'monthly', 'yearly');

create type subscription_status as enum ('active', 'paused', 'cancelled');

create type notification_type as enum (
  'renewal_reminder', 'payment_due', 'trial_ending'
);

create type theme_preference as enum ('light', 'dark', 'system');

-- -------------------------------------------------------------
-- PROFILES  (extends auth.users, 1:1)
-- -------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  default_currency text not null default 'USD',
  theme_preference theme_preference not null default 'system',
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- -------------------------------------------------------------
-- SUBSCRIPTIONS
-- -------------------------------------------------------------
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  category subscription_category not null default 'other',
  price numeric(10, 2) not null check (price >= 0),
  currency text not null default 'USD',
  billing_cycle billing_cycle not null default 'monthly',
  start_date date not null default current_date,
  next_payment_date date not null,
  reminder_days integer not null default 3 check (reminder_days >= 0),
  notes text,
  logo_url text,
  status subscription_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index subscriptions_user_id_idx on public.subscriptions (user_id);
create index subscriptions_next_payment_idx on public.subscriptions (next_payment_date);
create index subscriptions_status_idx on public.subscriptions (status);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute procedure public.set_updated_at();

-- -------------------------------------------------------------
-- NOTIFICATIONS
-- -------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  subscription_id uuid not null references public.subscriptions (id) on delete cascade,
  type notification_type not null default 'renewal_reminder',
  message text not null,
  scheduled_for timestamptz not null,
  sent_at timestamptz,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_id_idx on public.notifications (user_id);
create index notifications_scheduled_for_idx on public.notifications (scheduled_for);

-- -------------------------------------------------------------
-- ROW LEVEL SECURITY
-- -------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.notifications enable row level security;

-- Profiles: a user can only see/edit their own profile
create policy "Profiles are viewable by owner"
  on public.profiles for select using (auth.uid() = id);
create policy "Profiles are editable by owner"
  on public.profiles for update using (auth.uid() = id);

-- Subscriptions: full CRUD scoped to the owning user
create policy "Subscriptions are viewable by owner"
  on public.subscriptions for select using (auth.uid() = user_id);
create policy "Subscriptions are insertable by owner"
  on public.subscriptions for insert with check (auth.uid() = user_id);
create policy "Subscriptions are updatable by owner"
  on public.subscriptions for update using (auth.uid() = user_id);
create policy "Subscriptions are deletable by owner"
  on public.subscriptions for delete using (auth.uid() = user_id);

-- Notifications: read/update scoped to the owning user; inserts happen
-- via a service-role scheduled job (see /supabase/functions), so no
-- insert policy is granted to regular users here.
create policy "Notifications are viewable by owner"
  on public.notifications for select using (auth.uid() = user_id);
create policy "Notifications are updatable by owner"
  on public.notifications for update using (auth.uid() = user_id);

-- -------------------------------------------------------------
-- STORAGE (subscription logo uploads)
-- -------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('subscription-logos', 'subscription-logos', true)
on conflict (id) do nothing;

create policy "Logo images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'subscription-logos');

create policy "Users can upload their own logos"
  on storage.objects for insert
  with check (
    bucket_id = 'subscription-logos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own logos"
  on storage.objects for delete
  using (
    bucket_id = 'subscription-logos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
