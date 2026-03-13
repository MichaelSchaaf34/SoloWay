/**
 * Users service
 */

import { getSupabaseAdmin } from '../../shared/database/supabase.js';
import { query } from '../../shared/database/index.js';
import { cache, cacheKeys } from '../../shared/cache/redis.js';
import { NotFoundError } from '../../shared/middleware/errorHandler.js';

/**
 * Get user profile
 */
export async function getUserProfile(userId) {
  const cached = await cache.get(cacheKeys.user(userId));
  if (cached) return cached;

  const supabase = getSupabaseAdmin();
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, display_name, avatar_url, visibility_mode, current_location, created_at')
    .eq('id', userId)
    .single();

  if (error || !user) {
    throw new NotFoundError('User');
  }

  const userData = {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    avatarUrl: user.avatar_url,
    visibilityMode: user.visibility_mode,
    currentLocation: user.current_location,
    createdAt: user.created_at,
  };

  await cache.set(cacheKeys.user(userId), userData, 300);
  return userData;
}

/**
 * Update user profile
 */
export async function updateProfile(userId, updates) {
  const supabase = getSupabaseAdmin();

  const updateData = {};
  if (updates.displayName !== undefined) updateData.display_name = updates.displayName;
  if (updates.avatarUrl !== undefined) updateData.avatar_url = updates.avatarUrl;

  const { data: user, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId)
    .select('id, email, display_name, avatar_url, visibility_mode, created_at')
    .single();

  if (error) {
    throw new Error('Failed to update profile');
  }

  // Invalidate cache
  await cache.del(cacheKeys.user(userId));

  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    avatarUrl: user.avatar_url,
    visibilityMode: user.visibility_mode,
    createdAt: user.created_at,
  };
}

/**
 * Delete user account
 */
export async function deleteAccount(userId) {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);

  if (error) {
    throw new Error('Failed to delete account');
  }

  // Clear all user caches
  await cache.del(cacheKeys.user(userId));
  await cache.del(cacheKeys.userSession(userId));
  await cache.delPattern(`itineraries:user:${userId}`);
}

/**
 * Update user location using PostGIS
 */
export async function updateLocation(userId, latitude, longitude) {
  // Use raw SQL for PostGIS geography type
  await query(
    `UPDATE users 
     SET current_location = ST_MakePoint($1, $2)::geography,
         last_seen_at = NOW()
     WHERE id = $3`,
    [longitude, latitude, userId]
  );

  // Invalidate cache
  await cache.del(cacheKeys.user(userId));
}

/**
 * Update visibility mode
 */
export async function updateVisibility(userId, visibilityMode) {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from('users')
    .update({ visibility_mode: visibilityMode })
    .eq('id', userId);

  if (error) {
    throw new Error('Failed to update visibility');
  }

  // Invalidate cache
  await cache.del(cacheKeys.user(userId));
}

/**
 * Get trusted contacts
 */
export async function getTrustedContacts(userId) {
  const supabase = getSupabaseAdmin();

  const { data: contacts, error } = await supabase
    .from('trusted_contacts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error('Failed to fetch contacts');
  }

  return contacts.map(c => ({
    id: c.id,
    contactName: c.contact_name,
    contactPhone: c.contact_phone,
    contactEmail: c.contact_email,
    notifyOnCheckin: c.notify_on_checkin,
    notifyOnEmergency: c.notify_on_emergency,
    createdAt: c.created_at,
  }));
}

/**
 * Add trusted contact
 */
export async function addTrustedContact(userId, contactData) {
  const supabase = getSupabaseAdmin();

  const { data: contact, error } = await supabase
    .from('trusted_contacts')
    .insert({
      user_id: userId,
      contact_name: contactData.contactName,
      contact_phone: contactData.contactPhone,
      contact_email: contactData.contactEmail,
      notify_on_checkin: contactData.notifyOnCheckin,
      notify_on_emergency: contactData.notifyOnEmergency,
    })
    .select()
    .single();

  if (error) {
    throw new Error('Failed to add contact');
  }

  return {
    id: contact.id,
    contactName: contact.contact_name,
    contactPhone: contact.contact_phone,
    contactEmail: contact.contact_email,
    notifyOnCheckin: contact.notify_on_checkin,
    notifyOnEmergency: contact.notify_on_emergency,
    createdAt: contact.created_at,
  };
}

/**
 * Remove trusted contact
 */
export async function removeTrustedContact(userId, contactId) {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from('trusted_contacts')
    .delete()
    .eq('id', contactId)
    .eq('user_id', userId);

  if (error) {
    throw new Error('Failed to remove contact');
  }
}
