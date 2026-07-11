-- Stripe Connect marketplace commerce model (single-provider checkout MVP)

CREATE TABLE IF NOT EXISTS providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  stripe_account_id TEXT UNIQUE,
  onboarding_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (onboarding_status IN ('pending', 'restricted', 'active', 'disabled')),
  charges_enabled BOOLEAN NOT NULL DEFAULT false,
  payouts_enabled BOOLEAN NOT NULL DEFAULT false,
  default_commission_bps INTEGER NOT NULL DEFAULT 1500
    CHECK (default_commission_bps BETWEEN 0 AND 5000),
  default_currency TEXT NOT NULL DEFAULT 'usd'
    CHECK (default_currency ~ '^[a-z]{3}$'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE RESTRICT,
  destination_slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL
    CHECK (category IN ('food', 'activity', 'relax', 'culture', 'nightlife', 'other')),
  location_name TEXT,
  scheduled_time TIME,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  duration_minutes INTEGER CHECK (duration_minutes IS NULL OR duration_minutes > 0),
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'usd' CHECK (currency ~ '^[a-z]{3}$'),
  cancellation_policy TEXT NOT NULL DEFAULT 'Refunds are available up to 24 hours before the experience.',
  refund_cutoff_hours INTEGER NOT NULL DEFAULT 24
    CHECK (refund_cutoff_hours BETWEEN 0 AND 720),
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE RESTRICT,
  itinerary_id UUID REFERENCES itineraries(id) ON DELETE SET NULL,
  trip_destination TEXT NOT NULL,
  trip_start_date DATE NOT NULL,
  trip_end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'paid', 'fulfilled', 'payment_failed', 'cancelled', 'partially_refunded', 'refunded', 'disputed')),
  currency TEXT NOT NULL CHECK (currency ~ '^[a-z]{3}$'),
  subtotal_cents INTEGER NOT NULL CHECK (subtotal_cents >= 0),
  commission_cents INTEGER NOT NULL CHECK (commission_cents >= 0),
  total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
  idempotency_key TEXT NOT NULL,
  stripe_checkout_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT UNIQUE,
  checkout_expires_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  fulfilled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, idempotency_key),
  CHECK (commission_cents <= subtotal_cents),
  CHECK (total_cents = subtotal_cents),
  CHECK (trip_end_date >= trip_start_date)
);

CREATE TABLE IF NOT EXISTS order_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  experience_id UUID REFERENCES experiences(id) ON DELETE SET NULL,
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  location_name TEXT,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  timezone TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_amount_cents INTEGER NOT NULL CHECK (unit_amount_cents >= 0),
  line_total_cents INTEGER NOT NULL CHECK (line_total_cents >= 0),
  commission_cents INTEGER NOT NULL CHECK (commission_cents >= 0),
  currency TEXT NOT NULL CHECK (currency ~ '^[a-z]{3}$'),
  cancellation_policy TEXT NOT NULL,
  refund_cutoff_hours INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (line_total_cents = unit_amount_cents * quantity),
  CHECK (commission_cents <= line_total_cents)
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  status TEXT NOT NULL
    CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'partially_refunded', 'refunded', 'disputed')),
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  commission_cents INTEGER NOT NULL CHECK (commission_cents >= 0),
  provider_net_cents INTEGER NOT NULL CHECK (provider_net_cents >= 0),
  currency TEXT NOT NULL CHECK (currency ~ '^[a-z]{3}$'),
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  stripe_transfer_id TEXT,
  failure_code TEXT,
  failure_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (commission_cents + provider_net_cents = amount_cents)
);

CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
  requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'succeeded', 'failed', 'cancelled')),
  stripe_refund_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhook_events (
  stripe_event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing'
    CHECK (status IN ('processing', 'processed', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 1,
  last_error TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_experiences_destination_active
  ON experiences(destination_slug, is_active);
CREATE INDEX IF NOT EXISTS idx_experiences_provider
  ON experiences(provider_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_created
  ON orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_provider_created
  ON orders(provider_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status
  ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_line_items_order
  ON order_line_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order
  ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_order
  ON refunds(order_id);

CREATE OR REPLACE FUNCTION enforce_single_provider_order()
RETURNS TRIGGER AS $$
DECLARE
  order_provider UUID;
BEGIN
  SELECT provider_id INTO order_provider FROM orders WHERE id = NEW.order_id;
  IF order_provider IS NULL OR order_provider <> NEW.provider_id THEN
    RAISE EXCEPTION 'Order line provider must match order provider';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_single_provider_order_line ON order_line_items;
CREATE TRIGGER enforce_single_provider_order_line
  BEFORE INSERT OR UPDATE ON order_line_items
  FOR EACH ROW EXECUTE FUNCTION enforce_single_provider_order();

DROP TRIGGER IF EXISTS update_providers_updated_at ON providers;
CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_experiences_updated_at ON experiences;
CREATE TRIGGER update_experiences_updated_at BEFORE UPDATE ON experiences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_refunds_updated_at ON refunds;
CREATE TRIGGER update_refunds_updated_at BEFORE UPDATE ON refunds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_webhook_events_updated_at ON webhook_events;
CREATE TRIGGER update_webhook_events_updated_at BEFORE UPDATE ON webhook_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
