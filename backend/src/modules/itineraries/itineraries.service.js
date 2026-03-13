/**
 * Itineraries service
 * Handles itinerary CRUD and geospatial queries
 */

import { getSupabaseAdmin } from '../../shared/database/supabase.js';
import { query } from '../../shared/database/index.js';
import { cache, cacheKeys } from '../../shared/cache/redis.js';
import { NotFoundError, AuthorizationError } from '../../shared/middleware/errorHandler.js';

/**
 * Create a new itinerary
 */
export async function createItinerary(userId, data) {
  const supabase = getSupabaseAdmin();

  // Build insert data
  const insertData = {
    user_id: userId,
    title: data.title,
    destination: data.destination,
    start_date: data.startDate,
    end_date: data.endDate,
    mood: data.mood || 'balanced',
    is_public: data.isPublic || false,
    status: 'draft',
  };

  const { data: itinerary, error } = await supabase
    .from('itineraries')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    throw new Error('Failed to create itinerary');
  }

  // If destination location provided, update with PostGIS
  if (data.destinationLocation) {
    await query(
      `UPDATE itineraries 
       SET destination_location = ST_MakePoint($1, $2)::geography 
       WHERE id = $3`,
      [data.destinationLocation.longitude, data.destinationLocation.latitude, itinerary.id]
    );
  }

  // Invalidate cache
  await cache.del(cacheKeys.itinerariesByUser(userId));

  return formatItinerary(itinerary);
}

/**
 * Get user's itineraries with pagination
 */
export async function getUserItineraries(userId, options = {}) {
  const { status, limit = 20, cursor } = options;

  const supabase = getSupabaseAdmin();
  let queryBuilder = supabase
    .from('itineraries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit + 1); // Fetch one extra to check for more

  if (status) {
    queryBuilder = queryBuilder.eq('status', status);
  }

  if (cursor) {
    queryBuilder = queryBuilder.lt('created_at', cursor);
  }

  const { data: itineraries, error } = await queryBuilder;

  if (error) {
    throw new Error('Failed to fetch itineraries');
  }

  const hasMore = itineraries.length > limit;
  const results = hasMore ? itineraries.slice(0, -1) : itineraries;
  const nextCursor = hasMore ? results[results.length - 1].created_at : null;

  return {
    itineraries: results.map(formatItinerary),
    pagination: {
      hasMore,
      nextCursor,
    },
  };
}

/**
 * Get itinerary with items
 */
export async function getItineraryWithItems(itineraryId, userId) {
  const supabase = getSupabaseAdmin();

  // Get itinerary
  const { data: itinerary, error } = await supabase
    .from('itineraries')
    .select('*')
    .eq('id', itineraryId)
    .single();

  if (error || !itinerary) {
    throw new NotFoundError('Itinerary');
  }

  // Check access
  if (itinerary.user_id !== userId && !itinerary.is_public) {
    throw new AuthorizationError('You do not have access to this itinerary');
  }

  // Get items
  const { data: items } = await supabase
    .from('itinerary_items')
    .select('*')
    .eq('itinerary_id', itineraryId)
    .order('scheduled_date', { ascending: true })
    .order('start_time', { ascending: true });

  return {
    ...formatItinerary(itinerary),
    items: (items || []).map(formatItem),
  };
}

/**
 * Update itinerary
 */
export async function updateItinerary(itineraryId, userId, updates) {
  const supabase = getSupabaseAdmin();

  // Verify ownership
  const { data: existing } = await supabase
    .from('itineraries')
    .select('user_id')
    .eq('id', itineraryId)
    .single();

  if (!existing) {
    throw new NotFoundError('Itinerary');
  }

  if (existing.user_id !== userId) {
    throw new AuthorizationError('You do not own this itinerary');
  }

  // Build update data
  const updateData = {};
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.destination !== undefined) updateData.destination = updates.destination;
  if (updates.startDate !== undefined) updateData.start_date = updates.startDate;
  if (updates.endDate !== undefined) updateData.end_date = updates.endDate;
  if (updates.mood !== undefined) updateData.mood = updates.mood;
  if (updates.isPublic !== undefined) updateData.is_public = updates.isPublic;
  if (updates.status !== undefined) updateData.status = updates.status;

  const { data: itinerary, error } = await supabase
    .from('itineraries')
    .update(updateData)
    .eq('id', itineraryId)
    .select()
    .single();

  if (error) {
    throw new Error('Failed to update itinerary');
  }

  // Update location if provided
  if (updates.destinationLocation) {
    await query(
      `UPDATE itineraries 
       SET destination_location = ST_MakePoint($1, $2)::geography 
       WHERE id = $3`,
      [updates.destinationLocation.longitude, updates.destinationLocation.latitude, itineraryId]
    );
  }

  // Invalidate caches
  await cache.del(cacheKeys.itinerary(itineraryId));
  await cache.del(cacheKeys.itinerariesByUser(userId));

  return formatItinerary(itinerary);
}

/**
 * Delete itinerary
 */
export async function deleteItinerary(itineraryId, userId) {
  const supabase = getSupabaseAdmin();

  const { data: existing } = await supabase
    .from('itineraries')
    .select('user_id')
    .eq('id', itineraryId)
    .single();

  if (!existing) {
    throw new NotFoundError('Itinerary');
  }

  if (existing.user_id !== userId) {
    throw new AuthorizationError('You do not own this itinerary');
  }

  const { error } = await supabase
    .from('itineraries')
    .delete()
    .eq('id', itineraryId);

  if (error) {
    throw new Error('Failed to delete itinerary');
  }

  // Invalidate caches
  await cache.del(cacheKeys.itinerary(itineraryId));
  await cache.del(cacheKeys.itinerariesByUser(userId));
}

/**
 * Add item to itinerary
 */
export async function addItem(itineraryId, userId, data) {
  const supabase = getSupabaseAdmin();

  // Verify ownership
  const { data: itinerary } = await supabase
    .from('itineraries')
    .select('user_id')
    .eq('id', itineraryId)
    .single();

  if (!itinerary) {
    throw new NotFoundError('Itinerary');
  }

  if (itinerary.user_id !== userId) {
    throw new AuthorizationError('You do not own this itinerary');
  }

  const insertData = {
    itinerary_id: itineraryId,
    title: data.title,
    description: data.description,
    location_name: data.locationName,
    scheduled_date: data.scheduledDate,
    start_time: data.startTime,
    end_time: data.endTime,
    category: data.category,
    is_flexible: data.isFlexible || false,
  };

  const { data: item, error } = await supabase
    .from('itinerary_items')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    throw new Error('Failed to add item');
  }

  // Update location with PostGIS if provided
  if (data.location) {
    await query(
      `UPDATE itinerary_items 
       SET location = ST_MakePoint($1, $2)::geography 
       WHERE id = $3`,
      [data.location.longitude, data.location.latitude, item.id]
    );
  }

  // Invalidate cache
  await cache.del(cacheKeys.itinerary(itineraryId));

  return formatItem(item);
}

/**
 * Update itinerary item
 */
export async function updateItem(itineraryId, itemId, userId, updates) {
  const supabase = getSupabaseAdmin();

  // Verify ownership through itinerary
  const { data: itinerary } = await supabase
    .from('itineraries')
    .select('user_id')
    .eq('id', itineraryId)
    .single();

  if (!itinerary || itinerary.user_id !== userId) {
    throw new AuthorizationError('You do not own this itinerary');
  }

  const updateData = {};
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.locationName !== undefined) updateData.location_name = updates.locationName;
  if (updates.scheduledDate !== undefined) updateData.scheduled_date = updates.scheduledDate;
  if (updates.startTime !== undefined) updateData.start_time = updates.startTime;
  if (updates.endTime !== undefined) updateData.end_time = updates.endTime;
  if (updates.category !== undefined) updateData.category = updates.category;
  if (updates.isFlexible !== undefined) updateData.is_flexible = updates.isFlexible;

  const { data: item, error } = await supabase
    .from('itinerary_items')
    .update(updateData)
    .eq('id', itemId)
    .eq('itinerary_id', itineraryId)
    .select()
    .single();

  if (error) {
    throw new Error('Failed to update item');
  }

  if (updates.location) {
    await query(
      `UPDATE itinerary_items 
       SET location = ST_MakePoint($1, $2)::geography 
       WHERE id = $3`,
      [updates.location.longitude, updates.location.latitude, itemId]
    );
  }

  await cache.del(cacheKeys.itinerary(itineraryId));

  return formatItem(item);
}

/**
 * Delete itinerary item
 */
export async function deleteItem(itineraryId, itemId, userId) {
  const supabase = getSupabaseAdmin();

  const { data: itinerary } = await supabase
    .from('itineraries')
    .select('user_id')
    .eq('id', itineraryId)
    .single();

  if (!itinerary || itinerary.user_id !== userId) {
    throw new AuthorizationError('You do not own this itinerary');
  }

  const { error } = await supabase
    .from('itinerary_items')
    .delete()
    .eq('id', itemId)
    .eq('itinerary_id', itineraryId);

  if (error) {
    throw new Error('Failed to delete item');
  }

  await cache.del(cacheKeys.itinerary(itineraryId));
}

/**
 * Get public itineraries
 */
export async function getPublicItineraries(options = {}) {
  const { limit = 20, cursor } = options;

  const supabase = getSupabaseAdmin();
  let queryBuilder = supabase
    .from('itineraries')
    .select('*, users!inner(display_name, avatar_url)')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(limit + 1);

  if (cursor) {
    queryBuilder = queryBuilder.lt('created_at', cursor);
  }

  const { data: itineraries, error } = await queryBuilder;

  if (error) {
    throw new Error('Failed to fetch public itineraries');
  }

  const hasMore = itineraries.length > limit;
  const results = hasMore ? itineraries.slice(0, -1) : itineraries;

  return {
    itineraries: results.map(i => ({
      ...formatItinerary(i),
      author: {
        displayName: i.users?.display_name,
        avatarUrl: i.users?.avatar_url,
      },
    })),
    pagination: {
      hasMore,
      nextCursor: hasMore ? results[results.length - 1].created_at : null,
    },
  };
}

/**
 * Get nearby itineraries using PostGIS
 */
export async function getNearbyItineraries(latitude, longitude, radiusKm = 10, limit = 20) {
  const radiusMeters = radiusKm * 1000;

  const result = await query(
    `SELECT i.*, 
            ST_Distance(i.destination_location, ST_MakePoint($1, $2)::geography) as distance,
            u.display_name, u.avatar_url
     FROM itineraries i
     JOIN users u ON i.user_id = u.id
     WHERE i.is_public = true
       AND i.destination_location IS NOT NULL
       AND ST_DWithin(i.destination_location, ST_MakePoint($1, $2)::geography, $3)
     ORDER BY distance ASC
     LIMIT $4`,
    [longitude, latitude, radiusMeters, limit]
  );

  return result.rows.map(row => ({
    ...formatItinerary(row),
    distance: Math.round(row.distance),
    author: {
      displayName: row.display_name,
      avatarUrl: row.avatar_url,
    },
  }));
}

/**
 * Update itinerary status
 */
export async function updateItineraryStatus(itineraryId, userId, status) {
  return updateItinerary(itineraryId, userId, { status });
}

/**
 * Duplicate an itinerary
 */
export async function duplicateItinerary(itineraryId, userId) {
  const original = await getItineraryWithItems(itineraryId, userId);

  // Create new itinerary
  const newItinerary = await createItinerary(userId, {
    title: `${original.title} (Copy)`,
    destination: original.destination,
    startDate: original.startDate,
    endDate: original.endDate,
    mood: original.mood,
    isPublic: false,
  });

  // Copy items
  for (const item of original.items) {
    await addItem(newItinerary.id, userId, {
      title: item.title,
      description: item.description,
      locationName: item.locationName,
      scheduledDate: item.scheduledDate,
      startTime: item.startTime,
      endTime: item.endTime,
      category: item.category,
      isFlexible: item.isFlexible,
    });
  }

  return getItineraryWithItems(newItinerary.id, userId);
}

/**
 * Format itinerary for API response
 */
function formatItinerary(itinerary) {
  return {
    id: itinerary.id,
    title: itinerary.title,
    destination: itinerary.destination,
    startDate: itinerary.start_date,
    endDate: itinerary.end_date,
    mood: itinerary.mood,
    status: itinerary.status,
    isPublic: itinerary.is_public,
    createdAt: itinerary.created_at,
    updatedAt: itinerary.updated_at,
  };
}

/**
 * Format item for API response
 */
function formatItem(item) {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    locationName: item.location_name,
    scheduledDate: item.scheduled_date,
    startTime: item.start_time,
    endTime: item.end_time,
    category: item.category,
    isFlexible: item.is_flexible,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}
