# SoloWay Mindmap Notes

This file explains how to read `soloway-mindmap.drawio` and what it currently captures.

## What this map includes

- Frontend structure: app entry, routing, all current page components, and shared UI components.
- Frontend state/services: `AuthContext`, `DarkModeContext`, `useAuth`, and `src/utils` API services.
- Backend API surface: every route currently defined in `backend/src/modules/*/*.routes.js`.
- Runtime flow: request middleware chain and controller/service/data progression.
- Integration gaps: explicit node for disconnected frontend/backend behavior.

## Node groups

- `Frontend App Layer`: `src/main.jsx`, `src/App.jsx`, and route pages.
- `Components`: all components exported from `src/components` and referenced by pages.
- `Context + Hooks`: authentication/session and theme flow.
- `Frontend Service Layer`: API wrappers that call backend endpoints.
- `Backend API`: endpoint inventory grouped by module (`auth`, `users`, `itineraries`, `safety`, `social`).
- `Backend Runtime Flow`: global middleware, per-route middleware, controller, service, infra.
- `Integration Gap Node`: active mismatches between layers.

## Key interconnections shown

- `Auth` page -> `useAuth` -> `AuthContext` -> `authService` -> `/auth/*`.
- `Itineraries` and `ItineraryDetail` pages -> `itineraryService` -> `/itineraries*`.
- `Profile` page -> `userService.getProfile` -> `GET /users/profile`.
- `CTA` component -> `waitlistService.joinWaitlist` -> gap node (missing backend route).
- Backend request path:
  `Express app` -> global middleware -> route middleware (`authenticate`, `optionalAuth`, `validate`, rate limiters) -> controller -> service -> data/infra.

## Endpoint inventory basis

The map is based on these route modules:

- `backend/src/modules/auth/auth.routes.js`
- `backend/src/modules/users/users.routes.js`
- `backend/src/modules/itineraries/itineraries.routes.js`
- `backend/src/modules/safety/safety.routes.js`
- `backend/src/modules/social/social.routes.js`

Plus app mounting in:

- `backend/src/index.js`

## Known architecture gaps and observations

- Frontend calls `POST /waitlist` via `src/utils/waitlistService.js`, but no `/waitlist` backend route is mounted.
- Backend has extensive `safety` and `social` APIs; current frontend service layer does not yet consume them.
- Backend websocket/realtime exists, but no frontend websocket client wiring is currently represented.
- Public itinerary and nearby endpoints exist (`GET /itineraries/public`, `GET /itineraries/nearby`) but are not currently used by the frontend services/pages.

## Suggested next diagram iterations

- Add a second page in draw.io for database table relationships (`users`, `itineraries`, `itinerary_items`, `checkins`, `connections`, `messages`).
- Add sequence-focused mini-diagrams for:
  - login + refresh lifecycle,
  - create itinerary + add item lifecycle,
  - protected route redirect flow.
- Add planned nodes for upcoming high-intensity work (Safety Guardian UI, Social Radar UI, waitlist backend route).
