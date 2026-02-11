# Change Log

## 2026-02-04 - Interval 1
- Enabled Redis-backed rate limiting and runtime store swap
- Added refresh token rotation with revocation storage
- Enforced refresh token persistence checks
- Secured WebSocket room joins with authorization checks
- Enabled Socket.io Redis adapter for multi-instance scaling
- Replaced Redis KEYS cache invalidation with SCAN
- Added refresh token migration and dependency

## 2026-02-04 - Interval 2
- Tests: `npm test` (backend) -> failed (no test files found)

## 2026-02-04 - Interval 3
- Added backend smoke test
- Tests: `npm test` (backend) -> passed (1 test)

## 2026-02-10 - Interval 4
- Refactored backend bootstrap imports to consume shared middleware barrel without changing runtime behavior
- Refactored graceful shutdown signal handling into a reusable helper in `backend/src/index.js`
- Refactored `src/pages/Landing.jsx` to use the existing components barrel export (`src/components/index.js`)

## 2026-02-10 - Interval 5
- Added frontend integration foundation: API base URL config, generic API client, auth service layer, and session-backed auth context
- Added route protection primitive with `src/components/ProtectedRoute.jsx` and registered `AuthProvider` in `src/main.jsx`
- Added frontend `.env.example` with `VITE_API_URL` and expanded backend CORS config to support comma-separated origins with local defaults for ports `3000` and `5173`

## 2026-02-10 - Interval 6
- Added backend waitlist module (`POST /api/v1/waitlist`) with Joi validation, strict rate limiting, and idempotent insert behavior
- Wired CTA submit flow to backend waitlist endpoint with loading/error/success feedback and community anchor targeting
- Added first auth/profile vertical slice in frontend: `/auth` login/register page, protected `/profile` route, profile data fetch, and navigation wiring from landing UI

## 2026-02-10 - Interval 7
- Added backend development fallbacks for `DATABASE_URL` and `REDIS_URL` in `backend/src/config/index.js` to support local boot when `backend/.env` is missing

## 2026-02-10 - Interval 8
- Implemented Option A guardrails by enforcing Supabase env vars in non-test environments with explicit startup errors
- Added local `backend/.env` scaffold for Docker-backed Postgres/Redis plus CORS defaults to streamline local auth testing

## 2026-02-10 - Interval 9
- Improved auth visibility in landing navbar with explicit signed-in indicator and added direct logout action (desktop and mobile)

## 2026-02-10 - Interval 10
- Hardened auth UX visibility by always showing explicit signed-in/signed-out state in navbar
- Added guaranteed auth actions in navbar (`Sign In / Register` when signed out, `My Profile` + `Log Out` when signed in)

## 2026-02-10 - Interval 11
- Removed duplicated mobile auth actions from overlay menu to avoid overlapping controls
- Split `useAuth` hook implementation into `src/hooks/useAuth.js` and exported `AuthContext` from provider file to reduce HMR export overlap warnings

## 2026-02-10 - Interval 12
- Fixed auth-state race by preventing global session clear on unauthenticated 401s without a bearer header
- Updated auth context to immediately sync API client token after login/register/refresh so navbar/session state remains consistent right after sign-in

## 2026-02-10 - Interval 13
- Implemented dual-path post-auth onboarding flow with `Create My Trip` vs `Explore First` entry point
- Added protected itinerary MVP pages and service wiring: create/list/detail itinerary and add/update/delete itinerary items
- Updated auth navigation flow so successful sign-in routes to onboarding start and signed-in landing CTA points to onboarding/trips

## 2026-02-10 - Interval 14
- Added `laterfeatures.md` to capture future immersive visual direction (travel-photo backgrounds and sanctuary-like UX tone)
- Updated itinerary create/edit flows to use a destination-country dropdown sourced from a shared countries list

## 2026-02-10 - Interval 15
- Added structured destination pattern to itinerary forms: country + city for all trips, with required US state dropdown when country is `United States`
- Added destination utilities for formatting/parsing saved destination strings to preserve compatibility with existing itinerary records

## 2026-02-10 - Interval 16
- Added destination catalog-driven dropdowns for country, region/state, and city with bidirectional auto-fill across all three selectors
- Implemented selection resolver so picking city or region auto-populates country (and vice versa) in both itinerary create and edit forms

## 2026-02-10 - Interval 17
- Restored accidentally removed frontend auth/itinerary foundation (providers, routes, pages, API services, and protected navigation)
- Reconnected waitlist CTA API submission and onboarding/trip route flow after restore

## 2026-02-10 - Interval 18
- Updated destination UX so city starts blank as free text with suggestions; typing/selecting a known city auto-fills country and region/state
- Kept country/region selectors synchronized so choosing any selector resolves the other destination fields consistently

## 2026-02-10 - Interval 19
- Fixed backend CORS origin parsing to support comma-separated allowed origins from environment variables
- Resolved frontend `Failed to fetch` auth issue caused by invalid CORS matching against combined origin string

## 2026-02-11 - Interval 20
- Added reusable immersive authenticated-page shell with travel-photo backgrounds and atmospheric overlays
- Applied immersive visuals across auth, first-choice, explore, itineraries, itinerary detail, and profile screens to align with sanctuary product direction

## 2026-02-11 - Interval 21
- Replaced city `datalist` inputs with a true suggestion dropdown component to deliver Google-like city search behavior
- Switched `/start` flow pages to a lighter/whiter visual tone and updated cards/forms for better readability on bright overlays
- Fixed itinerary background rendering resilience by using a new image source and hiding failed background images without showing alt text
