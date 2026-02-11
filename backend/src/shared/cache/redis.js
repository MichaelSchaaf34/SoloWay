/**
 * Redis cache layer
 * Provides caching, rate limiting support, and pub/sub for real-time features
 */

import Redis from 'ioredis';
import { config } from '../../config/index.js';

let redis = null;
let subscriber = null;
let publisher = null;

/**
 * Initialize Redis connections
 */
export async function initializeRedis() {
  if (!config.redis.url) {
    console.warn('Redis URL not configured. Caching disabled.');
    return null;
  }

  try {
    // Main Redis client for general operations
    redis = new Redis(config.redis.url, {
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      lazyConnect: true,
    });

    await redis.connect();

    // Test connection
    await redis.ping();

    // Create separate connections for pub/sub
    subscriber = redis.duplicate();
    publisher = redis.duplicate();

    return redis;
  } catch (error) {
    console.error('Failed to connect to Redis:', error.message);
    redis = null;
    return null;
  }
}

/**
 * Get Redis client
 */
export function getRedis() {
  return redis;
}

/**
 * Get pub/sub clients for real-time features
 */
export function getPubSubClients() {
  return { subscriber, publisher };
}

/**
 * Cache wrapper with automatic JSON serialization
 */
export const cache = {
  /**
   * Get cached value
   * @param {string} key - Cache key
   */
  async get(key) {
    if (!redis) return null;
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  /**
   * Set cached value with TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttlSeconds - Time to live in seconds
   */
  async set(key, value, ttlSeconds = 300) {
    if (!redis) return false;
    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  },

  /**
   * Delete cached value
   * @param {string} key - Cache key
   */
  async del(key) {
    if (!redis) return false;
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  },

  /**
   * Delete multiple keys matching pattern
   * @param {string} pattern - Key pattern (e.g., "user:*")
   */
  async delPattern(pattern) {
    if (!redis) return false;
    try {
      let cursor = '0';
      do {
        const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 200);
        cursor = nextCursor;
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } while (cursor !== '0');
      return true;
    } catch (error) {
      console.error('Cache delete pattern error:', error);
      return false;
    }
  },

  /**
   * Get or set - returns cached value or computes and caches it
   * @param {string} key - Cache key
   * @param {Function} compute - Async function to compute value if not cached
   * @param {number} ttlSeconds - Time to live in seconds
   */
  async getOrSet(key, compute, ttlSeconds = 300) {
    const cached = await this.get(key);
    if (cached !== null) {
      return cached;
    }

    const value = await compute();
    await this.set(key, value, ttlSeconds);
    return value;
  },
};

/**
 * Cache key generators for consistent key naming
 */
export const cacheKeys = {
  user: (userId) => `user:${userId}`,
  userSession: (userId) => `session:${userId}`,
  itinerary: (id) => `itinerary:${id}`,
  itinerariesByUser: (userId) => `itineraries:user:${userId}`,
  safetyScore: (geohash) => `safety:${geohash}`,
  nearbyTravelers: (geohash) => `nearby:${geohash}`,
};

/**
 * Close Redis connections
 */
export async function closeRedis() {
  if (redis) {
    await redis.quit();
    redis = null;
  }
  if (subscriber) {
    await subscriber.quit();
    subscriber = null;
  }
  if (publisher) {
    await publisher.quit();
    publisher = null;
  }
}
