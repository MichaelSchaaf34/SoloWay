-- Community reviews from solo travelers (destination-scoped MVP).
-- One review per user per destination; deleting your review lets you re-post.

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  destination_slug TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  body TEXT NOT NULL,
  travel_style TEXT NOT NULL DEFAULT 'solo'
    CHECK (travel_style IN ('solo', 'business', 'first-time')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, destination_slug)
);

CREATE INDEX IF NOT EXISTS idx_reviews_destination_created
  ON reviews(destination_slug, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_user
  ON reviews(user_id);

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
