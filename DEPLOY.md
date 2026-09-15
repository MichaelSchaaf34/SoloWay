# SoloWay Launch Checklist

Ordered, end-to-end path from this repo to a production launch on a custom
domain. Steps marked **[You]** need your accounts/decisions (dashboard clicks,
purchases). Steps marked **[Repo]** are already wired into the codebase.

Architecture at launch:

- Frontend SPA → **Vercel** (or Cloudflare Pages, see 5)
- API (Express) → **Render** web service
- Postgres + PostGIS → **Supabase**
- Redis → **Upstash**
- Email → **Resend** · SMS → **Twilio** · Payments → **Stripe**
- Error monitoring → **Sentry** · DB backups → **AWS S3** ([BACKUPS.md](BACKUPS.md))

Estimated running cost: **~$35–55/month** (Render $7, Supabase Pro $25,
Vercel $0–20, Twilio ~$1.15 + $0.008/SMS, domain ~$15/year; Upstash, Resend,
Sentry, and S3 are free or pennies at launch scale).

---

## 0. Already handled in the repo [Repo]

- CI (lint + test + build) on every PR/push to `main`: `.github/workflows/ci.yml`
- Production builds **fail** if `VITE_API_URL` is missing (vite.config.js) and a
  misbuilt bundle refuses to boot (src/utils/env.js) — no silent localhost calls
- `/health` verifies Postgres and Redis, not just the process
- Structured JSON logging (pino), graceful shutdown, crash handlers
- Buddy SMS via Twilio (dev falls back to console codes)
- Sentry on both tiers, enabled only when a DSN is configured
- Nightly DB backup workflow (needs secrets — see 9)
- AI itinerary routes gated off until the feature is real

## 1. Domain [You]

1. Buy the domain. The repo's SEO metadata assumes **soloway.io** — check
   availability at Cloudflare Registrar or Porkbun (at-cost pricing). `.app`
   domains force HTTPS everywhere, which Vercel/Render provide automatically.
2. Decide the layout (recommended):
   - `soloway.io` + `www.soloway.io` → frontend
   - `api.soloway.io` → backend API
3. **If you buy a different domain**, replace `soloway.io` in:
   [index.html](index.html) (canonical, og:url, og:image, JSON-LD),
   [public/robots.txt](public/robots.txt) (Sitemap line),
   [public/sitemap.xml](public/sitemap.xml) (all `<loc>` entries).
   Search the repo for `soloway.io` to catch them all.

## 2. Supabase (database) [You]

1. Create a production Supabase project (separate from any dev project).
   **Pro plan ($25/mo)** — the free tier pauses after a week of inactivity and
   has no daily backups; both are disqualifying for production.
2. Collect from Project Settings:
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL` — use the **session pooler / direct** string (port 5432)
   - SSL certificate (Settings → Database → SSL) → this becomes
     `DATABASE_CA_CERT` (paste PEM with `\n`-escaped newlines, or base64)
3. Run migrations from your machine against the production DB:

```bash
cd backend
# PowerShell: $env:DATABASE_URL='postgresql://...'   bash: export DATABASE_URL=...
npm run db:migrate
```

Do **not** run `npm run db:seed` in production (it refuses anyway).

## 3. Upstash (Redis) [You]

1. Create a database at [upstash.com](https://upstash.com) (free tier is fine),
   same region as Render (e.g. US East).
2. Copy the **TLS connection string** (`rediss://...`) → `REDIS_URL`.
   The API refuses to boot in production without Redis.

## 4. Render (API) [You]

1. **New → Blueprint** pointing at the GitHub repo (uses `render.yaml`), or
   **New → Web Service** with: root directory `backend`, build `npm install`,
   start `npm start`, health check path `/health`.
2. Instance: **Starter ($7/mo)**. The free tier spins down when idle — a
   30–60s cold start on someone's first visit is not launch-quality.
3. Environment variables — every name below (see [backend/.env.example](backend/.env.example)):
   - `NODE_ENV=production`
   - `APP_BASE_URL=https://soloway.io` (exact frontend origin)
   - `CORS_ORIGIN=https://soloway.io,https://www.soloway.io` (no trailing slashes)
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL`, `DATABASE_CA_CERT`
   - `REDIS_URL`
   - `JWT_SECRET`, `JWT_REFRESH_SECRET` — two *different* long random values
     (`openssl rand -hex 48` or PowerShell:
     `-join ((1..96) | ForEach-Object { '{0:x}' -f (Get-Random -Max 16) })`)
   - `RESEND_API_KEY`, `EMAIL_FROM` (step 6)
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CONNECT_COUNTRY`,
     `STRIPE_DEFAULT_COMMISSION_BPS` (step 7)
   - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` (step 8)
   - `SENTRY_DSN` (step 10), optional `LOG_LEVEL`, optional `TICKETMASTER_API_KEY`
4. Custom domain: add `api.soloway.io` in Render → copy the CNAME record into
   your DNS. Render issues the TLS certificate automatically.
5. Verify: `https://api.soloway.io/health` returns
   `{"status":"healthy", ... "checks":{"database":"ok","redis":"ok"}}`.

## 5. Vercel (frontend) [You]

> Licensing note: Vercel's **Hobby tier prohibits commercial use**, and SoloWay
> takes booking commissions. Use **Vercel Pro ($20/mo)** — or Cloudflare Pages,
> which is free for commercial projects (build command `npm run build`, output
> `dist`, SPA fallback enabled; `vercel.json` is Vercel-only).

1. **Add New → Project** → import the repo. Framework preset: Vite. Root:
   repository root (not `backend`). SPA rewrites come from `vercel.json`.
2. Environment variables (Production + Preview):
   - `VITE_API_URL=https://api.soloway.io/api/v1` (no trailing slash —
     builds fail without this, by design)
   - `VITE_SENTRY_DSN` (step 10, optional)
3. Domains: add `soloway.io` and `www.soloway.io`, follow Vercel's DNS
   instructions at your registrar (A/ALIAS for apex, CNAME for www).
4. Verify: site loads on the domain; register/login round-trips (proves CORS
   and API URL are right).

## 6. Resend (email) [You]

1. In [Resend](https://resend.com): **Domains → Add Domain** (`soloway.io`)
   and add the SPF/DKIM DNS records it gives you. Wait for "Verified" —
   without this, verification and password-reset emails land in spam or fail.
2. Set `EMAIL_FROM` to a sender on that domain, e.g.
   `SoloWay <hello@soloway.io>`, and copy the API key → `RESEND_API_KEY`.
3. Verify: register a fresh account on production → the verification email
   arrives in a normal inbox (check spam scoring via mail-tester.com if unsure).

## 7. Stripe (payments) [You]

Stay in **test mode** until the full flow is verified, then repeat the webhook
setup with live keys.

1. Enable **Stripe Connect** (Express) in the dashboard.
2. **Developers → Webhooks → Add endpoint**:
   `https://api.soloway.io/api/v1/webhooks/stripe`, subscribed to:
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
3. Copy the endpoint's signing secret → `STRIPE_WEBHOOK_SECRET`; secret key →
   `STRIPE_SECRET_KEY`. Never put either in Vercel/frontend env.
4. Verify with test cards: provider completes Express onboarding → publishes an
   experience → a traveler books it → webhook confirms the order → refund works.
5. Local webhook testing, if needed:
   `stripe listen --forward-to localhost:3001/api/v1/webhooks/stripe`

## 8. Twilio (buddy SMS) [You]

1. Create a [Twilio](https://twilio.com) account, buy a local SMS-capable
   number (~$1.15/mo; US SMS ~$0.008 each).
2. Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`
   (E.164 format, e.g. `+15551234567`) on Render.
3. US traffic note: register the number for **A2P 10DLC** in the Twilio console
   (a few days' approval); unregistered traffic gets filtered by US carriers.
   Trial accounts can only text verified numbers — fine for your own testing.
4. Verify: create an itinerary item → Invite Buddy → scan the QR with a phone →
   enter your number → the code arrives → link activates.

## 9. AWS backups [You]

Follow [BACKUPS.md](BACKUPS.md): create the S3 bucket + put-only IAM user
(~15 min of CLI commands provided there), add the five GitHub secrets, then
run the **Nightly database backup** workflow once manually and confirm the
`.dump` object lands in the bucket.

## 10. Sentry (error monitoring) [You]

1. Create a free [Sentry](https://sentry.io) org with two projects: one
   **React**, one **Node.js/Express**.
2. Set `VITE_SENTRY_DSN` (Vercel) and `SENTRY_DSN` (Render). Redeploy both.
3. Verify: temporarily visit a page that throws (or trigger a 500) and see the
   event in Sentry.

## 11. Final verification pass [You]

On the production domain, end to end:

- [ ] Register → verification email arrives → verify → login → logout → login
- [ ] Password reset round-trip
- [ ] Create itinerary → add items → edit → delete
- [ ] Explore a destination → add to cart → Stripe test checkout → order
      confirmed via webhook → refund from admin
- [ ] Invite Buddy → QR scan from a phone (cell network, not your Wi-Fi) →
      SMS code → guest joins → buddy history shows the link
- [ ] Waitlist signup from the landing page → appears in `/admin/waitlist`
- [ ] `/admin` reachable only for an admin user
      (`UPDATE users SET is_admin = true WHERE email = '...';`)
- [ ] `https://api.soloway.io/health` green; Sentry shows no unexpected errors
- [ ] Lighthouse pass on `/` (mobile) for a performance/SEO baseline

## 12. Post-launch [You]

- Uptime monitoring: [UptimeRobot](https://uptimerobot.com) or BetterStack
  free tier pinging `https://api.soloway.io/health` + the frontend URL.
- Watch Sentry + Render logs during the first days.
- Backup restore drill within the first month ([BACKUPS.md](BACKUPS.md) runbook).
- When traffic justifies it, revisit [MIGRATION.md](MIGRATION.md) for the AWS path.

---

## Appendix: local development

Unchanged: `npm run dev` from the repo root starts Vite (3000) + API (3001)
via concurrently. `backend/.env` drives local config; SMS codes and emails
print to the API console when Twilio/Resend are unconfigured. For phone-on-LAN
testing see the notes in [.env.example](.env.example).
