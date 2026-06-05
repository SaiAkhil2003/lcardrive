create table if not exists public.profile_claims (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid references public.instructors(id) on delete set null,
  instructor_slug text not null,
  clerk_user_id text,
  full_name text not null,
  email text not null,
  phone text not null,
  adi_registration text not null,
  status text default 'pending',
  admin_notes text,
  created_at timestamptz default now(),
  reviewed_at timestamptz
);
