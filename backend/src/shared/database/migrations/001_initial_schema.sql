-- SoloWay Database Schema
-- Initial migration: Users, Itineraries, Safety, Social features

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT, -- NULL if using OAuth
  display_name TEXT,
  avatar_url TEXT,
  current_location GEOGRAPHY(POINT), -- PostGIS for geospatial queries
  visibility_mode TEXT DEFAULT 'visible' CHECK (visibility_mode IN ('visible', 'invisible', 'friends_only')),
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spatial index for location-based queries
CREATE INDEX IF NOT EXISTS idx_users_location ON users USING GIST(current_location);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_visibility ON users(visibility_mode);

-- ============================================
-- TRUSTED CONTACTS (for Safety Guardian)
-- ============================================
CREATE TABLE IF NOT EXISTS trusted_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contact_name TEXT NOT NULL,
  contact_phone TEXT,
  contact_email TEXT,
  notify_on_checkin BOOLEAN DEFAULT true,
  notify_on_emergency BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trusted_contacts_user ON trusted_contacts(user_id);

-- ============================================
-- ITINERARIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS itineraries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  destination_location GEOGRAPHY(POINT),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  mood TEXT DEFAULT 'balanced' CHECK (mood IN ('chill', 'adventure', 'balanced')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_itineraries_user ON itineraries(user_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_dates ON itineraries(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_itineraries_destination ON itineraries USING GIST(destination_location);
CREATE INDEX IF NOT EXISTS idx_itineraries_status ON itineraries(status);

-- ============================================
-- ITINERARY ITEMS (activities within an itinerary)
-- ============================================
CREATE TABLE IF NOT EXISTS itinerary_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  itinerary_id UUID NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location GEOGRAPHY(POINT),
  location_name TEXT,
  scheduled_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  category TEXT CHECK (category IN ('food', 'activity', 'transport', 'accommodation', 'relax', 'culture', 'nightlife', 'other')),
  is_flexible BOOLEAN DEFAULT false,
  external_id TEXT, -- For linked external events/places
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_itinerary_items_itinerary ON itinerary_items(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_items_date ON itinerary_items(scheduled_date);

-- ============================================
-- SAFETY CHECK-INS
-- ============================================
CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location GEOGRAPHY(POINT), -- Updated separately with PostGIS
  location_name TEXT,
  status TEXT NOT NULL CHECK (status IN ('safe', 'scheduled', 'missed', 'emergency')),
  notes TEXT,
  scheduled_for TIMESTAMPTZ, -- For scheduled check-ins
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checkins_user ON checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_created ON checkins(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_checkins_status ON checkins(status);
CREATE INDEX IF NOT EXISTS idx_checkins_scheduled ON checkins(scheduled_for) WHERE scheduled_for IS NOT NULL;

-- ============================================
-- SAFETY ZONES (cached safety scores by area)
-- ============================================
CREATE TABLE IF NOT EXISTS safety_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location GEOGRAPHY(POINT) NOT NULL,
  geohash TEXT UNIQUE NOT NULL, -- For efficient area lookups (unique for upsert)
  safety_score NUMERIC(3,2) CHECK (safety_score >= 0 AND safety_score <= 1),
  safety_level TEXT CHECK (safety_level IN ('safe', 'caution', 'avoid')),
  factors JSONB, -- Detailed safety factors
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_safety_zones_geohash ON safety_zones(geohash);
CREATE INDEX IF NOT EXISTS idx_safety_zones_location ON safety_zones USING GIST(location);

-- ============================================
-- SOCIAL CONNECTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requester_id, recipient_id)
);

CREATE INDEX IF NOT EXISTS idx_connections_requester ON connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_connections_recipient ON connections(recipient_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status);

-- ============================================
-- MESSAGES (for social connections)
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

-- ============================================
-- WAITLIST (for pre-launch signups)
-- ============================================
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  referral_code TEXT,
  referred_by UUID REFERENCES waitlist(id),
  position INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_position ON waitlist(position);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_itineraries_updated_at BEFORE UPDATE ON itineraries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_itinerary_items_updated_at BEFORE UPDATE ON itinerary_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_connections_updated_at BEFORE UPDATE ON connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
