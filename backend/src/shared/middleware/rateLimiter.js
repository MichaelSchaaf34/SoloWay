/**
 * Rate limiting middleware
 * Uses Redis for distributed rate limiting across multiple instances
 */

import rateLimit from 'express-rate-limit';
import { config } from '../../config/index.js';

/**
 * Builds a rate limiter that can swap stores at runtime.
 * This lets us initialize Redis after app startup without losing middleware references.
 */
function createDynamicLimiter(options) {
  let limiter = rateLimit(options);

  return {
    middleware: (req, res, next) => limiter(req, res, next),
    setStore: (store) => {
      limiter = rateLimit({
        ...options,
        ...(store && { store }),
      });
    },
  };
}

const defaultLimiter = createDynamicLimiter({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = createDynamicLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per 15 minutes
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many attempts, please try again in 15 minutes',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const lenientLimiter = createDynamicLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 300, // 300 requests per minute
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please slow down',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Configure Redis store when Redis is available
 */
export function configureRateLimiting(redisStore) {
  defaultLimiter.setStore(redisStore);
  strictLimiter.setStore(redisStore);
  lenientLimiter.setStore(redisStore);
}

/**
 * Default rate limiter for all routes
 */
export const rateLimiter = (req, res, next) => defaultLimiter.middleware(req, res, next);

/**
 * Strict rate limiter for sensitive endpoints (auth, etc.)
 */
export const strictRateLimiter = (req, res, next) => strictLimiter.middleware(req, res, next);

/**
 * Lenient rate limiter for read-heavy endpoints
 */
export const lenientRateLimiter = (req, res, next) => lenientLimiter.middleware(req, res, next);
