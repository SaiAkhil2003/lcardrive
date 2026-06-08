alter table public.instructors
  add column if not exists rating numeric(2, 1) default 0,
  add column if not exists review_count integer default 0,
  add column if not exists experience_years integer,
  add column if not exists availability_days text[] default array[]::text[],
  add column if not exists profile_photo_url text;

alter table public.search_logs
  add column if not exists query text,
  add column if not exists filters jsonb default '{}'::jsonb;

create index if not exists instructors_slug_idx
  on public.instructors (slug);

create index if not exists instructors_location_idx
  on public.instructors (latitude, longitude);

create index if not exists profile_claims_status_idx
  on public.profile_claims (status);

create index if not exists reviews_status_idx
  on public.reviews (status);

create index if not exists search_logs_created_at_idx
  on public.search_logs (created_at);
