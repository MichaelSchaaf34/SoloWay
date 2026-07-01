/**
 * Waitlist routes
 */

import { Router } from 'express';
import * as waitlistController from './waitlist.controller.js';
import { validate } from '../../shared/middleware/validate.js';
import { strictRateLimiter } from '../../shared/middleware/rateLimiter.js';
import { joinWaitlistSchema } from './waitlist.schemas.js';

const router = Router();

// Public route with strict rate limiting
router.post(
  '/',
  strictRateLimiter,
  validate(joinWaitlistSchema),
  waitlistController.joinWaitlist
);

export default router;
