/**
 * Itinerary routes
 */

import { Router } from 'express';
import * as itinerariesController from './itineraries.controller.js';
import { validate } from '../../shared/middleware/validate.js';
import { authenticate, optionalAuth } from '../../shared/middleware/auth.js';
import { lenientRateLimiter } from '../../shared/middleware/rateLimiter.js';
import {
  createItinerarySchema,
  updateItinerarySchema,
  addItemSchema,
  updateItemSchema,
  listItinerariesSchema,
  nearbyItinerariesSchema,
} from './itineraries.schemas.js';

const router = Router();

// Public routes (for viewing shared itineraries)
router.get(
  '/public',
  lenientRateLimiter,
  optionalAuth,
  validate(listItinerariesSchema),
  itinerariesController.getPublicItineraries
);

router.get(
  '/nearby',
  lenientRateLimiter,
  optionalAuth,
  validate(nearbyItinerariesSchema),
  itinerariesController.getNearbyItineraries
);

// Protected routes
router.use(authenticate);

// Itinerary CRUD
router.post(
  '/',
  validate(createItinerarySchema),
  itinerariesController.createItinerary
);

router.get(
  '/',
  validate(listItinerariesSchema),
  itinerariesController.getMyItineraries
);

router.get(
  '/:itineraryId',
  itinerariesController.getItinerary
);

router.patch(
  '/:itineraryId',
  validate(updateItinerarySchema),
  itinerariesController.updateItinerary
);

router.delete(
  '/:itineraryId',
  itinerariesController.deleteItinerary
);

// Itinerary items
router.post(
  '/:itineraryId/items',
  validate(addItemSchema),
  itinerariesController.addItem
);

router.patch(
  '/:itineraryId/items/:itemId',
  validate(updateItemSchema),
  itinerariesController.updateItem
);

router.delete(
  '/:itineraryId/items/:itemId',
  itinerariesController.deleteItem
);

// Itinerary actions
router.post(
  '/:itineraryId/activate',
  itinerariesController.activateItinerary
);

router.post(
  '/:itineraryId/complete',
  itinerariesController.completeItinerary
);

router.post(
  '/:itineraryId/duplicate',
  itinerariesController.duplicateItinerary
);

export default router;
