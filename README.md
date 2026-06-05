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
- `SUPABASE_SERVICE_KEY`
- `GOOGLE_MAPS_API_KEY`
- `RESEND_API_KEY`
- `ANTHROPIC_API_KEY`

`RESEND_FROM_EMAIL` and `RESEND_CONTACT_TO_EMAIL` are also needed before real
contact emails can be delivered.

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

Seed data starts at `supabase/seed/sample-instructors.csv`. The checked-in
instructor rows are sample placeholders for Phase 1 development. Production
launch needs 80 to 120 real seeded instructor listings from VicRoads ADI
register, Google Maps, instructor websites, and Facebook pages.

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
- Supabase URL, anon key, and service key
- Anthropic API key
- Resend API key plus sender/recipient email variables
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

Current Phase 1 placeholders:

- Instructor data is checked-in sample data until Supabase production data is
  seeded.
- Admin claims, reviews, listings, imports, and stats are UI placeholders until
  connected to Supabase workflows.
- CSV import preview does not parse real CSV unless a parser is added later.
- Google Maps geocoding is marked pending when `GOOGLE_MAPS_API_KEY` is missing.
- Contact form submissions return safe local success without Resend delivery
  keys.
- AI matching and bio writing return local fallbacks without `ANTHROPIC_API_KEY`.

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
