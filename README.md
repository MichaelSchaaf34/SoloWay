# SoloWay

**Travel Solo, Not Alone.** The intelligent travel companion for solo explorers.

Life is short. Go explore.

![SoloWay](https://via.placeholder.com/800x400/1e293b/ffffff?text=SoloWay)

## About SoloWay

SoloWay is more than a travel app — it's your gateway to living life to the fullest, wherever you land.

You arrive in a new city for the weekend. No rigid plans, no tour groups — just you and endless possibilities. Open SoloWay and instantly discover:

- The underground jazz bar locals rave about
- A food market happening tonight with the best street tacos in town
- A sunset hike meetup with other solo travelers
- A cozy bookshop cafe perfect for your Saturday morning

SoloWay makes spontaneous exploration feel safe, exciting, and effortless.

### The Experience

We believe solo travel shouldn't mean missing out on life's best moments. Whether you're a digital nomad hopping between cities, taking a last-minute weekend getaway, or finally doing that trip you've been dreaming about, SoloWay helps you:

- **Discover what's happening right now** — real-time events, pop-ups, experiences, and hidden gems tailored to your vibe
- **Feel safe while staying spontaneous** — share your plans via the QR buddy system, set check-in reminders, and explore with confidence
- **Connect on your terms** — find solo-friendly events and meetups, with no forced group tours, just authentic experiences
- **Live in the moment** — skip the hours of research; just open the app and start experiencing

SoloWay is designed for people who want to enjoy life — those who believe the best stories come from saying "yes" to the unknown, with just enough safety and smart recommendations to make every adventure memorable.

From that perfect rooftop bar at golden hour to the local cooking class that becomes the highlight of your trip, SoloWay turns "I'm here alone" into "I'm here and ready for anything."

## Where things stand

### Shipped

- [x] Landing experience: destination atlas, featured experiences, field notes, community reviews
- [x] Accounts: email/password auth with verification and password reset
- [x] Trips: itinerary builder with destination-aware planning
- [x] Bookings: commission-based in-app checkout with Stripe Connect providers
- [x] QR buddy system: invite someone you meet to an itinerary item, SMS-verified
- [x] Local events: what's happening tonight in your destination
- [x] Admin portal: users, orders, catalog, reviews, waitlist
- [x] Production readiness: CI, error monitoring, nightly off-site database backups

### Next

- [ ] AI itinerary generation (currently marked "Coming Soon" in-app)
- [ ] Safety Guardian in the app: check-ins and emergency alerts (API is live)
- [ ] Social Radar in the app: nearby solo travelers and messaging (API is live)
- [ ] Expanded bookable inventory via marketplace partners

---

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Lucide icons
- **Backend**: Node.js + Express modular monolith, Socket.io realtime
- **Data**: Supabase (PostgreSQL + PostGIS), Redis
- **Auth**: Custom JWT (access/refresh) — no third-party auth vendor
- **Payments**: Stripe Connect (commission-based bookings only)
- **Email / SMS**: Resend / Twilio

Operational docs: [DEPLOY.md](DEPLOY.md) (launch checklist), [BACKUPS.md](BACKUPS.md) (backup & restore), [MIGRATION.md](MIGRATION.md) (AWS migration strategy).

---

## License

MIT © 2026 SoloWay

---

## Contributing

This is currently a private project. Contact the maintainer for access.
