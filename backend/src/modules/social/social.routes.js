/**
 * Social routes - Social Radar feature
 */

import { Router } from 'express';
import * as socialController from './social.controller.js';
import { validate } from '../../shared/middleware/validate.js';
import { authenticate } from '../../shared/middleware/auth.js';
import {
  getNearbySchema,
  sendConnectionSchema,
  respondConnectionSchema,
  sendMessageSchema,
  connectionIdSchema,
  userIdParamSchema,
  getConversationSchema,
} from './social.schemas.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Nearby travelers (Social Radar)
router.get(
  '/nearby',
  validate(getNearbySchema),
  socialController.getNearbyTravelers
);

// Connections
router.get(
  '/connections',
  socialController.getConnections
);

router.get(
  '/connections/pending',
  socialController.getPendingConnections
);

router.post(
  '/connections',
  validate(sendConnectionSchema),
  socialController.sendConnectionRequest
);

router.post(
  '/connections/:connectionId/respond',
  validate(respondConnectionSchema),
  socialController.respondToConnection
);

router.delete(
  '/connections/:connectionId',
  validate(connectionIdSchema),
  socialController.removeConnection
);

router.post(
  '/connections/:userId/block',
  validate(userIdParamSchema),
  socialController.blockUser
);

// Messages
router.get(
  '/messages/:userId',
  validate(getConversationSchema),
  socialController.getConversation
);

router.post(
  '/messages/:userId',
  validate(sendMessageSchema),
  socialController.sendMessage
);

router.post(
  '/messages/:userId/read',
  validate(userIdParamSchema),
  socialController.markAsRead
);

// Profile visibility
router.get(
  '/profile/:userId',
  validate(userIdParamSchema),
  socialController.getPublicProfile
);

export default router;
