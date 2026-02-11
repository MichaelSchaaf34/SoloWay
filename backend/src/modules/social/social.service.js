/**
 * Social service - Social Radar feature
 * Handles nearby travelers, connections, and messaging
 */

import { getSupabaseAdmin } from '../../shared/database/supabase.js';
import { query } from '../../shared/database/index.js';
import { cache, cacheKeys } from '../../shared/cache/redis.js';
import { emitToUser } from '../../shared/realtime/websocket.js';
import { NotFoundError, AuthorizationError, ConflictError } from '../../shared/middleware/errorHandler.js';

/**
 * Get nearby travelers using PostGIS
 */
export async function getNearbyTravelers(userId, latitude, longitude, radiusKm = 5, limit = 20) {
  const radiusMeters = radiusKm * 1000;

  // Find visible users within radius
  const result = await query(
    `SELECT 
       u.id, 
       u.display_name, 
       u.avatar_url,
       u.visibility_mode,
       ST_Distance(u.current_location, ST_MakePoint($1, $2)::geography) as distance,
       u.last_seen_at
     FROM users u
     WHERE u.id != $3
       AND u.current_location IS NOT NULL
       AND u.visibility_mode = 'visible'
       AND u.last_seen_at > NOW() - INTERVAL '24 hours'
       AND ST_DWithin(u.current_location, ST_MakePoint($1, $2)::geography, $4)
       AND NOT EXISTS (
         SELECT 1 FROM connections c 
         WHERE c.status = 'blocked'
         AND ((c.requester_id = $3 AND c.recipient_id = u.id) 
              OR (c.recipient_id = $3 AND c.requester_id = u.id))
       )
     ORDER BY distance ASC
     LIMIT $5`,
    [longitude, latitude, userId, radiusMeters, limit]
  );

  return result.rows.map(row => ({
    id: row.id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    distance: Math.round(row.distance),
    lastSeenAt: row.last_seen_at,
  }));
}

/**
 * Get user's accepted connections
 */
export async function getConnections(userId) {
  const supabase = getSupabaseAdmin();

  const { data: connections, error } = await supabase
    .from('connections')
    .select(`
      id,
      requester_id,
      recipient_id,
      created_at,
      requester:users!connections_requester_id_fkey(id, display_name, avatar_url, last_seen_at),
      recipient:users!connections_recipient_id_fkey(id, display_name, avatar_url, last_seen_at)
    `)
    .eq('status', 'accepted')
    .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error('Failed to fetch connections');
  }

  return connections.map(conn => {
    const otherUser = conn.requester_id === userId ? conn.recipient : conn.requester;
    return {
      connectionId: conn.id,
      user: {
        id: otherUser.id,
        displayName: otherUser.display_name,
        avatarUrl: otherUser.avatar_url,
        lastSeenAt: otherUser.last_seen_at,
      },
      connectedAt: conn.created_at,
    };
  });
}

/**
 * Get pending connection requests
 */
export async function getPendingConnections(userId) {
  const supabase = getSupabaseAdmin();

  // Requests sent by user
  const { data: sent } = await supabase
    .from('connections')
    .select(`
      id,
      recipient:users!connections_recipient_id_fkey(id, display_name, avatar_url),
      created_at
    `)
    .eq('requester_id', userId)
    .eq('status', 'pending');

  // Requests received by user
  const { data: received } = await supabase
    .from('connections')
    .select(`
      id,
      requester:users!connections_requester_id_fkey(id, display_name, avatar_url),
      created_at
    `)
    .eq('recipient_id', userId)
    .eq('status', 'pending');

  return {
    sent: (sent || []).map(c => ({
      connectionId: c.id,
      user: {
        id: c.recipient.id,
        displayName: c.recipient.display_name,
        avatarUrl: c.recipient.avatar_url,
      },
      sentAt: c.created_at,
    })),
    received: (received || []).map(c => ({
      connectionId: c.id,
      user: {
        id: c.requester.id,
        displayName: c.requester.display_name,
        avatarUrl: c.requester.avatar_url,
      },
      receivedAt: c.created_at,
    })),
  };
}

/**
 * Send connection request
 */
export async function sendConnectionRequest(requesterId, recipientId, message) {
  if (requesterId === recipientId) {
    throw new ConflictError('Cannot connect with yourself');
  }

  const supabase = getSupabaseAdmin();

  // Check if connection already exists
  const { data: existing } = await supabase
    .from('connections')
    .select('id, status')
    .or(`and(requester_id.eq.${requesterId},recipient_id.eq.${recipientId}),and(requester_id.eq.${recipientId},recipient_id.eq.${requesterId})`)
    .single();

  if (existing) {
    if (existing.status === 'blocked') {
      throw new AuthorizationError('Cannot connect with this user');
    }
    throw new ConflictError('Connection already exists');
  }

  // Create connection request
  const { data: connection, error } = await supabase
    .from('connections')
    .insert({
      requester_id: requesterId,
      recipient_id: recipientId,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    throw new Error('Failed to send connection request');
  }

  // Notify recipient in real-time
  emitToUser(recipientId, 'connection:request', {
    connectionId: connection.id,
    fromUserId: requesterId,
    message,
    timestamp: new Date().toISOString(),
  });

  return {
    id: connection.id,
    status: connection.status,
    createdAt: connection.created_at,
  };
}

/**
 * Respond to connection request
 */
export async function respondToConnection(userId, connectionId, accept) {
  const supabase = getSupabaseAdmin();

  // Verify this request is for the user
  const { data: connection } = await supabase
    .from('connections')
    .select('*')
    .eq('id', connectionId)
    .eq('recipient_id', userId)
    .eq('status', 'pending')
    .single();

  if (!connection) {
    throw new NotFoundError('Connection request');
  }

  const newStatus = accept ? 'accepted' : 'pending'; // 'pending' will be deleted

  if (!accept) {
    // Delete declined requests
    await supabase
      .from('connections')
      .delete()
      .eq('id', connectionId);

    return { id: connectionId, status: 'declined' };
  }

  // Accept connection
  const { data: updated, error } = await supabase
    .from('connections')
    .update({ status: 'accepted' })
    .eq('id', connectionId)
    .select()
    .single();

  if (error) {
    throw new Error('Failed to update connection');
  }

  // Notify requester
  emitToUser(connection.requester_id, 'connection:accepted', {
    connectionId,
    byUserId: userId,
    timestamp: new Date().toISOString(),
  });

  return {
    id: updated.id,
    status: updated.status,
    updatedAt: updated.updated_at,
  };
}

/**
 * Remove connection
 */
export async function removeConnection(userId, connectionId) {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from('connections')
    .delete()
    .eq('id', connectionId)
    .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`);

  if (error) {
    throw new Error('Failed to remove connection');
  }
}

/**
 * Block user
 */
export async function blockUser(userId, blockedUserId) {
  if (userId === blockedUserId) {
    throw new ConflictError('Cannot block yourself');
  }

  const supabase = getSupabaseAdmin();

  // Upsert connection as blocked
  const { error } = await supabase
    .from('connections')
    .upsert({
      requester_id: userId,
      recipient_id: blockedUserId,
      status: 'blocked',
    }, {
      onConflict: 'requester_id,recipient_id',
    });

  if (error) {
    throw new Error('Failed to block user');
  }
}

/**
 * Get conversation with another user
 */
export async function getConversation(userId, otherUserId, options = {}) {
  const { limit = 50, cursor } = options;

  // Verify connection exists (must be connected to message)
  await verifyConnection(userId, otherUserId);

  const supabase = getSupabaseAdmin();

  let queryBuilder = supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`)
    .order('created_at', { ascending: false })
    .limit(limit + 1);

  if (cursor) {
    queryBuilder = queryBuilder.lt('created_at', cursor);
  }

  const { data: messages, error } = await queryBuilder;

  if (error) {
    throw new Error('Failed to fetch messages');
  }

  const hasMore = messages.length > limit;
  const results = hasMore ? messages.slice(0, -1) : messages;

  return {
    messages: results.map(m => ({
      id: m.id,
      senderId: m.sender_id,
      content: m.content,
      readAt: m.read_at,
      createdAt: m.created_at,
      isOwn: m.sender_id === userId,
    })).reverse(), // Oldest first for display
    pagination: {
      hasMore,
      nextCursor: hasMore ? results[results.length - 1].created_at : null,
    },
  };
}

/**
 * Send message
 */
export async function sendMessage(senderId, recipientId, content) {
  // Verify connection exists
  await verifyConnection(senderId, recipientId);

  const supabase = getSupabaseAdmin();

  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      sender_id: senderId,
      recipient_id: recipientId,
      content,
    })
    .select()
    .single();

  if (error) {
    throw new Error('Failed to send message');
  }

  // Notify recipient in real-time
  emitToUser(recipientId, 'message:new', {
    id: message.id,
    senderId,
    content,
    createdAt: message.created_at,
  });

  return {
    id: message.id,
    senderId: message.sender_id,
    content: message.content,
    createdAt: message.created_at,
  };
}

/**
 * Mark messages as read
 */
export async function markAsRead(userId, senderId) {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('recipient_id', userId)
    .eq('sender_id', senderId)
    .is('read_at', null);

  if (error) {
    throw new Error('Failed to mark messages as read');
  }

  // Notify sender that messages were read
  emitToUser(senderId, 'message:read', {
    byUserId: userId,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Get public profile (what others see)
 */
export async function getPublicProfile(requesterId, profileUserId) {
  const supabase = getSupabaseAdmin();

  // Check if blocked
  const { data: blocked } = await supabase
    .from('connections')
    .select('id')
    .eq('status', 'blocked')
    .or(`and(requester_id.eq.${requesterId},recipient_id.eq.${profileUserId}),and(requester_id.eq.${profileUserId},recipient_id.eq.${requesterId})`)
    .single();

  if (blocked) {
    throw new NotFoundError('User');
  }

  // Get user profile
  const { data: user, error } = await supabase
    .from('users')
    .select('id, display_name, avatar_url, visibility_mode, created_at')
    .eq('id', profileUserId)
    .single();

  if (error || !user) {
    throw new NotFoundError('User');
  }

  // Check connection status
  const { data: connection } = await supabase
    .from('connections')
    .select('id, status, requester_id')
    .or(`and(requester_id.eq.${requesterId},recipient_id.eq.${profileUserId}),and(requester_id.eq.${profileUserId},recipient_id.eq.${requesterId})`)
    .single();

  let connectionStatus = 'none';
  if (connection) {
    if (connection.status === 'accepted') {
      connectionStatus = 'connected';
    } else if (connection.status === 'pending') {
      connectionStatus = connection.requester_id === requesterId ? 'pending_sent' : 'pending_received';
    }
  }

  return {
    id: user.id,
    displayName: user.display_name,
    avatarUrl: user.avatar_url,
    isVisible: user.visibility_mode === 'visible',
    memberSince: user.created_at,
    connectionStatus,
    connectionId: connection?.id,
  };
}

/**
 * Verify users are connected
 */
async function verifyConnection(userId1, userId2) {
  const supabase = getSupabaseAdmin();

  const { data: connection } = await supabase
    .from('connections')
    .select('id')
    .eq('status', 'accepted')
    .or(`and(requester_id.eq.${userId1},recipient_id.eq.${userId2}),and(requester_id.eq.${userId2},recipient_id.eq.${userId1})`)
    .single();

  if (!connection) {
    throw new AuthorizationError('You must be connected to interact with this user');
  }

  return connection;
}
