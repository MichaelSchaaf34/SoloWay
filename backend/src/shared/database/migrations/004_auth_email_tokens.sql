-- Email verification and password recovery tokens

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;

-- Preserve access for accounts created before email verification was introduced.
UPDATE users
SET email_verified_at = created_at
WHERE email_verified_at IS NULL;

CREATE TABLE IF NOT EXISTS auth_email_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT UNIQUE NOT NULL,
  token_type TEXT NOT NULL CHECK (token_type IN ('verify_email', 'reset_password')),
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_email_tokens_user_type
  ON auth_email_tokens(user_id, token_type);
CREATE INDEX IF NOT EXISTS idx_auth_email_tokens_expires
  ON auth_email_tokens(expires_at);
