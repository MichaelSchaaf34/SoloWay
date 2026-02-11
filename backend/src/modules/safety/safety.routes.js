/**
 * Safety routes - Safety Guardian feature
 */

import { Router } from 'express';
import * as safetyController from './safety.controller.js';
import { validate } from '../../shared/middleware/validate.js';
import { authenticate, optionalAuth } from '../../shared/middleware/auth.js';
import { lenientRateLimiter } from '../../shared/middleware/rateLimiter.js';
import {
  createCheckinSchema,
  scheduleCheckinSchema,
  getSafetyScoreSchema,
  triggerEmergencySchema,
} from './safety.schemas.js';

const router = Router();

// Public route - get safety score for an area
router.get(
  '/score',
  lenientRateLimiter,
  optionalAuth,
  validate(getSafetyScoreSchema),
  safetyController.getSafetyScore
);

// Protected routes
router.use(authenticate);

// Check-in management
router.post(
  '/checkin',
  validate(createCheckinSchema),
  safetyController.createCheckin
);

router.post(
  '/checkin/schedule',
  validate(scheduleCheckinSchema),
  safetyController.scheduleCheckin
);

router.get(
  '/checkins',
  safetyController.getCheckinHistory
);

router.get(
  '/checkins/pending',
  safetyController.getPendingCheckins
);

router.post(
  '/checkins/:checkinId/complete',
  safetyController.completeScheduledCheckin
);

router.delete(
  '/checkins/:checkinId',
  safetyController.cancelCheckin
);

// Emergency
router.post(
  '/emergency',
  validate(triggerEmergencySchema),
  safetyController.triggerEmergency
);

router.post(
  '/emergency/cancel',
  safetyController.cancelEmergency
);

// Safety status
router.get(
  '/status',
  safetyController.getSafetyStatus
);

export default router;
