# Change Log

> **Note:** The canonical log lives at the project root: `SoloWay/log.md` (not `.claude/worktrees/.../log.md`).

## Quick index by month

| Month | Intervals | Highlights |
|-------|-----------|------------|
| Feb 2026 | 1–21 | Redis/JWT, auth + itinerary foundation, immersive UX |
| Mar 2026 | 22–28 | Security hardening, booking flow, QR Buddy system |
| Apr 2026 | 29–30 | Deploy prep, design system, legal pages, SEO/PWA |
| Jun 2026 | 31–32 | Landing refresh (`Destinations`, `FieldNotes`), design-preview mockups |
| Jul 2026 | 33–45 | Stripe commerce, public destinations, reviews, admin portal |

---

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
- Added QR Buddy vertical slice end-to-end: backend `buddy` module with `003_buddy_links.sql` (invites tied to itinerary items, guest SMS verification, active links, connection requests), mounted at `/api/v1/buddy`
- Frontend buddy UI: `InviteBuddyModal` + `QRDisplay` on itinerary item detail, public no-auth `/join/:token` guest flow (`GuestJoin.jsx`), protected `/buddy/history` with filters and connection actions, `buddyService.js` + `guestService.js`, and navbar Buddies link; implementation spec in `buddy-frontend-v2.md`

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

## 2026-06-09 - Interval 31 (landing refresh + design exploration)
- Reworked landing page sections: new `Destinations` atlas grid, `FieldNotes` solo-travel tips carousel (category badges for logistics/social/money/safety/mindset/packing), refreshed Hero/CTA/Safety/Footer, and removed the old static Features block in favor of destination-led discovery
- Added self-contained `design-previews/` HTML mockups (Cinematic Editorial, Bento Glass, Bold Wayfinder) with Playwright screenshot tooling for side-by-side visual direction review before committing to production styling
- Served design previews through Vite at `/design-previews/`; added `vercel.json` SPA fallback for production routing

## 2026-06-10 - Interval 32 (Dune + Porcelain theme mockups)
- Added two lead light-theme directions as interactive HTML previews: **Dune** (warm beige glass, Fraunces serif, terracotta accent) and **Porcelain** (ivory minimal, monochrome ink)
- Mockups include modern travel-app patterns: destination search pill, boarding-pass itinerary card, safety score ring, QR buddy tile, and avatar nav — wired to real per-page Unsplash photos via Immersive Aqua follow-up
- Added CSS photo color grading overlays (warm sepia/terracotta for Dune, ivory desaturation for Porcelain) with `?grade=off` escape hatch and `compare.html` for original-vs-graded previews

## 2026-07-11 - Interval 33 (auth + Stripe Connect MVP)
- Repaired auth session lifecycle with single-flight access-token refresh/retry, refresh-token replay detection, expired-access logout support, global session revocation on logout, required separate refresh secrets, and Redis-backed distributed rate limiting that fails closed in production
- Added database-backed one-time email verification and password-reset tokens, Resend transactional email delivery, verification/reset/change-password UI, and email verification gating before token issuance
- Added frontend and backend auth tests for refresh concurrency, failed refresh, protected routes, registration verification, login gating, token replay, one-time email tokens, and logout
- Added normalized commerce schema for providers, experiences, orders, line items, payments, refunds, and idempotent webhook events with money/currency, commission, provider, cancellation cutoff, and timezone snapshots
- Implemented Stripe Connect Express onboarding, server-authoritative experience catalog, single-provider Stripe Checkout destination charges, application fees, signed raw-body webhooks, stale-event recovery, idempotent fulfillment, amount reconciliation, refunds, and dispute state handling
- Replaced the demo card form with Stripe-hosted payment collection and a webhook-confirmed booking return page; paid orders now create linked itinerary items only after verified payment
- Added protected `/provider/onboarding` page for Stripe Connect Express onboarding and post-connect experience creation (`ProviderOnboarding.jsx`, `providerService.js`)
- Added security tests for altered client totals, mixed providers, unavailable inventory, duplicate checkout/webhook/fulfillment events, mismatched Stripe amounts, refunds, and disputes
- Updated deployment/environment documentation, removed an unused vulnerable UUID dependency, upgraded Vite/Vitest security dependencies, and reached zero npm audit findings for frontend and backend
- Validation: frontend 9/9 tests passed; backend 36/36 tests passed; frontend production build passed; all backend JavaScript passed `node --check`; dedicated security re-review found no remaining medium-or-higher issues

## 2026-07-11 - Interval 34 (local registration connectivity)
- Fixed account-creation `Failed to fetch`: rebuilt an unreadable OneDrive-cached backend dependency, limited the separate refresh-secret startup requirement to production, and started the local API on port 3001
- Applied pending `004_auth_email_tokens.sql` and `005_commerce.sql` migrations successfully
- Updated root `npm run dev` to launch both Vite and the backend together so local auth no longer silently runs without an API
- Validation: `/health` returned 200 and `POST /api/v1/auth/register` returned the expected structured validation response with localhost CORS enabled

## 2026-07-11 - Interval 35 (transactional auth email)
- Confirmed successful registration was generating a development verification preview; real delivery was blocked only by missing Resend credentials
- Upgraded verification and password-reset emails with a branded, responsive SoloWay template, clear CTA, copyable fallback URL, expiry/security guidance, and plain-text alternative
- Added an ignored local `backend/.env` scaffold for `RESEND_API_KEY`, sandbox sender, and local app URL without committing credentials
- Improved frontend API errors to display specific validation details instead of the generic `Validation failed` message
- Added transactional email tests; validation now passes with frontend 9/9 tests, backend 38/38 tests, and a clean production build

## 2026-07-11 - Interval 36 (live homepage experiences)
- Connected the public homepage to the existing `GET /api/v1/experiences` provider inventory and added responsive live-experience cards with provider, location, time, duration, and server-authoritative pricing
- Added deterministic local-day rotation for both the destination atlas order and the featured destination, including an automatic midnight refresh while the page remains open
- Kept homepage discovery aligned with in-app checkout by using only active SoloWay provider experiences; added loading, unavailable, and API-error states for empty inventory
- Added destination-rotation unit coverage; frontend validation passes with 12/12 tests, a clean lint check on touched files, and a successful production build

## 2026-07-11 - Interval 37 (public destination discovery)
- Replaced destination-card authentication redirects with public `/destinations/:destinationSlug` pages for all six homepage cities
- Added editorial destination overviews, trip-cost/season context, activity ideas, and public live provider inventory with loading, empty, error, and unsupported-slug states
- Deferred authentication until booking intent: selected destination and experience are retained in trip state, and sign-in now safely returns users to their intended in-app path
- Updated cross-page navigation hashes to return to homepage sections correctly
- Added public browsing and booking-intent tests; frontend validation passes with 15/15 tests, a clean lint check on touched files, and a successful production build

## 2026-07-11 - Interval 38 (destination card photography)
- Replaced the homepage destination cards' abstract gradient headers with location-specific Unsplash photography for Medellín, Lisbon, Kyoto, Cape Town, Barcelona, and Reykjavík
- Added accessible alt text, lazy loading, responsive center cropping, dark readability overlays, and a subtle hover zoom while retaining gradients as image-loading fallbacks
- Verified all image URLs return JPEG content; the destination component has no lint errors and the production build passes

## 2026-07-11 - Interval 39 (destination theme controls)
- Made the shared navigation visibly theme-aware before scrolling, with distinct light/dark glass surfaces, text, account controls, and theme-button treatments
- Added dynamic theme-control labels and stronger light/dark overlays to public destination heroes so switching modes is immediately visible on pages such as Reykjavík
- Added navigation theme-toggle coverage; frontend validation passes with 16/16 tests, a clean lint check on touched files, and a successful production build

## 2026-07-11 - Interval 40 (destination page nature scenes)
- Added per-destination animated nature scenes to public destination pages via a new `DestinationScene` component: aurora + twinkling stars (Reykjavík), falling cherry blossoms + mist (Kyoto), golden sun glow (Lisbon, Barcelona), drifting sea mist + ocean shimmer (Cape Town), and fireflies + canopy glow (Medellín)
- Replaced the flat gradient hero on destination detail pages with the full-bleed destination photo, layered scene animation, and a scene caption badge (e.g. "Aurora over the harbor")
- Redesigned the "A good day in ..." section as glassmorphism Morning/Afternoon/Evening cards over a blurred nature backdrop of the destination photo
- All scene animations are pure CSS, respect `prefers-reduced-motion`, and add no extra network requests; production build passes with zero errors

## 2026-07-12 - Interval 41 (homepage atlas scene animations)
- Extended the animated nature scenes to the homepage atlas grid: each destination card header now plays its destination's ambient scene (aurora, petals, sun glow, sea mist, fireflies) over the photo
- Added a `compact` variant to `DestinationScene` with lighter blurs and a card-sized petal fall so effects stay crisp at the small header height
- Compact scenes reuse the same pure-CSS keyframes and reduced-motion handling; production build passes with zero errors

## 2026-07-13 - Interval 42 (Eastern-midnight destination rotation)
- Anchored the homepage destination rotation to midnight US Eastern (America/New_York) instead of each visitor's local midnight, so the featured order flips at the same instant worldwide
- Rotation day number and next-flip countdown are computed via `Intl.DateTimeFormat` in the Eastern zone, with a correction pass for the 23-hour spring-forward DST day; open tabs still re-render at the flip via the existing Landing timer
- Renamed rotation helpers (`getRotationDayNumber`, `millisecondsUntilNextRotation`) and rewrote tests with timezone-independent UTC fixtures including a DST case; 5/5 rotation tests pass and the production build passes with zero errors

## 2026-07-13 - Interval 43 (destination fallback content + live events)
- Destination pages never look empty: when no live provider inventory exists, `DestinationDetail` now shows curated solo-friendly picks from `activityCatalog` grouped by the free time a work/solo traveler has (Free morning / Free afternoon / Evening after work), each with a solo-fit badge and a one-line reason it works alone; `Explore` and the homepage `FeaturedExperiences` got matching preview fallbacks
- Extended `activityCatalog.js` with `soloTag`/`soloNote` for all six homepage destinations and added a `suggestedExperiences.js` adapter (category + time-slot mapping, category defaults); suggestions are preview-only and cannot reach checkout (no `providerId`)
- Added a public `GET /api/v1/events?destination=` backend module (events.routes/controller/service/schemas) proxying the Ticketmaster Discovery API with solo-friendly classification filtering, name-deduping, and Redis caching (6h hits / 30m empties); optional `TICKETMASTER_API_KEY` — absent key returns `[]` and the frontend hides the "Happening in {city}" section entirely
- Events are informational with plain external links (no affiliate params, no commission) per the commission-only revenue rule; Viator Partner API Merchant tier documented as the roadmap for real bookable third-party inventory
- Created the previously missing `backend/src/shared/database/seed.js` (`npm run db:seed`): demo provider + 18 active experiences across the six destinations, idempotent, refuses to run in production
- Validation: 6 new adapter tests and 7 new events-service tests; frontend 24/24 and backend 45/45 tests pass, `node --check` clean on new backend files, production build zero errors

## Roadmap note - Viator Partner API (Merchant tier) — deferred, not started
- Path to real bookable third-party inventory that fits the commission-only model: SoloWay would be merchant of record, checkout stays in-app, margin comes from marking up Viator's invoiced rates
- Process when ready: (1) register SoloWay as a business entity with a business bank account, (2) create a Viator Partner Program account and apply for Merchant API (Viator qualifies all applicants; pre-launch apps typically start with free instant Basic Access to the Affiliate API for content/availability data), (3) pay a sales-volume-based security deposit before live bookings, (4) build against Partner API v2 (product content, availability, bookings/hold, bookings/book, mandatory automated cancellation workflow), (5) pass Viator's back-end and front-end certification before launch
- Obligations to plan for: PCI compliance, chargeback risk, and a customer-support channel (merchant of record handles all support/cancellations/refunds)
- Decision 2026-07-13: not pursuing now; revisit once live users are booking through SoloWay's own providers

## 2026-07-13 - Interval 44 (community reviews)
- Added a community reviews vertical slice: `006_reviews.sql` migration (one review per user per destination, rating 1-5, optional headline, travel-style tag, cascade on user delete), and a `backend/src/modules/reviews/` module following the standard pattern
- API: public `GET /api/v1/reviews?destination=&limit=` (returns reviews with reviewer display names plus count/average stats when filtered), authenticated `POST /api/v1/reviews` (409 on duplicate per destination), authenticated `DELETE /api/v1/reviews/:reviewId` (owner-only)
- New public `/reviews` page: destination filter chips, aggregate star rating, solo-framed review cards with trip-type badges (Solo trip / Work trip / First solo trip), a sticky write-a-review form for signed-in users (star picker, destination select, headline, body), sign-in CTA for guests, and owner delete
- Added "Reviews" to the top navigation (desktop + mobile) between Destinations and Safety; nav now renders router links for page routes and anchors for landing-section hashes
- Validation: 7 new reviews-service tests with a chainable Supabase stub; backend 52/52 tests pass, `node --check` clean, production build zero errors — run `npm run db:migrate` (backend) to apply the new table

## 2026-07-13 - Interval 45 (admin portal)
- Added `007_admin.sql` migration: `is_admin` flag on `users` (no API grants it — flip manually in the database) plus an `admin_audit_log` table recording every mutating admin action
- Added `requireAdmin` middleware in `shared/middleware/auth.js` (runs after `authenticate`, which now also selects `is_admin`); login and `getUserById` responses now include `isAdmin` so the frontend can gate routes
- New `backend/src/modules/admin/` module mounted at `/api/v1/admin` (all routes behind authenticate + requireAdmin): dashboard stats, user list/detail/delete (self-delete blocked), waitlist list, provider list, experience list + activate/deactivate, order list/detail + full refund, review list/delete, audit log list
- Refactored `payments.service.js` refund flow into a shared `executeFullRefund` helper; new `refundOrderAsAdmin` skips ownership and cancellation-window checks while reusing the same Stripe + refunds-table logic
- Frontend: `AdminRoute` guard (redirects non-admins to `/`), `adminService.js` API client, and an `/admin` portal (sidebar layout with nested routes) with Dashboard, Users (search, detail panel, delete), Waitlist (CSV export), Providers & Experiences (activate/deactivate), Orders (status filter, detail panel, refund), and Reviews (moderate/delete) pages — intentionally a functional dark dashboard rather than the immersive traveler UI
- Validation: backend 52/52 tests pass (refund refactor covered by existing payments tests), `node --check` clean on all touched backend files, production build zero errors — run `npm run db:migrate` then `UPDATE users SET is_admin = true WHERE email = '<your email>';` to get access

---

## Current state (as of 2026-07-13)

### Shipped and wired
- **Public discovery:** landing atlas with Eastern-midnight rotation, live provider experiences, destination detail pages with nature scenes + fallback activity catalog, Ticketmaster events (informational external links), and community reviews
- **Auth & accounts:** JWT access/refresh with rotation, email verification, password reset, Resend transactional email, protected routes, profile
- **Booking & commerce:** server-authoritative experience catalog, Stripe Connect checkout, webhook-confirmed fulfillment, booking return page, provider onboarding, admin portal for users/orders/catalog/reviews
- **Trips:** itinerary CRUD, dual-path AI/manual booking flow, TripContext cart, destination catalog selectors
- **QR Buddy:** full backend + frontend (invite modal, guest join, history, connection requests) — SMS verification requires provider credentials in production
- **Ops:** waitlist API, DB seed script, deployment docs (`DEPLOY.md`, `render.yaml`), PWA/SEO assets, legal pages

### Known gaps / not yet consumed
- Safety Guardian and Social Radar backend APIs exist but have no frontend wiring yet
- WebSocket/realtime backend exists but no frontend Socket.io client
- Public itinerary endpoints (`GET /itineraries/public`, `GET /itineraries/nearby`) unused
- Design-preview themes (Dune/Porcelain/Aqua) are exploratory HTML only — production app still uses the immersive light-glass traveler UI
- Viator Partner API merchant inventory deferred (see roadmap note above)

### Test coverage snapshot
- Frontend: 24/24 tests (`vitest run`)
- Backend: 52/52 tests (`vitest run`)
- Apply pending migrations before new features: `cd backend && npm run db:migrate` (includes `006_reviews.sql`, `007_admin.sql`)
