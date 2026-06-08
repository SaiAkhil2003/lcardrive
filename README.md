# LCarDrive

Next.js 14 App Router MVP foundation for LCarDrive.

## Local Setup

Install dependencies and run the app locally:

```bash
npm install
npm run dev
```

Use `http://localhost:3000` for local development and internal testing.

Build before deployment:

```bash
npm run build
```

## Environment Variables

Copy `.env.example` into your local environment and fill only keys owned by the
project. Do not commit real secrets.

Required production variables:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/portal`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/portal`
- `NEXT_PUBLIC_SITE_URL=https://cardrive.56776543.xyz`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_MAPS_API_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `ANTHROPIC_API_KEY`
- `ADMIN_NOTIFICATION_EMAIL`

`NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY` is only needed if client-side Places
autocomplete is added later; restrict it to the production domain before use.

## Clerk And Google OAuth

1. Create or use the Clerk application for LCarDrive.
2. Add the Clerk publishable and secret keys to Vercel project environment
   variables.
3. Enable Google OAuth in the Clerk Dashboard. Do not hardcode Google OAuth
   credentials in this repository.
4. After Vercel deployment, set the Clerk production domain to
   `cardrive.56776543.xyz`.
5. Add the deployed sign-in and sign-up redirect URLs in Clerk:
   `https://cardrive.56776543.xyz/sign-in` and
   `https://cardrive.56776543.xyz/sign-up`.
6. Set trusted admin users with `publicMetadata.role` or `privateMetadata.role`
   equal to `admin`. Claimed instructors should use role `instructor`.

## Supabase Setup

Run the migrations in `supabase/migrations` in order:

1. `001_create_instructors_table.sql`
2. `002_create_reviews_table.sql`
3. `003_create_claims_table.sql`
4. `004_create_search_logs_table.sql`
5. `005_rls_policies.sql`
6. `006_phase1_production_readiness_columns.sql`

Seed data starts at `supabase/seed/sample-instructors.csv` for local demos. The
checked-in instructor rows are sample placeholders and are clearly marked as
sample data. Production launch needs 80 to 120 real seeded instructor listings
using `supabase/seed/real-instructors-template.csv`.

Real import rows should include:

- `id`, `slug`, `name`, `suburb`, `state`, `latitude`, `longitude`
- `transmission`, `licence_type`, `hourly_rate`, `package_5hr`,
  `package_10hr`
- `rating`, `review_count`, `languages`, `anxiety_friendly`,
  `international_licence`, `verified`
- `experience_years`, `vehicle_make`, `vehicle_model`, `vehicle_year`,
  `dual_controls`
- `service_areas`, `test_centres`, `bio`, `adi_registration`, `phone`, `email`,
  `profile_photo_url`

Do not seed fake production instructors. Replace sample rows only after the real
data source and business review are complete.

## Vercel Deployment

Expected Vercel project: `lcardrive`.

Before deploying:

```bash
git status
npm run build
git add .
git commit -m "Complete Phase 1 pending features and deployment preparation"
git push
```

Then deploy from GitHub or with Vercel CLI after confirming the target project
and environment variables.

Required Vercel production environment:

- Clerk keys and Clerk URL variables
- `NEXT_PUBLIC_SITE_URL=https://cardrive.56776543.xyz`
- Supabase URL, anon key, and service role key
- Anthropic API key
- Resend API key plus sender/admin notification email variables
- Google Maps API key

## Domain Mapping

Temporary production domain target:

```text
cardrive.56776543.xyz
```

In Vercel project settings for `lcardrive`, add this domain:

```text
cardrive.56776543.xyz
```

At the domain provider, create this DNS record:

```text
Type: CNAME
Name: cardrive
Value: cname.vercel-dns-0.com
```

After DNS propagation, verify:

```text
https://cardrive.56776543.xyz
```

Do not modify registrar DNS without domain-provider access and explicit
confirmation.

## Placeholder Services

Current Phase 1 fallback behavior:

- Public instructor search, profile pages, admin listings, admin claim/review
  queues, and admin stats read from Supabase when production keys and data are
  configured. They fall back to checked-in sample/placeholder data when
  Supabase is unavailable.
- Claim submissions, review submissions, search logs, and admin listing edits
  persist to Supabase when the required variables are configured. They return
  safe fallback responses when local demo keys are missing.
- CSV import preview does not parse real CSV unless a parser is added later.
- Google Maps geocoding and radius search run server-side when
  `GOOGLE_MAPS_API_KEY` and instructor coordinates are available.
- Contact form submissions return safe local success without Resend delivery
  keys.
- AI matching and bio writing return local fallbacks without `ANTHROPIC_API_KEY`.
- AI routes include a process-local rate-limit placeholder. Use a durable rate
  limiter before high-traffic production use.

## Phase 1 Scope

Included in Phase 1:

- Public instructor search
- 5-question instructor matching flow
- Instructor profile pages
- Contact instructor form
- Review submission for moderation
- Instructor claim form with manual admin review
- Clerk auth foundation
- Instructor portal UI
- Admin panel UI
- Supabase schema foundation
- Server-side AI route fallbacks
- Sitemap, robots, metadata, and LocalBusiness JSON-LD

Out of scope for Phase 1:

- Booking
- Calendar booking
- Payments or Stripe
- Learner accounts
- Logbook tracker
- In-app messaging
- SMS messaging
- Native mobile app
- Featured paid listings
- AI natural language search
- AI pricing intelligence
- Listing report or flag queues
