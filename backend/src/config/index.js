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
    secret: process.env.JWT_SECRET || 'development-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
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

  // External APIs
  externalApis: {
    mapsApiKey: process.env.MAPS_API_KEY,
    safetyApiKey: process.env.SAFETY_API_KEY,
    pushNotificationKey: process.env.PUSH_NOTIFICATION_KEY,
  },
};

// Validate required configuration in production
export function validateConfig() {
  const requiredInProduction = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'DATABASE_URL',
    'REDIS_URL',
    'JWT_SECRET',
  ];

  if (config.env === 'production') {
    const missing = requiredInProduction.filter(key => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
}
