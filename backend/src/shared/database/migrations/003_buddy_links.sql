-- SoloWay Database Schema
-- Migration 003: Buddy Link system (guest_users, buddy_links, buddy_link_log, buddy_connections)

-- 1. Guest Users (lightweight phone-verified profiles)
CREATE TABLE IF NOT EXISTS guest_users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number    VARCHAR(20) NOT NULL UNIQUE,
    phone_verified  BOOLEAN NOT NULL DEFAULT false,
    verification_code       VARCHAR(128),
    verification_expires_at TIMESTAMPTZ,
    verification_attempts   INTEGER NOT NULL DEFAULT 0,
    display_name    VARCHAR(100),
    converted_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_guest_users_phone ON guest_users(phone_number);
CREATE INDEX IF NOT EXISTS idx_guest_users_converted ON guest_users(converted_to_user_id) WHERE converted_to_user_id IS NOT NULL;

-- 2. Buddy Links
CREATE TABLE IF NOT EXISTS buddy_links (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token               VARCHAR(64) NOT NULL UNIQUE,
    itinerary_item_id   UUID NOT NULL REFERENCES itinerary_items(id) ON DELETE CASCADE,
    host_user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    guest_user_id       UUID REFERENCES guest_users(id) ON DELETE SET NULL,
    guest_registered_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'active', 'expired', 'cancelled')),
    party_size_cap      INTEGER NOT NULL DEFAULT 5,
    current_party_count INTEGER NOT NULL DEFAULT 1,
    token_expires_at    TIMESTAMPTZ NOT NULL,
    link_expires_at     TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_guest_type CHECK (
        NOT (guest_user_id IS NOT NULL AND guest_registered_user_id IS NOT NULL)
    ),
    CONSTRAINT chk_party_size CHECK (current_party_count <= party_size_cap)
);

CREATE INDEX IF NOT EXISTS idx_buddy_links_token ON buddy_links(token);
CREATE INDEX IF NOT EXISTS idx_buddy_links_host ON buddy_links(host_user_id);
CREATE INDEX IF NOT EXISTS idx_buddy_links_item ON buddy_links(itinerary_item_id);
CREATE INDEX IF NOT EXISTS idx_buddy_links_status ON buddy_links(status) WHERE status IN ('pending', 'active');

-- 3. Buddy Link Log (immutable audit trail)
CREATE TABLE IF NOT EXISTS buddy_link_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buddy_link_id   UUID NOT NULL REFERENCES buddy_links(id) ON DELETE CASCADE,
    actor_user_id   UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_guest_id  UUID REFERENCES guest_users(id) ON DELETE SET NULL,
    action          VARCHAR(30) NOT NULL
                    CHECK (action IN (
                        'created', 'scanned', 'verified', 'activated',
                        'closed', 'expired', 'cancelled', 'party_joined'
                    )),
    metadata        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_buddy_log_link ON buddy_link_log(buddy_link_id);
CREATE INDEX IF NOT EXISTS idx_buddy_log_user ON buddy_link_log(actor_user_id) WHERE actor_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_buddy_log_created ON buddy_link_log(created_at DESC);

-- 4. Buddy Connections (post-event opt-in)
CREATE TABLE IF NOT EXISTS buddy_connections (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buddy_link_id           UUID NOT NULL REFERENCES buddy_links(id) ON DELETE CASCADE,
    user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    connected_to_user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
    connected_to_guest_id   UUID REFERENCES guest_users(id) ON DELETE SET NULL,
    status                  VARCHAR(20) NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_connection_per_link UNIQUE (buddy_link_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_buddy_connections_user ON buddy_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_buddy_connections_status ON buddy_connections(status) WHERE status = 'pending';

-- 5. Auto-update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_guest_users_updated') THEN
        CREATE TRIGGER trg_guest_users_updated
            BEFORE UPDATE ON guest_users
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_buddy_links_updated') THEN
        CREATE TRIGGER trg_buddy_links_updated
            BEFORE UPDATE ON buddy_links
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
