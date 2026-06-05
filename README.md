# LCarDrive

Next.js 14 App Router MVP foundation for LCarDrive.

## Local Development

```bash
npm run dev
```

Use `http://localhost:3000` for local development.

## Environment

Copy `.env.example` into your local environment and fill only real service keys
owned by the project. Do not commit real API keys.

Required production services:

- Clerk publishable and secret keys
- Supabase URL, anon key, and service role key
- Anthropic API key for AI matching and bio generation
- Resend API key plus verified sender/recipient configuration for contact email
- Google Maps API key for future geocoding and geo search

Google OAuth must be enabled in the Clerk Dashboard under authentication
settings. Do not hardcode Google OAuth keys in the app.

## Data

The checked-in instructor rows are sample placeholders for Phase 1 development.
Production launch requires 80 to 120 real seeded listings from VicRoads ADI
register, Google Maps, instructor websites, and Facebook pages.

## Phase 1 Scope

This foundation includes public search, instructor profiles, profile claims,
Clerk auth scaffolding, instructor portal UI, admin UI, Supabase migrations,
safe API fallbacks, sitemap, robots, and profile JSON-LD.

Out of scope for Phase 1: booking, payments, Stripe, learner accounts, in-app
chat or SMS messaging, native mobile app, paid featured listings, AI natural
language search, AI pricing intelligence, and listing flag/report queues.
