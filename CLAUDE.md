# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is SoloWay?

Solo travel companion app — "Travel Solo, Not Alone." Helps solo travelers discover, book, and share experiences (activities, tours, restaurants, events) at their destination. NOT a flights/hotels app — it's everything you do once you're there.

**Three pillars:** Smart Itineraries (AI trip planning), Safety Guardian (safety scoring/check-ins), Social Radar (QR buddy system for meeting other travelers).

**Revenue model:** Commission-based in-app booking ONLY. No affiliate redirects, no paywalls, no subscriptions.

## Development Commands

### Frontend (from project root)
```bash
npm run dev          # Vite dev server on port 3000 (auto-opens browser)
npm run build        # Production build to dist/ with sourcemaps
npm run lint         # ESLint check
```

### Backend (from `backend/` directory)
```bash
npm run dev          # Nodemon watching src/index.js (port 3001)
npm start            # Production: node src/index.js
npm test             # Vitest (minimal test coverage currently)
npm run lint         # ESLint on src/
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database
```

### Verification after changes
- Frontend: always run `npm run build` — must produce zero errors
- Backend: run `node --check <file>` on new/modified backend files to verify syntax

### Required Environment Variables (backend `.env`)
`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`

Frontend uses `VITE_API_URL` (defaults to `http://localhost:3001/api/v1`).

## Tech Stack

**Frontend:** React 18 + Vite + Tailwind CSS + React Router v6, Lucide React icons, ES modules

**Backend:** Node.js 18+ + Express (modular monolith), Supabase (PostgreSQL + PostGIS), Redis (caching, rate limiting, refresh tokens, pub/sub), Socket.io with Redis adapter, JWT auth (access/refresh token separation, issuer/audience verification), Joi validation

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
- Database access via `getSupabaseAdmin()` from `backend/src/shared/database/supabase.js`
- Validation: `validate({ params: schema, body: schema, query: schema })` using Joi
- User ID on authenticated requests: `req.userId` (NOT `req.user.id`)
- Config validation on startup via `validateConfig()`
- All routes mounted at `/api/v1/{module}` (auth, users, itineraries, safety, social, buddy)

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
- Landing page (hero, features, safety section, CTA/waitlist, footer)
- Auth system (login/register, JWT, refresh tokens, protected routes)
- Itinerary CRUD (create, list, detail, add/update/delete items)
- Destination selection (country/region/city with bidirectional auto-fill)
- Dual-path onboarding: "Create My Trip" vs "Explore First"
- Two-path booking flow: AI-powered itinerary generation vs manual browse (TripContext, AIPreferences, AIItinerary, BookingCart pages)
- Backend security hardening: stricter JWT, Joi validation, WebSocket sanitization
- QR Buddy backend: 5 files in `backend/src/modules/buddy/`, 4 Supabase tables
- Frontend buddy service files: `buddyService.js` and `guestService.js`

### In Progress:
- QR Buddy frontend UI (InviteBuddyModal, GuestJoin page at `/join/:token`, BuddyHistory page)

### Known Gaps:
- Frontend calls `POST /waitlist` but no backend `/waitlist` route is mounted
- Backend safety + social APIs exist but frontend doesn't consume them yet
- WebSocket/realtime backend exists but no frontend WebSocket client wiring
- Public itinerary endpoints (`GET /itineraries/public`, `GET /itineraries/nearby`) unused

## Important Rules

1. Never invent endpoints that don't exist — always check the actual route files
2. The guest QR scan page (`/join/:token`) must NEVER require authentication
3. Revenue features must be commission-based only — no paywalls, no subscriptions
4. Every authenticated page must use the `ImmersivePage` wrapper
5. Follow the existing module pattern for any new backend features
6. Run `npm run build` after frontend changes to verify zero errors
7. Run `node --check` on new backend files to verify syntax
8. Change log lives in `log.md` — update it when completing work intervals
