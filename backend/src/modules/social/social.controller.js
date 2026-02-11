/**
 * Social controller - Social Radar feature
 */

import * as socialService from './social.service.js';

/**
 * Get nearby travelers
 */
export async function getNearbyTravelers(req, res, next) {
  try {
    const { latitude, longitude, radiusKm, limit } = req.query;
    const travelers = await socialService.getNearbyTravelers(
      req.userId,
      latitude,
      longitude,
      radiusKm,
      limit
    );
    res.json({
      success: true,
      data: { travelers },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get user's connections
 */
export async function getConnections(req, res, next) {
  try {
    const connections = await socialService.getConnections(req.userId);
    res.json({
      success: true,
      data: { connections },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get pending connection requests
 */
export async function getPendingConnections(req, res, next) {
  try {
    const { sent, received } = await socialService.getPendingConnections(req.userId);
    res.json({
      success: true,
      data: { sent, received },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Send connection request
 */
export async function sendConnectionRequest(req, res, next) {
  try {
    const { recipientId, message } = req.body;
    const connection = await socialService.sendConnectionRequest(
      req.userId,
      recipientId,
      message
    );
    res.status(201).json({
      success: true,
      data: { connection },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Respond to connection request
 */
export async function respondToConnection(req, res, next) {
  try {
    const { connectionId } = req.params;
    const { accept } = req.body;
    const connection = await socialService.respondToConnection(
      req.userId,
      connectionId,
      accept
    );
    res.json({
      success: true,
      data: { connection },
      message: accept ? 'Connection accepted' : 'Connection declined',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Remove connection
 */
export async function removeConnection(req, res, next) {
  try {
    await socialService.removeConnection(req.userId, req.params.connectionId);
    res.json({
      success: true,
      message: 'Connection removed',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Block user
 */
export async function blockUser(req, res, next) {
  try {
    await socialService.blockUser(req.userId, req.params.userId);
    res.json({
      success: true,
      message: 'User blocked',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get conversation with user
 */
export async function getConversation(req, res, next) {
  try {
    const { limit = 50, cursor } = req.query;
    const result = await socialService.getConversation(
      req.userId,
      req.params.userId,
      { limit, cursor }
    );
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Send message
 */
export async function sendMessage(req, res, next) {
  try {
    const { content } = req.body;
    const message = await socialService.sendMessage(
      req.userId,
      req.params.userId,
      content
    );
    res.status(201).json({
      success: true,
      data: { message },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Mark messages as read
 */
export async function markAsRead(req, res, next) {
  try {
    await socialService.markAsRead(req.userId, req.params.userId);
    res.json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get public profile
 */
export async function getPublicProfile(req, res, next) {
  try {
    const profile = await socialService.getPublicProfile(
      req.userId,
      req.params.userId
    );
    res.json({
      success: true,
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
}
