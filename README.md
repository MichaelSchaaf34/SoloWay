# SoloWay

**Travel Solo, Not Alone.** — The intelligent travel companion for solo explorers.

![SoloWay](https://via.placeholder.com/800x400/1e293b/ffffff?text=SoloWay)

## ✨ About SoloWay

**SoloWay** is more than a travel app—it's your gateway to living life to the fullest, wherever you land.

You land in a new city for the weekend. No rigid plans, no tour groups—just you and endless possibilities. Open SoloWay and instantly discover:
- That underground jazz bar locals rave about
- A food market happening tonight with the best street tacos in town
- A sunset hike meetup with other solo travelers
- A cozy bookshop cafe perfect for your Saturday morning

**SoloWay makes spontaneous exploration feel safe, exciting, and effortless.**

### The Experience

We believe solo travel shouldn't mean missing out on life's best moments. Whether you're a digital nomad hopping between cities, taking a last-minute weekend getaway, or finally doing that trip you've been dreaming about—SoloWay helps you:

- **Discover what's happening right now**: Real-time events, pop-ups, experiences, and hidden gems tailored to your vibe
- **Feel safe while staying spontaneous**: Share your plans via QR buddy system, set check-in reminders, and explore with confidence
- **Connect on your terms**: Find solo-friendly events and meetups—no forced group tours, just authentic experiences
- **Live in the moment**: Skip the hours of research. Just open the app and start experiencing

**SoloWay is designed for people who want to enjoy life**—those who believe the best stories come from saying "yes" to the unknown, with just enough safety and smart recommendations to make every adventure memorable.

From that perfect rooftop bar at golden hour to the local cooking class that becomes the highlight of your trip, SoloWay turns "I'm here alone" into "I'm here and ready for anything."

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/soloway.git
cd soloway

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:3000`

---

## 📁 Project Structure

```
soloway/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable components
│   │   ├── ui/             # Base UI components (Badge, FeatureCard)
│   │   ├── Background.jsx  # Ambient gradient backgrounds
│   │   ├── Navbar.jsx      # Navigation bar
│   │   ├── Hero.jsx        # Hero section with itinerary demo
│   │   ├── Features.jsx    # Features grid
│   │   ├── Safety.jsx      # Safety section
│   │   ├── CTA.jsx         # Call-to-action / waitlist
│   │   ├── Footer.jsx      # Footer
│   │   └── index.js        # Component exports
│   ├── pages/              # Page components
│   │   └── Landing.jsx     # Main landing page
│   ├── hooks/              # Custom React hooks (empty for now)
│   ├── utils/              # Utility functions (empty for now)
│   ├── assets/             # Images, fonts, etc.
│   ├── App.jsx             # App with React Router
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles + Tailwind
├── index.html              # HTML template
├── package.json
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
├── postcss.config.js       # PostCSS configuration
└── README.md
```

---

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

---

## 🔗 Connecting to GitHub

### First Time Setup

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: SoloWay frontend skeleton"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/soloway.git
git branch -M main
git push -u origin main
```

### Using with Claude Code

1. Install Claude Code: `npm install -g @anthropic-ai/claude-code`
2. Navigate to your project: `cd soloway`
3. Run: `claude`
4. Start building!

### Using with Cursor

1. Open Cursor
2. File → Open Folder → Select `soloway`
3. Use Cmd+K (Mac) or Ctrl+K (Windows) to chat with AI
4. Reference files with `@filename` in your prompts

---

## 🗺️ Roadmap

### Phase 1: Frontend (Current)
- [x] Landing page
- [ ] User authentication UI
- [ ] Explore/search page
- [ ] Itinerary builder UI
- [ ] Profile page

### Phase 2: Backend
- [ ] API setup (Node.js/Express or similar)
- [ ] Database (PostgreSQL or MongoDB)
- [ ] User authentication (OAuth, email)
- [ ] Experience/event APIs integration

### Phase 3: Core Features
- [ ] Smart itinerary generation
- [ ] Safety features & check-ins
- [ ] QR buddy system
- [ ] Location-aware recommendations

### Phase 4: Monetization
- [ ] Premium tier
- [ ] Venue partnerships/commissions
- [ ] Featured experiences

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Backend**: TBD (Express, Fastify, or serverless)
- **Database**: TBD (PostgreSQL, MongoDB)
- **Auth**: TBD (Auth0, Clerk, or custom)

---

## 📝 License

MIT © 2025 SoloWay

---

## 🤝 Contributing

This is currently a private project. Contact the maintainer for access.
