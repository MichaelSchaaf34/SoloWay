# SoloWay Backend API

Scalable Node.js backend for the SoloWay solo travel companion app.

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Database**: PostgreSQL with PostGIS (via Supabase)
- **Cache**: Redis (via Upstash)
- **Real-time**: Socket.io + Supabase Realtime
- **Authentication**: JWT + Supabase Auth

## Architecture

```
backend/
├── src/
│   ├── config/           # Environment & service configs
│   ├── modules/          # Feature modules (modular monolith)
│   │   ├── auth/         # Authentication & authorization
│   │   ├── users/        # User profiles & trusted contacts
│   │   ├── itineraries/  # Trip planning
│   │   ├── safety/       # Safety Guardian check-ins
│   │   └── social/       # Social Radar connections
│   ├── shared/           # Shared utilities
│   │   ├── middleware/   # Auth, rate limiting, errors
│   │   ├── database/     # PostgreSQL connection pool
│   │   ├── cache/        # Redis wrapper
│   │   └── realtime/     # WebSocket handlers
│   └── index.js          # Entry point
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose (for local development)
- Supabase account (for production database)
- Upstash account (for production Redis)

### Local Development with Docker

1. Start the services:
   ```bash
   docker-compose up -d
   ```

2. The API will be available at `http://localhost:3001`

3. PostgreSQL is available at `localhost:5432`

4. Redis is available at `localhost:6379`

### Local Development without Docker

1. Copy environment file:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your database and Redis credentials

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run migrations:
   ```bash
   npm run db:migrate
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Get current user

### Users
- `GET /api/v1/users/profile` - Get profile
- `PATCH /api/v1/users/profile` - Update profile
- `PATCH /api/v1/users/location` - Update location
- `PATCH /api/v1/users/visibility` - Update visibility mode
- `GET /api/v1/users/contacts` - Get trusted contacts
- `POST /api/v1/users/contacts` - Add trusted contact

### Itineraries
- `POST /api/v1/itineraries` - Create itinerary
- `GET /api/v1/itineraries` - Get my itineraries
- `GET /api/v1/itineraries/:id` - Get itinerary with items
- `PATCH /api/v1/itineraries/:id` - Update itinerary
- `DELETE /api/v1/itineraries/:id` - Delete itinerary
- `GET /api/v1/itineraries/public` - Get public itineraries
- `GET /api/v1/itineraries/nearby` - Get nearby itineraries (PostGIS)

### Safety Guardian
- `POST /api/v1/safety/checkin` - Create check-in
- `POST /api/v1/safety/checkin/schedule` - Schedule check-in
- `GET /api/v1/safety/checkins` - Get check-in history
- `GET /api/v1/safety/score` - Get safety score for location
- `POST /api/v1/safety/emergency` - Trigger emergency alert
- `GET /api/v1/safety/status` - Get safety status

### Social Radar
- `GET /api/v1/social/nearby` - Get nearby travelers (PostGIS)
- `GET /api/v1/social/connections` - Get connections
- `POST /api/v1/social/connections` - Send connection request
- `GET /api/v1/social/messages/:userId` - Get conversation
- `POST /api/v1/social/messages/:userId` - Send message

## Deployment to Railway

### Option 1: Railway CLI

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login and link project:
   ```bash
   railway login
   railway link
   ```

3. Deploy:
   ```bash
   railway up
   ```

### Option 2: GitHub Integration

1. Push to GitHub
2. Connect repo in Railway dashboard
3. Set environment variables in Railway
4. Deploy automatically on push

### Required Environment Variables

Set these in Railway dashboard:

```
NODE_ENV=production
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=your-database-url
REDIS_URL=your-upstash-redis-url
JWT_SECRET=your-secure-secret
CORS_ORIGIN=https://your-frontend-domain.com
```

## Scalability Features

### Connection Pooling
- PostgreSQL pool configured with min/max connections
- Supabase PgBouncer for efficient connection management

### Caching
- Redis caching for frequently accessed data
- Cache invalidation on updates
- TTL-based expiration

### Rate Limiting
- Sliding window rate limiting with Redis
- Different limits for public vs authenticated routes
- Strict limits for sensitive endpoints (auth)

### Real-time
- Socket.io with Redis adapter for horizontal scaling
- Supabase Realtime for database change subscriptions
- Room-based messaging for efficient broadcasts

### Geospatial Queries
- PostGIS extension for location-based features
- Spatial indexes for fast nearby queries
- Optimized for Social Radar and Safety features

## Monitoring

- Health check endpoint: `GET /health`
- Request logging with Morgan
- Error tracking ready (add Sentry in production)

## License

MIT
