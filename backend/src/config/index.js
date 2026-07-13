/**
 * Application configuration
 * Centralizes all environment variables and configuration settings
 */

const defaultCorsOrigins = ['http://localhost:3000', 'http://localhost:5173'];

function parseCorsOrigins(value) {
  if (!value) {
    return defaultCorsOrigins;
  }

  const origins = value
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

  return origins.length > 0 ? origins : defaultCorsOrigins;
}

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3001,
  apiVersion: process.env.API_VERSION || 'v1',

  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },

  // Database
  database: {
    url: process.env.DATABASE_URL,
    pool: {
      min: parseInt(process.env.DATABASE_POOL_MIN, 10) || 2,
      max: parseInt(process.env.DATABASE_POOL_MAX, 10) || 10,
    },
  },

  // Redis
  redis: {
    url: process.env.REDIS_URL,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || null,
    refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || null,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    algorithm: 'HS256',
    issuer: process.env.JWT_ISSUER || 'soloway-api',
    accessAudience: process.env.JWT_ACCESS_AUDIENCE || 'soloway-client',
    refreshAudience: process.env.JWT_REFRESH_AUDIENCE || 'soloway-refresh',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },

  // CORS
  cors: {
    origin: parseCorsOrigins(process.env.CORS_ORIGIN),
  },

  // Public app URL and transactional email
  appUrl: process.env.APP_BASE_URL || 'http://localhost:3000',
  email: {
    resendApiKey: process.env.RESEND_API_KEY || null,
    from: process.env.EMAIL_FROM || null,
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || null,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || null,
    connectCountry: process.env.STRIPE_CONNECT_COUNTRY || 'US',
    defaultCommissionBps: parseInt(process.env.STRIPE_DEFAULT_COMMISSION_BPS, 10) || 1500,
  },

  // External APIs
  externalApis: {
    mapsApiKey: process.env.MAPS_API_KEY,
    safetyApiKey: process.env.SAFETY_API_KEY,
    pushNotificationKey: process.env.PUSH_NOTIFICATION_KEY,
    // Optional: powers the "Happening in {city}" section. Absent key = empty results.
    ticketmasterApiKey: process.env.TICKETMASTER_API_KEY || null,
  },
};

// Validate required configuration in non-test environments
export function validateConfig() {
  if (
    config.stripe.defaultCommissionBps < 0 ||
    config.stripe.defaultCommissionBps > 5000
  ) {
    throw new Error('STRIPE_DEFAULT_COMMISSION_BPS must be between 0 and 5000');
  }

  const requiredInNonTest = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'DATABASE_URL',
    'REDIS_URL',
    'JWT_SECRET',
  ];

  if (config.env !== 'test') {
    const missing = requiredInNonTest.filter(key => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }

  if (config.env === 'production') {
    const requiredInProduction = [
      'APP_BASE_URL',
      'JWT_REFRESH_SECRET',
      'RESEND_API_KEY',
      'EMAIL_FROM',
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
    ];
    const missing = requiredInProduction.filter(key => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(`Missing production environment variables: ${missing.join(', ')}`);
    }
  }
}
