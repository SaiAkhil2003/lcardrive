create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid references public.instructors(id) on delete cascade,
  instructor_slug text,
  reviewer_first_name text not null,
  reviewer_email text not null,
  rating_overall numeric(2, 1) not null,
  rating_patience numeric(2, 1) not null,
  rating_communication numeric(2, 1) not null,
  rating_value numeric(2, 1) not null,
  rating_punctuality numeric(2, 1) not null,
  pass_outcome text,
  comment text not null,
  status text default 'pending',
  created_at timestamptz default now(),
  moderated_at timestamptz
);
