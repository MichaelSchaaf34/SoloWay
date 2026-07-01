/**
 * Waitlist service
 * Handles landing-page waitlist signups
 */

import { getSupabaseAdmin } from '../../shared/database/supabase.js';

/**
 * Add an email to the waitlist (idempotent)
 */
export async function joinWaitlist(email) {
  const supabase = getSupabaseAdmin();
  const normalizedEmail = email.toLowerCase();

  const { data: existing } = await supabase
    .from('waitlist')
    .select('id, position')
    .eq('email', normalizedEmail)
    .single();

  if (existing) {
    return { alreadyJoined: true, position: existing.position };
  }

  const { data: entry, error } = await supabase
    .from('waitlist')
    .insert({ email: normalizedEmail })
    .select('id, position')
    .single();

  if (error) {
    throw new Error('Failed to join waitlist');
  }

  return { alreadyJoined: false, position: entry.position };
}
