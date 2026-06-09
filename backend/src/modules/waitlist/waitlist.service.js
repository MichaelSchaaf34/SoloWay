import { getSupabaseAdmin } from '../../shared/database/supabase.js';
import { AppError } from '../../shared/middleware/errorHandler.js';

/**
 * Add an email to the pre-launch waitlist.
 * Idempotent: returns `alreadyJoined: true` when the email already exists.
 */
export async function joinWaitlist({ email, referralCode = null }) {
  const supabase = getSupabaseAdmin();
  const normalizedEmail = String(email).trim().toLowerCase();

  const { data: existing, error: lookupError } = await supabase
    .from('waitlist')
    .select('id, email, position, created_at')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (lookupError && lookupError.code !== 'PGRST116') {
    throw new AppError('Could not check waitlist status', 500, 'WAITLIST_LOOKUP_FAILED');
  }

  if (existing) {
    return {
      alreadyJoined: true,
      email: existing.email,
      position: existing.position,
      joinedAt: existing.created_at,
    };
  }

  const insertPayload = { email: normalizedEmail };
  if (referralCode) insertPayload.referral_code = referralCode;

  const { data: inserted, error: insertError } = await supabase
    .from('waitlist')
    .insert(insertPayload)
    .select('id, email, position, created_at')
    .single();

  if (insertError) {
    if (insertError.code === '23505') {
      return {
        alreadyJoined: true,
        email: normalizedEmail,
      };
    }
    throw new AppError('Could not join waitlist', 500, 'WAITLIST_INSERT_FAILED');
  }

  return {
    alreadyJoined: false,
    email: inserted.email,
    position: inserted.position,
    joinedAt: inserted.created_at,
  };
}
