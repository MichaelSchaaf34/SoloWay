/**
 * Supabase client configuration
 * Provides both public and admin clients for different use cases
 */

import { createClient } from '@supabase/supabase-js';
import { config } from '../../config/index.js';

let supabasePublic = null;
let supabaseAdmin = null;

/**
 * Get Supabase client with anon key (respects RLS)
 * Use this for user-facing operations
 */
export function getSupabase() {
  if (!supabasePublic) {
    if (!config.supabase.url || !config.supabase.anonKey) {
      console.warn('Supabase not configured. Some features may not work.');
      return null;
    }

    supabasePublic = createClient(config.supabase.url, config.supabase.anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabasePublic;
}

/**
 * Get Supabase client with service role key (bypasses RLS)
 * Use this for admin operations and background jobs
 */
export function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    if (!config.supabase.url || !config.supabase.serviceRoleKey) {
      console.warn('Supabase admin not configured. Some features may not work.');
      return null;
    }

    supabaseAdmin = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabaseAdmin;
}

/**
 * Create Supabase client with user's access token
 * Use this to execute queries as a specific user
 */
export function getSupabaseWithAuth(accessToken) {
  if (!config.supabase.url || !config.supabase.anonKey) {
    throw new Error('Supabase not configured');
  }

  return createClient(config.supabase.url, config.supabase.anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
