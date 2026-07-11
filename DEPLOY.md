# Deploying SoloWay (Vercel + hosted API)

Use this when you want a **public HTTPS URL** (phone on any network, no laptop required).

## 1. Deploy the API (Render example)

1. Push this repo to GitHub (if it is not already).
2. In [Render](https://render.com): **New → Blueprint** and connect the repo, *or* **New → Web Service** and point at the repo with:
   - **Root directory:** `backend`
   - **Build command:** `npm install`
   - **Start command:** `npm start`
   - **Health check path:** `/health`
3. Set **environment** to production by adding:
   - `NODE_ENV` = `production`
4. Copy every variable from your local `backend/.env` into Render **Environment** (same names as in `backend/src/config/index.js`):
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL`
   - `REDIS_URL` (required; use a managed Redis service such as Upstash)
   - `JWT_SECRET`, `JWT_REFRESH_SECRET` (different random values), and optionally `JWT_ISSUER`, `JWT_ACCESS_AUDIENCE`, `JWT_REFRESH_AUDIENCE`
   - `APP_BASE_URL` = your exact Vercel URL
   - `RESEND_API_KEY`, `EMAIL_FROM` (verify your sending domain before public launch)
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CONNECT_COUNTRY`, `STRIPE_DEFAULT_COMMISSION_BPS`
5. **CORS:** set `CORS_ORIGIN` to your **exact** Vercel URL once it exists, e.g. `https://soloway.vercel.app` (no trailing slash). To allow local dev too:  
   `https://soloway.vercel.app,http://localhost:3000`
6. After the first deploy, note the service URL, e.g. `https://soloway-api.onrender.com`.

**Migrations:** from your machine (with `DATABASE_URL` set to the same Supabase DB), run:

```bash
cd backend && npm run db:migrate
```

(Optional: `npm run db:seed`.)

### Stripe Connect and webhooks

1. Enable Stripe Connect in the Stripe Dashboard and keep the platform in test mode.
2. Add an HTTPS webhook endpoint:
   `https://YOUR-API-HOST/api/v1/webhooks/stripe`
3. Subscribe to:
   - `account.updated`
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
   - `checkout.session.expired`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `charge.dispute.created`
   - `refund.updated`
   - `refund.failed`
4. Copy that endpoint's signing secret into `STRIPE_WEBHOOK_SECRET`.
5. For local testing:

```bash
stripe listen --forward-to localhost:3001/api/v1/webhooks/stripe
```

Use Stripe test cards only. Never put secret or webhook keys in Vercel frontend variables.

### Auth email test

With Resend's sandbox sender (`onboarding@resend.dev`), register using the email
address associated with your Resend account. Verify registration, password reset,
one-time token reuse rejection, and logout before configuring a production sender.

### Optional: Render Blueprint

If you use **Infrastructure as Code**, `render.yaml` in the repo root defines a `web` service for the backend. You still add **secret** env vars in the Render dashboard (or linked secret store).

---

## 2. Deploy the frontend (Vercel)

1. In [Vercel](https://vercel.com): **Add New → Project** → import the same GitHub repo.
2. Framework preset: **Vite** (or leave auto-detect). Output: `dist`. Root: repository root (not `backend`).
3. **Environment variables** (Production — and Preview if you use previews):
   - `VITE_API_URL` = `https://YOUR-API-HOST/api/v1`  
     Example: `https://soloway-api.onrender.com/api/v1`  
     No trailing slash after `v1`.
4. Deploy. SPA routing is covered by `vercel.json` rewrites.

---

## 3. Verify

- Open `https://YOUR-VERCEL-URL/health` — should **not** be the Vercel app (that is the frontend). API health is on the **Render** URL: `https://YOUR-API-HOST/health`.
- Open the Vercel site on your phone: sign in and run through one main flow.
- Confirm a provider can finish Stripe Express onboarding, publish one experience,
  complete a test booking, receive a webhook-confirmed itinerary, and issue a refund.

---

## 4. Free-tier notes

- Render free web services **spin down** after idle; first request after sleep can take ~30–60s.
- For a smooth demo, hit `/health` once before showing friends, or use a paid instance / different host.

---

## Alternatives

- **Railway / Fly.io:** same idea: Node service, `PORT` from host, `npm start` in `backend/`, same env vars and `CORS_ORIGIN`.
