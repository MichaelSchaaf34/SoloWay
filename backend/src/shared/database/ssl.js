/**
 * Shared Postgres SSL configuration for the app pool and the migration runner.
 *
 * In production we verify the server certificate against the provider CA
 * (Supabase: Dashboard -> Project Settings -> Database -> SSL certificate)
 * supplied via DATABASE_CA_CERT. The variable accepts either the raw PEM
 * (newlines may be escaped as \n, as most host dashboards require) or the
 * same PEM base64-encoded.
 */

function decodeCaCert(raw) {
  if (!raw) return null;

  const candidate = raw.includes('-----BEGIN CERTIFICATE-----')
    ? raw.replace(/\\n/g, '\n')
    : Buffer.from(raw, 'base64').toString('utf8');

  return candidate.includes('-----BEGIN CERTIFICATE-----') ? candidate : null;
}

export function buildPgSslConfig({ warn = console.warn } = {}) {
  if ((process.env.NODE_ENV || 'development') !== 'production') {
    return false;
  }

  const ca = decodeCaCert(process.env.DATABASE_CA_CERT);
  if (ca) {
    return { ca, rejectUnauthorized: true };
  }

  if (process.env.DATABASE_CA_CERT) {
    warn('DATABASE_CA_CERT is set but is not a valid PEM certificate (raw or base64). Falling back to unverified TLS.');
  } else {
    warn('DATABASE_CA_CERT is not set: the database connection is encrypted but the server certificate is NOT verified. Download the CA certificate from Supabase and set DATABASE_CA_CERT.');
  }

  // Encrypted but unauthenticated - kept as a fallback so a missing cert
  // never takes the API down; the boot log makes the gap loud instead.
  return { rejectUnauthorized: false };
}
