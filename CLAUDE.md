# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is SoloWay?

Solo travel companion app — "Travel Solo, Not Alone." Helps solo travelers discover, book, and share experiences (activities, tours, restaurants, events) at their destination. NOT a flights/hotels app — it's everything you do once you're there.

**Three pillars:** Smart Itineraries (AI trip planning), Safety Guardian (safety scoring/check-ins), Social Radar (QR buddy system for meeting other travelers).

**Revenue model:** Commission-based in-app booking ONLY. No affiliate redirects, no paywalls, no subscriptions.

## Development Commands

### Frontend (from project root)
```bash
npm run dev          # Runs web (Vite, port 3000) + api (port 3001) together via concurrently
npm run dev:web      # Vite dev server only
npm run build        # Production build to dist/ with sourcemaps
npm run lint         # ESLint check
npm test             # Vitest (jsdom)
```

### Backend (from `backend/` directory)
```bash
npm run dev          # Nodemon watching src/index.js (port 3001)
npm start            # Production: node src/index.js
npm test             # Vitest
npm run lint         # ESLint on src/
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database (refuses in production)
```

### Verification after changes
- Frontend: always run `npm run build` — must produce zero errors
- Backend: run `node --check <file>` on new/modified backend files to verify syntax

### Required Environment Variables (backend `.env`)
Dev minimum: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`

Production additionally requires: `APP_BASE_URL`, `JWT_REFRESH_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` (enforced by `validateConfig()`). Optional: `DATABASE_CA_CERT` (Postgres TLS verification), `SENTRY_DSN`, `LOG_LEVEL`, `TICKETMASTER_API_KEY`. Full list in `backend/.env.example`.

Frontend uses `VITE_API_URL` (dev default `http://localhost:3001/api/v1`; **required for production** — deploy builds fail without it and prod bundles refuse to boot). Optional `VITE_SENTRY_DSN`.

## Tech Stack

**Frontend:** React 18 + Vite + Tailwind CSS + React Router v6, Lucide React icons, ES modules

**Backend:** Node.js 20+ + Express (modular monolith), Supabase (PostgreSQL + PostGIS), Redis (caching, rate limiting, refresh tokens, pub/sub), Socket.io with Redis adapter, JWT auth (access/refresh token separation, issuer/audience verification), Joi validation, pino structured logging, Stripe Connect, Resend email, Twilio SMS

**Ops:** GitHub Actions CI (`.github/workflows/ci.yml`), nightly Postgres backup to S3 (`.github/workflows/db-backup.yml`, see `BACKUPS.md`), Sentry error monitoring (both tiers, DSN-gated). Launch runbook: `DEPLOY.md`. AWS migration strategy: `MIGRATION.md`.

## Architecture

### Frontend patterns — follow these exactly:
- `ImmersivePage` — wrapper component for authenticated pages (travel-photo bg + atmospheric overlay). Every authenticated page must use it.
- `useAuth` hook in `src/hooks/useAuth.js` — provides user state from `AuthContext`
- `ProtectedRoute` — wraps routes requiring authentication
- `DarkModeContext` — theme management (defaults to light for first-time visitors)
- `TripContext` — shared state for the booking flow (destination, dates, path choice, vibe preferences, cart items)
- `apiRequest` from `src/utils/apiClient.js` — generic API client. Pass `auth: true` for authenticated requests. Configured with `configureApiClient({ getToken, handleUnauthorized })`.
- `API_BASE_URL` from `src/utils/env.js` — base URL for backend

### Backend patterns:
- Modules live in `backend/src/modules/{name}/` with: `{name}.routes.js`, `{name}.controller.js`, `{name}.service.js`, `{name}.schemas.js`
- Shared middleware in `backend/src/shared/middleware/` — `auth.js`, `validate.js`, `errorHandler.js`, `rateLimiter.js`
- Database access: older modules use `getSupabaseAdmin()` from `backend/src/shared/database/supabase.js`; newer modules (buddy, payments, webhooks, admin) use raw SQL via `query`/`transaction` from `backend/src/shared/database/index.js` — prefer raw SQL for new modules (eases any future move off Supabase, see `MIGRATION.md`)
- Logging: `logger` from `backend/src/shared/logging/logger.js` (pino) — do NOT use `console.*` in app code
- Validation: `validate({ params: schema, body: schema, query: schema })` using Joi
- User ID on authenticated requests: `req.userId` (NOT `req.user.id`)
- Config validation on startup via `validateConfig()`
- All routes mounted at `/api/v1/{module}` (auth, users, itineraries, safety, social, buddy, waitlist, providers, experiences, events, reviews, payments, webhooks, admin)

### Backend JWT details:
- Separate access (15m) and refresh (30d) tokens with distinct secrets and audiences
- Refresh tokens stored in Redis (revocable)
- Algorithm: HS256, issuer/audience verified on every request

### Rate limiting:
- Global: 100 requests per 60 seconds
- Buddy guest verification: 5 attempts per 15 minutes
- Buddy guest confirm: 10 attempts per 15 minutes

### Styling conventions:
- Glassmorphism cards: `bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-6`
- Primary buttons: `bg-white text-slate-900 font-semibold rounded-xl hover:bg-white/90`
- Secondary buttons: `bg-white/10 text-white rounded-xl hover:bg-white/20`
- Text hierarchy: `text-white` (primary), `text-white/60` (secondary), `text-white/40` (tertiary)
- Every page should feel immersive — avoid bland/traditional app vibes

## QR Buddy System

Invites are tied to a specific itinerary item (not generic links).

**Host flow:** View itinerary item → "Invite Buddy" → `createInvite(hostUserId, itineraryItemId)` → QR URL `{APP_BASE_URL}/join/{token}`

**Guest flow:** Scan QR → `/join/:token` (public, no auth) → see event details → enter phone + name → SMS verification → 6-digit code → link activates

**Post-event:** Either party can request permanent connection via `requestConnection()`.

Key service methods: `createInvite`, `getInviteByToken`, `initiateGuestVerification`, `confirmGuestAndActivate`, `cancelInvite`, `closeLink`, `getUserHistory`, `getLinkDetail`, `requestConnection`, `respondToConnection`

Implementation spec: `buddy-frontend-v2.md` in project root.

## Current State

### Completed:
- Landing experience (destination atlas with daily rotation, featured experiences, field notes, reviews, CTA/waitlist, footer)
- Auth system (login/register, JWT, refresh tokens, email verification, password reset, protected routes)
- Itinerary CRUD (create, list, detail, add/update/delete items) with destination selection
- Booking & commerce: Stripe Connect checkout, webhook-confirmed orders, refunds, provider onboarding
- QR Buddy end-to-end: backend module + InviteBuddyModal, GuestJoin (`/join/:token`), BuddyHistory; Twilio SMS verification (dev prints codes to console)
- Community reviews (public page + API), local events (Ticketmaster, optional key), admin portal (`/admin`)
- Production readiness: CI, structured logging, deep health check, graceful shutdown, Sentry hooks, nightly S3 database backups, launch checklist (`DEPLOY.md`)

### Gated (routes redirect until built):
- AI itinerary generation — `/ai-preferences` and `/ai-itinerary` are stubs that redirect to `/start`; FirstChoice shows "Coming Soon"

### Known Gaps:
- Backend safety + social APIs exist but frontend doesn't consume them yet
- WebSocket/realtime backend exists but no frontend WebSocket client wiring
- Public itinerary endpoints (`GET /itineraries/public`, `GET /itineraries/nearby`) unused
- Buddy/waitlist rate limiters are in-memory (fine single-instance; use Redis store when scaling out)

## Important Rules

1. Never invent endpoints that don't exist — always check the actual route files
2. The guest QR scan page (`/join/:token`) must NEVER require authentication
3. Revenue features must be commission-based only — no paywalls, no subscriptions
4. Every authenticated page must use the `ImmersivePage` wrapper
5. Follow the existing module pattern for any new backend features
6. Run `npm run build` after frontend changes to verify zero errors
7. Run `node --check` on new backend files to verify syntax
8. Change log lives in `log.md` — update it when completing work intervals
