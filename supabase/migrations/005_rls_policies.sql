alter table public.instructors enable row level security;
alter table public.reviews enable row level security;
alter table public.profile_claims enable row level security;
alter table public.search_logs enable row level security;

create policy "Public can read visible instructors"
  on public.instructors
  for select
  using (true);

create policy "Public can read approved reviews"
  on public.reviews
  for select
  using (status = 'approved');

create policy "Public can submit reviews for moderation"
  on public.reviews
  for insert
  with check (status = 'pending');

create policy "Authenticated users can submit profile claims"
  on public.profile_claims
  for insert
  with check (status = 'pending');

create policy "Public can write search logs"
  on public.search_logs
  for insert
  with check (true);

-- Admin reads/writes should be performed server-side with SUPABASE_SERVICE_KEY.
