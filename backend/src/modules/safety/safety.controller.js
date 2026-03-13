/**
 * Safety controller - Safety Guardian feature
 */

import * as safetyService from './safety.service.js';

/**
 * Create immediate check-in
 */
export async function createCheckin(req, res, next) {
  try {
    const { latitude, longitude, locationName, notes } = req.body;
    const checkin = await safetyService.createCheckin(req.userId, {
      latitude,
      longitude,
      locationName,
      notes,
    });
    res.status(201).json({
      success: true,
      data: { checkin },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Schedule future check-in
 */
export async function scheduleCheckin(req, res, next) {
  try {
    const checkin = await safetyService.scheduleCheckin(req.userId, req.body);
    res.status(201).json({
      success: true,
      data: { checkin },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get check-in history
 */
export async function getCheckinHistory(req, res, next) {
  try {
    const { limit = 20, cursor } = req.query;
    const result = await safetyService.getCheckinHistory(req.userId, { limit, cursor });
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get pending scheduled check-ins
 */
export async function getPendingCheckins(req, res, next) {
  try {
    const checkins = await safetyService.getPendingCheckins(req.userId);
    res.json({
      success: true,
      data: { checkins },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Complete a scheduled check-in
 */
export async function completeScheduledCheckin(req, res, next) {
  try {
    const checkin = await safetyService.completeScheduledCheckin(
      req.userId,
      req.params.checkinId
    );
    res.json({
      success: true,
      data: { checkin },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Cancel a scheduled check-in
 */
export async function cancelCheckin(req, res, next) {
  try {
    await safetyService.cancelCheckin(req.userId, req.params.checkinId);
    res.json({
      success: true,
      message: 'Check-in cancelled',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get safety score for location
 */
export async function getSafetyScore(req, res, next) {
  try {
    const { latitude, longitude } = req.query;
    const safetyData = await safetyService.getSafetyScore(latitude, longitude);
    res.json({
      success: true,
      data: safetyData,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Trigger emergency alert
 */
export async function triggerEmergency(req, res, next) {
  try {
    const { latitude, longitude, message } = req.body;
    const emergency = await safetyService.triggerEmergency(req.userId, {
      latitude,
      longitude,
      message,
    });
    res.status(201).json({
      success: true,
      data: { emergency },
      message: 'Emergency alert sent to your trusted contacts',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Cancel emergency alert
 */
export async function cancelEmergency(req, res, next) {
  try {
    await safetyService.cancelEmergency(req.userId);
    res.json({
      success: true,
      message: 'Emergency alert cancelled, contacts notified',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current safety status
 */
export async function getSafetyStatus(req, res, next) {
  try {
    const status = await safetyService.getSafetyStatus(req.userId);
    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
}
