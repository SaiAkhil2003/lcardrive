create table if not exists public.search_logs (
  id uuid primary key default gen_random_uuid(),
  suburb text,
  radius_km integer,
  licence_type text,
  transmission text,
  special_needs jsonb default '[]'::jsonb,
  available_days text[] default array[]::text[],
  max_hourly_rate numeric(8, 2),
  language text,
  gender text,
  test_centre text,
  results_count integer,
  created_at timestamptz default now()
);
