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

## 2026-03-07 - Interval 22
- Completed backend security hardening pass across auth/config/realtime modules with stricter JWT handling (access vs refresh token separation, issuer/audience/algorithm verification, shorter access token TTL, and refresh-token-specific secret)
- Enforced safer startup defaults in backend bootstrap (`validateConfig()` on startup, disabled `x-powered-by`, reduced request body limits, and strict non-test env variable checks)
- Added missing Joi validation for previously unvalidated route params/queries in auth/users/itineraries/social/safety endpoints
- Strengthened password and credential handling: stronger password policy (12+ with complexity), hashed password reset tokens in cache, revoked all active refresh tokens on logout/password reset/password change, and blocked no-op password changes
- Hardened WebSocket input handling and room joins with UUID/geohash validation plus payload sanitization for check-ins/emergency events
- Synced frontend auth UX/session behavior with backend rules (register password guidance and session-backed storage guards for browser-only access)
- Validation: `node --check` passed for modified backend `.js` files
- Validation blocked in sandbox: frontend `npm run build` and backend `npm test` hit `spawn EPERM` in this environment
- Dependency remediation status: attempted `react-router-dom@latest` update was not completed because the session ended pending install approval

## 2026-03-09 - Interval 23
- Polished landing-page shell layout by redesigning navbar spacing/alignment, tightening auth action wrapping, and smoothing mobile menu presentation
- Fixed hero/background continuity by increasing atmospheric background coverage to prevent lower hero card cutoff/white bleed
- Applied frontend visual consistency pass across hero/CTA/footer (matched button sizing, improved type rhythm, refined spacing, and added footer section navigation links)
- Validation: frontend `npm run build` passed locally after UI updates

## 2026-03-09 - Interval 24
- Replaced the harsh white hero-to-features transition with a softer slate tone for a cleaner, more professional visual blend
- Updated landing features section top spacing and background color to reduce the abrupt empty white block under the hero card

## 2026-03-09 - Interval 25
- Removed remaining bright white landing surfaces by shifting base page and section backgrounds to a consistent slate tone
- Increased hero atmospheric background coverage and deepened transition gradients to eliminate the white "unfinished blob" effect beneath the hero card

## 2026-03-09 - Interval 26
- Updated dark mode initialization so the app defaults to light mode for first-time visitors while still honoring any previously saved user preference

## 2026-03-10 - Interval 27
- Added two-path booking flow: AI-powered itinerary generation vs manual browse-and-book
- Created `TripContext` with shared state for destination, dates, path choice, vibe preferences, and booking cart
- Replaced `FirstChoice` page with a two-step flow: destination/date picker then AI vs Manual path fork
- Replaced `Explore` page with a browsable experience catalog featuring category filters and Book/Remove actions
- Added `AIPreferences` page for vibe selection (Chill/Adventure/Social/Cultural) with loading spinner
- Added `AIItinerary` page displaying AI-curated day-by-day itinerary with tap-to-add booking
- Added `BookingCart` page with item management, total calculation, and checkout placeholder
- Registered three new protected routes (`/ai-preferences`, `/ai-itinerary`, `/cart`) and wrapped app with `TripProvider`
- Validation: frontend `npm run build` passed with zero errors
- Fixed auth input visibility by adding `text-white placeholder-slate-400` to all Auth page form fields
- Added temporary dev auth bypass (`DEV_BYPASS_AUTH`) in ProtectedRoute to allow testing without backend
- Refined booking flow visual design: switched to light-tone frosted white glass cards (`bg-white/70 backdrop-blur-xl`) with dark text across all booking pages to match the existing light photo-background aesthetic
- Unified landing page background with booking flow: replaced dark slate/clouds background with the same travel photo and light overlay treatment used across booking pages for a consistent warm, airy feel site-wide

## 2026-03-12 - Interval 28
- Reorganized Itineraries list page so saved trips are the primary content shown first, with the "Create a new trip" form hidden behind a compact "+ New Trip" button
- Updated BookingCart checkout flow to create a real itinerary via the backend API after demo payment, including adding each booked experience as an itinerary item with correct title, time (12h to 24h conversion), and category mapping
- "View my itinerary" confirmation button now navigates directly to the specific created itinerary (falls back to list if API fails)
- Reordered ItineraryDetail page sections: Planned items first, Add item second, Trip settings last
- Reduced ItineraryDetail card sizes (smaller padding, tighter gaps, smaller text/inputs, `max-w-3xl` container) and used trip title as page heading instead of generic "Itinerary detail"
- Added delete buttons (trash icon) to itinerary cards on the Itineraries list page with backend `deleteItinerary` API integration
- Replaced `window.confirm` with inline card-swap confirmation UI showing "Delete [title]?" with Cancel/Delete buttons
- Made delete icon always visible with `text-rose-400` color for better discoverability
- Reduced create form and empty-state card sizes (smaller padding, inputs, headings, border radius)
- Added subtle hover effects (`hover:shadow-xl hover:bg-white/90 transition-all duration-200`) to create form and empty-state cards
- Simplified itineraries page to remove redundant "create trip" touchpoints: removed the "No trips yet" empty-state card, auto-show the create form when user has no trips with friendly "Plan your first adventure" heading, and hide the "+ New Trip" header button when the form is already auto-displayed

## 2026-04-01 - Interval 29
- Fixed `FirstChoice` destination UX: stopped clearing the search query when selecting a destination card so the filtered list no longer jumps back to the default top-five sample destinations (including on a second click while already selected)
- Mobile / friend-demo polish: enabled Vite `server.host: true` for LAN URLs; extended `index.html` with `viewport-fit=cover`, `theme-color`, Apple web-app meta, and `manifest.json` link; added `public/manifest.json` (`standalone` install surface); tuned `index.css` with `-webkit-tap-highlight-color: transparent` and `touch-action: manipulation`
- Documented phone-on-LAN API routing: root `.env.example` (`VITE_API_URL`); `backend/.env.example` note for `CORS_ORIGIN` when using a PC LAN IP as the frontend origin
- Production deploy path: added `DEPLOY.md` (Vercel frontend + hosted Node API, env vars, CORS, migrations, health checks, free-tier caveats); added `render.yaml` blueprint for the `backend/` web service
- Backend listen binding: `httpServer.listen` now uses host `0.0.0.0` so Render/Railway/Fly and local LAN access receive connections correctly
- Validation: frontend `npm run build` passed after the above frontend changes; `node --check backend/src/index.js` passed

## 2026-04-16 - Interval 30 (production-readiness pass, steps 1–3)
- Backend: added missing `POST /api/v1/waitlist` route (was referenced by landing CTA but returned 404) — new `backend/src/modules/waitlist/` module with Joi-validated body, idempotent insert, dedicated 5/10min rate limiter, and mounted in `backend/src/index.js`
- Repo cleanup: deleted `SoloWay_bundle.md`; extended `.gitignore` to exclude Windows `nul` artifacts, `*.drawio.bkp` editor backups, and entire `.claude/` / `.cursor/` tool-state directories
- SEO + social: rewrote `index.html` with Open Graph, Twitter Card, canonical URL, extended theme/PWA meta, JSON-LD `SoftwareApplication` schema, and a `<noscript>` fallback; added `public/robots.txt` (allows `/`, disallows authed routes, references sitemap) and `public/sitemap.xml` for `/`, `/privacy`, `/terms`
- Branded assets: generated `public/og-image.jpg` (1200×630, 104 KB, editorial dark-mode brand composition) and `public/apple-touch-icon.png` + `public/icon-32.png` + `public/icon-192.png` + `public/icon-512.png` (maskable-ready) via center-cropped gradient brand mark; rewrote `public/manifest.json` with full PWA metadata, scope, categories, and icon purposes including `maskable`
- Legal skeleton: added `/privacy` (`src/pages/Privacy.jsx`) and `/terms` (`src/pages/Terms.jsx`) pages plus shared `src/components/LegalPage.jsx` wrapper with accessible header, canonical back link, and `.legal-prose` typography in `src/index.css`; wired footer links to real routes and registered routes in `src/App.jsx`
- Design system: introduced `src/components/ui/` primitives — `Button` (6 variants, 3 sizes, loading/icon/disabled states, focus-visible ring), `Input`, `Select`, `FormField` (label/hint/error binding via `useId` + `aria-describedby`), `Card` (tones, padding, shadow, interactive), `EmptyState`, `LoadingSkeleton` (`Skeleton`, `SkeletonText`, `SkeletonCard`), `PageHeader`, `Alert` (4 tones); exported via `src/components/index.js` barrel
- Refactor `src/pages/Auth.jsx`: replaced dark opaque panel with consistent light glass card, used `FormField + Input + Button + Alert`, added segmented role=tablist mode switcher, autocomplete attributes, `aria-invalid` wiring, and inline Privacy/Terms disclosure linking to the new legal routes
- Refactor `src/pages/Itineraries.jsx`: replaced native `<select>`/`<input>` forms with design-system primitives, added proper `EmptyState` for zero-trips, `LoadingSkeleton` while fetching, structured status ring badges, and accessible per-card delete confirmation swap
- Refactor `src/pages/ItineraryDetail.jsx`: replaced `window.confirm` destructive delete with an accessible modal dialog (role=dialog, aria-modal, aria-labelledby, backdrop click-to-dismiss), rebuilt planned-items list with keyboard-reachable action buttons, collapsed trip settings behind an explicit toggle, and wrapped loading/not-found states in Skeleton + EmptyState primitives
- Validation: `ReadLints` clean on all touched files; `npm run build` passed (350.41 kB JS / 103.72 kB gzipped, 74.46 kB CSS / 12.57 kB gzipped); `node --check` clean on new backend module + `backend/src/index.js`

## 2026-07-11 - Interval 31 (auth + Stripe Connect MVP)
- Repaired auth session lifecycle with single-flight access-token refresh/retry, refresh-token replay detection, expired-access logout support, global session revocation on logout, required separate refresh secrets, and Redis-backed distributed rate limiting that fails closed in production
- Added database-backed one-time email verification and password-reset tokens, Resend transactional email delivery, verification/reset/change-password UI, and email verification gating before token issuance
- Added frontend and backend auth tests for refresh concurrency, failed refresh, protected routes, registration verification, login gating, token replay, one-time email tokens, and logout
- Added normalized commerce schema for providers, experiences, orders, line items, payments, refunds, and idempotent webhook events with money/currency, commission, provider, cancellation cutoff, and timezone snapshots
- Implemented Stripe Connect Express onboarding, server-authoritative experience catalog, single-provider Stripe Checkout destination charges, application fees, signed raw-body webhooks, stale-event recovery, idempotent fulfillment, amount reconciliation, refunds, and dispute state handling
- Replaced the demo card form with Stripe-hosted payment collection and a webhook-confirmed booking return page; paid orders now create linked itinerary items only after verified payment
- Added security tests for altered client totals, mixed providers, unavailable inventory, duplicate checkout/webhook/fulfillment events, mismatched Stripe amounts, refunds, and disputes
- Updated deployment/environment documentation, removed an unused vulnerable UUID dependency, upgraded Vite/Vitest security dependencies, and reached zero npm audit findings for frontend and backend
- Validation: frontend 9/9 tests passed; backend 36/36 tests passed; frontend production build passed; all backend JavaScript passed `node --check`; dedicated security re-review found no remaining medium-or-higher issues

## 2026-07-11 - Interval 32 (local registration connectivity)
- Fixed account-creation `Failed to fetch`: rebuilt an unreadable OneDrive-cached backend dependency, limited the separate refresh-secret startup requirement to production, and started the local API on port 3001
- Applied pending `004_auth_email_tokens.sql` and `005_commerce.sql` migrations successfully
- Updated root `npm run dev` to launch both Vite and the backend together so local auth no longer silently runs without an API
- Validation: `/health` returned 200 and `POST /api/v1/auth/register` returned the expected structured validation response with localhost CORS enabled

## 2026-07-11 - Interval 33 (transactional auth email)
- Confirmed successful registration was generating a development verification preview; real delivery was blocked only by missing Resend credentials
- Upgraded verification and password-reset emails with a branded, responsive SoloWay template, clear CTA, copyable fallback URL, expiry/security guidance, and plain-text alternative
- Added an ignored local `backend/.env` scaffold for `RESEND_API_KEY`, sandbox sender, and local app URL without committing credentials
- Improved frontend API errors to display specific validation details instead of the generic `Validation failed` message
- Added transactional email tests; validation now passes with frontend 9/9 tests, backend 38/38 tests, and a clean production build

## 2026-07-11 - Interval 34 (live homepage experiences)
- Connected the public homepage to the existing `GET /api/v1/experiences` provider inventory and added responsive live-experience cards with provider, location, time, duration, and server-authoritative pricing
- Added deterministic local-day rotation for both the destination atlas order and the featured destination, including an automatic midnight refresh while the page remains open
- Kept homepage discovery aligned with in-app checkout by using only active SoloWay provider experiences; added loading, unavailable, and API-error states for empty inventory
- Added destination-rotation unit coverage; frontend validation passes with 12/12 tests, a clean lint check on touched files, and a successful production build

## 2026-07-11 - Interval 35 (public destination discovery)
- Replaced destination-card authentication redirects with public `/destinations/:destinationSlug` pages for all six homepage cities
- Added editorial destination overviews, trip-cost/season context, activity ideas, and public live provider inventory with loading, empty, error, and unsupported-slug states
- Deferred authentication until booking intent: selected destination and experience are retained in trip state, and sign-in now safely returns users to their intended in-app path
- Updated cross-page navigation hashes to return to homepage sections correctly
- Added public browsing and booking-intent tests; frontend validation passes with 15/15 tests, a clean lint check on touched files, and a successful production build
