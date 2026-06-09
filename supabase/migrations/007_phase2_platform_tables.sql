create extension if not exists "pgcrypto";

create or replace function public.lcardrive_current_user_id()
returns text
language sql
stable
as $$
  select coalesce(
    auth.jwt() ->> 'sub',
    auth.jwt() ->> 'clerk_user_id',
    auth.uid()::text
  );
$$;

create or replace function public.lcardrive_is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'role', '') = 'admin'
    or coalesce(auth.jwt() -> 'publicMetadata' ->> 'role', '') = 'admin'
    or coalesce(auth.jwt() -> 'privateMetadata' ->> 'role', '') = 'admin';
$$;

create or replace function public.lcardrive_user_owns_instructor(target_slug text)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profile_claims
    where clerk_user_id = public.lcardrive_current_user_id()
      and instructor_slug = target_slug
      and lower(status) in ('approved', 'verified', 'accepted')
  );
$$;

create table if not exists public.learner_profiles (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  full_name text,
  email text,
  phone text,
  suburb text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.instructor_availability (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid references public.instructors(id) on delete cascade,
  instructor_slug text not null,
  clerk_user_id text,
  weekday integer check (weekday between 0 and 6),
  start_time time,
  end_time time,
  slot_minutes integer default 60,
  is_recurring boolean default true,
  blocked_date date,
  is_blocked boolean default false,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid references public.instructors(id) on delete set null,
  instructor_slug text not null,
  learner_clerk_user_id text not null,
  learner_name text,
  learner_email text,
  learner_phone text,
  lesson_type text default 'standard',
  package_hours numeric(4, 1),
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  pickup_suburb text,
  pickup_address text,
  notes text,
  status text default 'pending',
  alternate_start timestamptz,
  cancellation_reason text,
  payment_status text default 'not_required',
  amount_cents integer default 0,
  platform_fee_cents integer default 0,
  currency text default 'aud',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.booking_events (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete cascade,
  actor_clerk_user_id text,
  actor_role text,
  event_type text not null,
  message text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.payment_intents (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete set null,
  learner_clerk_user_id text,
  instructor_slug text,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  stripe_account_id text,
  amount_cents integer default 0,
  application_fee_cents integer default 0,
  currency text default 'aud',
  status text default 'pending',
  raw_event_type text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.instructor_payout_accounts (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid references public.instructors(id) on delete set null,
  instructor_slug text not null,
  clerk_user_id text,
  stripe_account_id text,
  stripe_onboarding_status text default 'not_started',
  charges_enabled boolean default false,
  payouts_enabled boolean default false,
  details_submitted boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.learner_logbook_entries (
  id uuid primary key default gen_random_uuid(),
  learner_clerk_user_id text not null,
  booking_id uuid references public.bookings(id) on delete set null,
  date date not null,
  duration_minutes integer not null,
  instructor_slug text,
  instructor_name text,
  suburb text,
  skills_practiced text[] default array[]::text[],
  notes text,
  supervisor_type text default 'instructor',
  verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.favourites (
  id uuid primary key default gen_random_uuid(),
  learner_clerk_user_id text not null,
  instructor_slug text not null,
  created_at timestamptz default now(),
  unique (learner_clerk_user_id, instructor_slug)
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid references public.instructors(id) on delete set null,
  instructor_slug text not null,
  clerk_user_id text,
  plan_code text not null,
  status text default 'pending_payment',
  current_period_start timestamptz,
  current_period_end timestamptz,
  stripe_subscription_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.featured_listing_orders (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid references public.instructors(id) on delete set null,
  instructor_slug text not null,
  clerk_user_id text,
  status text default 'pending_payment',
  starts_at timestamptz,
  ends_at timestamptz,
  amount_cents integer default 0,
  payment_intent_id uuid references public.payment_intents(id) on delete set null,
  admin_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.platform_events (
  id uuid primary key default gen_random_uuid(),
  actor_clerk_user_id text,
  actor_role text,
  event_type text not null,
  entity_type text,
  entity_id text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_clerk_user_id text,
  recipient_email text,
  channel text default 'email',
  template text,
  status text default 'pending',
  payload jsonb default '{}'::jsonb,
  sent_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists learner_profiles_clerk_user_id_idx
  on public.learner_profiles (clerk_user_id);
create index if not exists instructor_availability_slug_idx
  on public.instructor_availability (instructor_slug, weekday);
create index if not exists bookings_learner_idx
  on public.bookings (learner_clerk_user_id, scheduled_start);
create index if not exists bookings_instructor_idx
  on public.bookings (instructor_slug, scheduled_start);
create index if not exists bookings_status_idx
  on public.bookings (status);
create index if not exists booking_events_booking_idx
  on public.booking_events (booking_id, created_at);
create index if not exists payment_intents_booking_idx
  on public.payment_intents (booking_id);
create index if not exists payout_accounts_instructor_idx
  on public.instructor_payout_accounts (instructor_slug);
create index if not exists logbook_learner_date_idx
  on public.learner_logbook_entries (learner_clerk_user_id, date);
create index if not exists favourites_learner_idx
  on public.favourites (learner_clerk_user_id);
create index if not exists subscriptions_instructor_idx
  on public.subscriptions (instructor_slug, status);
create index if not exists featured_listing_status_idx
  on public.featured_listing_orders (status, starts_at, ends_at);
create index if not exists platform_events_type_idx
  on public.platform_events (event_type, created_at);
create index if not exists notifications_recipient_idx
  on public.notifications (recipient_clerk_user_id, status);

alter table public.learner_profiles enable row level security;
alter table public.instructor_availability enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_events enable row level security;
alter table public.payment_intents enable row level security;
alter table public.instructor_payout_accounts enable row level security;
alter table public.learner_logbook_entries enable row level security;
alter table public.favourites enable row level security;
alter table public.subscriptions enable row level security;
alter table public.featured_listing_orders enable row level security;
alter table public.platform_events enable row level security;
alter table public.notifications enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'instructors' and policyname = 'Admin JWT can manage instructors') then
    execute 'create policy "Admin JWT can manage instructors" on public.instructors for all using (public.lcardrive_is_admin()) with check (public.lcardrive_is_admin())';
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'reviews' and policyname = 'Admin JWT can moderate reviews') then
    execute 'create policy "Admin JWT can moderate reviews" on public.reviews for all using (public.lcardrive_is_admin()) with check (public.lcardrive_is_admin())';
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profile_claims' and policyname = 'Admin JWT can moderate claims') then
    execute 'create policy "Admin JWT can moderate claims" on public.profile_claims for all using (public.lcardrive_is_admin()) with check (public.lcardrive_is_admin())';
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'search_logs' and policyname = 'Admin JWT can read search logs') then
    execute 'create policy "Admin JWT can read search logs" on public.search_logs for select using (public.lcardrive_is_admin())';
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'learner_profiles' and policyname = 'Learners can manage own profile') then
    execute 'create policy "Learners can manage own profile" on public.learner_profiles for all using (clerk_user_id = public.lcardrive_current_user_id()) with check (clerk_user_id = public.lcardrive_current_user_id())';
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'learner_profiles' and policyname = 'Admin JWT can manage learner profiles') then
    execute 'create policy "Admin JWT can manage learner profiles" on public.learner_profiles for all using (public.lcardrive_is_admin()) with check (public.lcardrive_is_admin())';
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'favourites' and policyname = 'Learners can manage own favourites') then
    execute 'create policy "Learners can manage own favourites" on public.favourites for all using (learner_clerk_user_id = public.lcardrive_current_user_id()) with check (learner_clerk_user_id = public.lcardrive_current_user_id())';
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'learner_logbook_entries' and policyname = 'Learners can manage own logbook') then
    execute 'create policy "Learners can manage own logbook" on public.learner_logbook_entries for all using (learner_clerk_user_id = public.lcardrive_current_user_id()) with check (learner_clerk_user_id = public.lcardrive_current_user_id())';
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'instructor_availability' and policyname = 'Instructors can manage own availability') then
    execute 'create policy "Instructors can manage own availability" on public.instructor_availability for all using (public.lcardrive_user_owns_instructor(instructor_slug)) with check (public.lcardrive_user_owns_instructor(instructor_slug))';
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'bookings' and policyname = 'Learners can manage own bookings') then
    execute 'create policy "Learners can manage own bookings" on public.bookings for all using (learner_clerk_user_id = public.lcardrive_current_user_id()) with check (learner_clerk_user_id = public.lcardrive_current_user_id())';
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'bookings' and policyname = 'Instructors can read and update owned bookings') then
    execute 'create policy "Instructors can read and update owned bookings" on public.bookings for all using (public.lcardrive_user_owns_instructor(instructor_slug)) with check (public.lcardrive_user_owns_instructor(instructor_slug))';
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'booking_events' and policyname = 'Booking participants can read events') then
    execute 'create policy "Booking participants can read events" on public.booking_events for select using (exists (select 1 from public.bookings b where b.id = booking_id and (b.learner_clerk_user_id = public.lcardrive_current_user_id() or public.lcardrive_user_owns_instructor(b.instructor_slug))))';
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'booking_events' and policyname = 'Booking participants can insert events') then
    execute 'create policy "Booking participants can insert events" on public.booking_events for insert with check (exists (select 1 from public.bookings b where b.id = booking_id and (b.learner_clerk_user_id = public.lcardrive_current_user_id() or public.lcardrive_user_owns_instructor(b.instructor_slug))))';
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'payment_intents' and policyname = 'Payment participants can read limited records') then
    execute 'create policy "Payment participants can read limited records" on public.payment_intents for select using (learner_clerk_user_id = public.lcardrive_current_user_id() or public.lcardrive_user_owns_instructor(instructor_slug))';
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'instructor_payout_accounts' and policyname = 'Instructors can read own payout readiness') then
    execute 'create policy "Instructors can read own payout readiness" on public.instructor_payout_accounts for select using (public.lcardrive_user_owns_instructor(instructor_slug))';
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'subscriptions' and policyname = 'Instructors can manage own subscriptions') then
    execute 'create policy "Instructors can manage own subscriptions" on public.subscriptions for all using (public.lcardrive_user_owns_instructor(instructor_slug)) with check (public.lcardrive_user_owns_instructor(instructor_slug))';
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'featured_listing_orders' and policyname = 'Instructors can manage own featured listing orders') then
    execute 'create policy "Instructors can manage own featured listing orders" on public.featured_listing_orders for all using (public.lcardrive_user_owns_instructor(instructor_slug)) with check (public.lcardrive_user_owns_instructor(instructor_slug))';
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'platform_events' and policyname = 'Admin JWT can read platform events') then
    execute 'create policy "Admin JWT can read platform events" on public.platform_events for select using (public.lcardrive_is_admin())';
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'notifications' and policyname = 'Users can read own notifications') then
    execute 'create policy "Users can read own notifications" on public.notifications for select using (recipient_clerk_user_id = public.lcardrive_current_user_id())';
  end if;
end $$;

do $$
declare
  target_table text;
begin
  foreach target_table in array array[
    'learner_profiles',
    'instructor_availability',
    'bookings',
    'booking_events',
    'payment_intents',
    'instructor_payout_accounts',
    'learner_logbook_entries',
    'favourites',
    'subscriptions',
    'featured_listing_orders',
    'platform_events',
    'notifications'
  ]
  loop
    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = target_table and policyname = 'Admin JWT can manage ' || target_table) then
      execute format(
        'create policy %I on public.%I for all using (public.lcardrive_is_admin()) with check (public.lcardrive_is_admin())',
        'Admin JWT can manage ' || target_table,
        target_table
      );
    end if;
  end loop;
end $$;
