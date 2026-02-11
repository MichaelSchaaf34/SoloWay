/**
 * Database connection pool
 * Uses pg for direct PostgreSQL connections with connection pooling
 */

import pg from 'pg';
import { config } from '../../config/index.js';

const { Pool } = pg;

let pool = null;

/**
 * Initialize database connection pool
 */
export async function initializeDatabase() {
  if (pool) {
    return pool;
  }

  pool = new Pool({
    connectionString: config.database.url,
    min: config.database.pool.min,
    max: config.database.pool.max,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    // SSL configuration for production
    ssl: config.env === 'production' ? { rejectUnauthorized: false } : false,
  });

  // Test connection
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
  } catch (error) {
    console.error('Failed to connect to database:', error.message);
    throw error;
  }

  // Handle pool errors
  pool.on('error', (err) => {
    console.error('Unexpected database pool error:', err);
  });

  return pool;
}

/**
 * Get database pool instance
 */
export function getPool() {
  if (!pool) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return pool;
}

/**
 * Execute a query with automatic connection management
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 */
export async function query(text, params) {
  const start = Date.now();
  const result = await getPool().query(text, params);
  const duration = Date.now() - start;

  if (config.env === 'development') {
    console.log('Executed query', { text: text.substring(0, 100), duration, rows: result.rowCount });
  }

  return result;
}

/**
 * Execute a transaction with automatic rollback on error
 * @param {Function} callback - Async function that receives client
 */
export async function transaction(callback) {
  const client = await getPool().connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Close database pool
 */
export async function closeDatabase() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
