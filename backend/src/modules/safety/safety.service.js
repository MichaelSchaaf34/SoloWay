/**
 * Safety service - Safety Guardian feature
 * Handles check-ins, safety scores, and emergency alerts
 */

import { getSupabaseAdmin } from '../../shared/database/supabase.js';
import { query } from '../../shared/database/index.js';
import { cache, cacheKeys } from '../../shared/cache/redis.js';
import { emitToContacts, emitToUser } from '../../shared/realtime/websocket.js';
import { NotFoundError, AuthorizationError } from '../../shared/middleware/errorHandler.js';

/**
 * Create an immediate check-in (user is safe)
 */
export async function createCheckin(userId, data) {
  const supabase = getSupabaseAdmin();

  const { data: checkin, error } = await supabase
    .from('checkins')
    .insert({
      user_id: userId,
      status: 'safe',
      location_name: data.locationName,
      notes: data.notes,
      completed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error('Failed to create check-in');
  }

  // Update location with PostGIS
  await query(
    `UPDATE checkins 
     SET location = ST_MakePoint($1, $2)::geography 
     WHERE id = $3`,
    [data.longitude, data.latitude, checkin.id]
  );

  // Notify trusted contacts in real-time
  emitToContacts(userId, 'checkin:safe', {
    userId,
    checkinId: checkin.id,
    locationName: data.locationName,
    timestamp: new Date().toISOString(),
  });

  // TODO: Send push notifications to trusted contacts

  return formatCheckin(checkin);
}

/**
 * Schedule a future check-in
 */
export async function scheduleCheckin(userId, data) {
  const supabase = getSupabaseAdmin();

  const insertData = {
    user_id: userId,
    status: 'scheduled',
    location_name: data.locationName,
    notes: data.notes,
    scheduled_for: data.scheduledFor,
  };

  const { data: checkin, error } = await supabase
    .from('checkins')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    throw new Error('Failed to schedule check-in');
  }

  // Update location if provided
  if (data.latitude !== undefined && data.longitude !== undefined) {
    await query(
      `UPDATE checkins 
       SET location = ST_MakePoint($1, $2)::geography 
       WHERE id = $3`,
      [data.longitude, data.latitude, checkin.id]
    );
  }

  // TODO: Schedule background job to check for missed check-ins

  return formatCheckin(checkin);
}

/**
 * Get check-in history
 */
export async function getCheckinHistory(userId, options = {}) {
  const { limit = 20, cursor } = options;

  const supabase = getSupabaseAdmin();
  let queryBuilder = supabase
    .from('checkins')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit + 1);

  if (cursor) {
    queryBuilder = queryBuilder.lt('created_at', cursor);
  }

  const { data: checkins, error } = await queryBuilder;

  if (error) {
    throw new Error('Failed to fetch check-ins');
  }

  const hasMore = checkins.length > limit;
  const results = hasMore ? checkins.slice(0, -1) : checkins;

  return {
    checkins: results.map(formatCheckin),
    pagination: {
      hasMore,
      nextCursor: hasMore ? results[results.length - 1].created_at : null,
    },
  };
}

/**
 * Get pending scheduled check-ins
 */
export async function getPendingCheckins(userId) {
  const supabase = getSupabaseAdmin();

  const { data: checkins, error } = await supabase
    .from('checkins')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'scheduled')
    .gte('scheduled_for', new Date().toISOString())
    .order('scheduled_for', { ascending: true });

  if (error) {
    throw new Error('Failed to fetch pending check-ins');
  }

  return checkins.map(formatCheckin);
}

/**
 * Complete a scheduled check-in
 */
export async function completeScheduledCheckin(userId, checkinId) {
  const supabase = getSupabaseAdmin();

  const { data: existing } = await supabase
    .from('checkins')
    .select('*')
    .eq('id', checkinId)
    .eq('user_id', userId)
    .single();

  if (!existing) {
    throw new NotFoundError('Check-in');
  }

  if (existing.status !== 'scheduled') {
    throw new Error('Check-in is not scheduled');
  }

  const { data: checkin, error } = await supabase
    .from('checkins')
    .update({
      status: 'safe',
      completed_at: new Date().toISOString(),
    })
    .eq('id', checkinId)
    .select()
    .single();

  if (error) {
    throw new Error('Failed to complete check-in');
  }

  // Notify contacts
  emitToContacts(userId, 'checkin:safe', {
    userId,
    checkinId,
    timestamp: new Date().toISOString(),
  });

  return formatCheckin(checkin);
}

/**
 * Cancel a scheduled check-in
 */
export async function cancelCheckin(userId, checkinId) {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from('checkins')
    .delete()
    .eq('id', checkinId)
    .eq('user_id', userId)
    .eq('status', 'scheduled');

  if (error) {
    throw new Error('Failed to cancel check-in');
  }
}

/**
 * Get safety score for a location
 * In production, this would integrate with external safety APIs
 */
export async function getSafetyScore(latitude, longitude) {
  // Generate geohash for caching (simplified - use proper geohash library in production)
  const geohash = `${Math.round(latitude * 100)}_${Math.round(longitude * 100)}`;
  const cacheKey = cacheKeys.safetyScore(geohash);

  // Check cache first
  const cached = await cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Check database for cached safety zone
  const result = await query(
    `SELECT * FROM safety_zones 
     WHERE geohash = $1 
     AND expires_at > NOW()
     LIMIT 1`,
    [geohash]
  );

  if (result.rows.length > 0) {
    const zone = result.rows[0];
    const safetyData = {
      safetyScore: parseFloat(zone.safety_score),
      safetyLevel: zone.safety_level,
      factors: zone.factors,
      lastUpdated: zone.last_updated,
    };
    await cache.set(cacheKey, safetyData, 300); // Cache for 5 minutes
    return safetyData;
  }

  // TODO: Call external safety API (crime data, etc.)
  // For now, return mock data
  const mockScore = 0.7 + Math.random() * 0.25; // 0.7-0.95
  const safetyLevel = mockScore > 0.8 ? 'safe' : mockScore > 0.6 ? 'caution' : 'avoid';

  const safetyData = {
    safetyScore: Math.round(mockScore * 100) / 100,
    safetyLevel,
    factors: {
      crimeRate: 'low',
      lighting: 'good',
      crowdLevel: 'moderate',
      nearbyServices: ['police_station', 'hospital'],
    },
    lastUpdated: new Date().toISOString(),
  };

  // Cache result
  await cache.set(cacheKey, safetyData, 300);

  // Store in database for longer-term caching
  await query(
    `INSERT INTO safety_zones (location, geohash, safety_score, safety_level, factors, expires_at)
     VALUES (ST_MakePoint($1, $2)::geography, $3, $4, $5, $6, NOW() + INTERVAL '1 hour')
     ON CONFLICT (geohash) DO UPDATE SET
       safety_score = EXCLUDED.safety_score,
       safety_level = EXCLUDED.safety_level,
       factors = EXCLUDED.factors,
       last_updated = NOW(),
       expires_at = NOW() + INTERVAL '1 hour'`,
    [longitude, latitude, geohash, safetyData.safetyScore, safetyLevel, JSON.stringify(safetyData.factors)]
  ).catch(() => {}); // Ignore upsert errors

  return safetyData;
}

/**
 * Trigger emergency alert
 */
export async function triggerEmergency(userId, data) {
  const supabase = getSupabaseAdmin();

  // Create emergency check-in
  const { data: checkin, error } = await supabase
    .from('checkins')
    .insert({
      user_id: userId,
      status: 'emergency',
      notes: data.message,
    })
    .select()
    .single();

  if (error) {
    throw new Error('Failed to trigger emergency');
  }

  // Update location if provided
  if (data.latitude !== undefined && data.longitude !== undefined) {
    await query(
      `UPDATE checkins 
       SET location = ST_MakePoint($1, $2)::geography 
       WHERE id = $3`,
      [data.longitude, data.latitude, checkin.id]
    );
  }

  // Get trusted contacts
  const { data: contacts } = await supabase
    .from('trusted_contacts')
    .select('*')
    .eq('user_id', userId)
    .eq('notify_on_emergency', true);

  // Emit real-time emergency to contacts
  emitToContacts(userId, 'emergency:alert', {
    userId,
    checkinId: checkin.id,
    message: data.message,
    location: data.latitude && data.longitude ? { latitude: data.latitude, longitude: data.longitude } : null,
    timestamp: new Date().toISOString(),
  });

  // TODO: Send SMS/push notifications to trusted contacts
  // TODO: Optionally contact emergency services

  return {
    checkinId: checkin.id,
    contactsNotified: (contacts || []).length,
  };
}

/**
 * Cancel emergency alert
 */
export async function cancelEmergency(userId) {
  const supabase = getSupabaseAdmin();

  // Update most recent emergency to safe
  const { data: checkin, error } = await supabase
    .from('checkins')
    .update({ status: 'safe', completed_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('status', 'emergency')
    .order('created_at', { ascending: false })
    .limit(1)
    .select()
    .single();

  if (error) {
    throw new Error('No active emergency to cancel');
  }

  // Notify contacts that emergency is resolved
  emitToContacts(userId, 'emergency:cancelled', {
    userId,
    checkinId: checkin.id,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Get current safety status
 */
export async function getSafetyStatus(userId) {
  const supabase = getSupabaseAdmin();

  // Get latest check-in
  const { data: latestCheckin } = await supabase
    .from('checkins')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // Get upcoming scheduled check-ins
  const { data: scheduled } = await supabase
    .from('checkins')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'scheduled')
    .gte('scheduled_for', new Date().toISOString())
    .order('scheduled_for', { ascending: true })
    .limit(5);

  // Get count of missed check-ins
  const { count: missedCount } = await supabase
    .from('checkins')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'missed');

  // Check for active emergency
  const { data: emergency } = await supabase
    .from('checkins')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'emergency')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return {
    lastCheckin: latestCheckin ? formatCheckin(latestCheckin) : null,
    scheduledCheckins: (scheduled || []).map(formatCheckin),
    missedCheckinsCount: missedCount || 0,
    hasActiveEmergency: !!emergency,
    activeEmergency: emergency ? formatCheckin(emergency) : null,
  };
}

/**
 * Format check-in for API response
 */
function formatCheckin(checkin) {
  return {
    id: checkin.id,
    status: checkin.status,
    locationName: checkin.location_name,
    notes: checkin.notes,
    scheduledFor: checkin.scheduled_for,
    completedAt: checkin.completed_at,
    createdAt: checkin.created_at,
  };
}
