/**
 * WebSocket server for real-time features
 * Handles Safety Guardian check-ins, Social Radar updates, and notifications
 */

import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { createAdapter } from '@socket.io/redis-adapter';
import { config } from '../../config/index.js';
import { getPubSubClients } from '../cache/redis.js';
import { getSupabaseAdmin } from '../database/supabase.js';

let io = null;

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const geohashRegex = /^[a-z0-9]{3,12}$/i;

const accessVerifyOptions = {
  algorithms: [config.jwt.algorithm],
  issuer: config.jwt.issuer,
  audience: config.jwt.accessAudience,
};

function isValidCoordinate(value, min, max) {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

function sanitizeText(value, maxLength) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

function verifyAccessToken(token) {
  const decoded = jwt.verify(token, config.jwt.secret, accessVerifyOptions);
  if (decoded.type && decoded.type !== 'access') {
    throw new Error('Invalid token type');
  }
  return decoded;
}

/**
 * Initialize WebSocket server
 */
export function initializeWebSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: config.cors.origin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Configure Redis adapter for horizontal scaling
  const { subscriber, publisher } = getPubSubClients();
  if (subscriber && publisher) {
    io.adapter(createAdapter(publisher, subscriber));
    console.log('WebSocket Redis adapter enabled');
  }

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = verifyAccessToken(token);
      socket.userId = decoded.userId;
      socket.user = decoded;

      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join personal room for direct messages
    socket.join(`user:${socket.userId}`);

    // Handle joining rooms
    socket.on('join:contacts', async (contactIds) => {
      // Only allow joining rooms for accepted connections
      try {
        if (!Array.isArray(contactIds) || contactIds.length === 0) return;

        const sanitizedIds = contactIds.filter(id => typeof id === 'string' && uuidRegex.test(id));
        if (sanitizedIds.length === 0) return;

        const supabase = getSupabaseAdmin();

        const { data: outgoing } = await supabase
          .from('connections')
          .select('recipient_id')
          .eq('status', 'accepted')
          .eq('requester_id', socket.userId)
          .in('recipient_id', sanitizedIds);

        const { data: incoming } = await supabase
          .from('connections')
          .select('requester_id')
          .eq('status', 'accepted')
          .eq('recipient_id', socket.userId)
          .in('requester_id', sanitizedIds);

        const allowedIds = new Set();
        (outgoing || []).forEach(conn => allowedIds.add(conn.recipient_id));
        (incoming || []).forEach(conn => allowedIds.add(conn.requester_id));

        sanitizedIds.forEach(id => {
          if (allowedIds.has(id)) {
            socket.join(`contacts:${id}`);
          }
        });
      } catch (error) {
        socket.emit('error', { code: 'ROOM_JOIN_DENIED', message: 'Unable to join contact rooms' });
      }
    });

    socket.on('join:itinerary', async (itineraryId) => {
      try {
        if (typeof itineraryId !== 'string' || !uuidRegex.test(itineraryId)) {
          socket.emit('error', { code: 'ROOM_JOIN_DENIED', message: 'Invalid itinerary id' });
          return;
        }

        const supabase = getSupabaseAdmin();
        const { data: itinerary } = await supabase
          .from('itineraries')
          .select('id, user_id, is_public')
          .eq('id', itineraryId)
          .single();

        if (itinerary && (itinerary.user_id === socket.userId || itinerary.is_public)) {
          socket.join(`itinerary:${itineraryId}`);
        } else {
          socket.emit('error', { code: 'ROOM_JOIN_DENIED', message: 'No access to itinerary room' });
        }
      } catch (error) {
        socket.emit('error', { code: 'ROOM_JOIN_DENIED', message: 'No access to itinerary room' });
      }
    });

    socket.on('join:area', (geohash) => {
      // Join geohash-based room for nearby travelers
      if (typeof geohash === 'string' && geohashRegex.test(geohash)) {
        socket.join(`area:${geohash}`);
      } else {
        socket.emit('error', { code: 'ROOM_JOIN_DENIED', message: 'Invalid area identifier' });
      }
    });

    // Handle leaving rooms
    socket.on('leave:area', (geohash) => {
      if (typeof geohash === 'string' && geohashRegex.test(geohash)) {
        socket.leave(`area:${geohash}`);
      }
    });

    // Handle location updates for Social Radar
    socket.on('location:update', async (data) => {
      if (!data || typeof data !== 'object') return;

      const { latitude, longitude, geohash } = data;
      if (!isValidCoordinate(latitude, -90, 90) || !isValidCoordinate(longitude, -180, 180)) return;
      if (typeof geohash !== 'string' || !geohashRegex.test(geohash)) return;

      // Broadcast to others in the same area
      socket.to(`area:${geohash}`).emit('traveler:nearby', {
        userId: socket.userId,
        location: { latitude, longitude },
        timestamp: new Date().toISOString(),
      });
    });

    // Handle check-in events
    socket.on('checkin:create', (checkinData) => {
      const safePayload = {
        locationName: sanitizeText(checkinData?.locationName, 200),
        notes: sanitizeText(checkinData?.notes, 500),
      };

      // Broadcast to trusted contacts
      io.to(`contacts:${socket.userId}`).emit('checkin:received', {
        userId: socket.userId,
        ...safePayload,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle emergency alerts
    socket.on('emergency:trigger', (data) => {
      const latitude = data?.latitude;
      const longitude = data?.longitude;

      const safePayload = {
        message: sanitizeText(data?.message, 500),
        location: isValidCoordinate(latitude, -90, 90) && isValidCoordinate(longitude, -180, 180)
          ? { latitude, longitude }
          : null,
      };

      // Broadcast to trusted contacts with high priority
      io.to(`contacts:${socket.userId}`).emit('emergency:alert', {
        userId: socket.userId,
        type: 'emergency',
        ...safePayload,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${socket.userId}, reason: ${reason}`);
    });
  });

  return io;
}

/**
 * Get Socket.io server instance
 */
export function getIO() {
  if (!io) {
    throw new Error('WebSocket server not initialized');
  }
  return io;
}

/**
 * Emit event to specific user
 */
export function emitToUser(userId, event, data) {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

/**
 * Emit event to all users in an area
 */
export function emitToArea(geohash, event, data) {
  if (io) {
    io.to(`area:${geohash}`).emit(event, data);
  }
}

/**
 * Emit event to trusted contacts
 */
export function emitToContacts(userId, event, data) {
  if (io) {
    io.to(`contacts:${userId}`).emit(event, data);
  }
}

/**
 * Broadcast safety alert to area
 */
export function broadcastSafetyAlert(geohash, alertData) {
  if (io) {
    io.to(`area:${geohash}`).emit('safety:alert', {
      ...alertData,
      timestamp: new Date().toISOString(),
    });
  }
}
