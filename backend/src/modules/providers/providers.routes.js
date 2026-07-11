import { Router } from 'express';
import * as providersController from './providers.controller.js';
import { authenticate } from '../../shared/middleware/auth.js';
import { strictRateLimiter } from '../../shared/middleware/rateLimiter.js';
import { validate } from '../../shared/middleware/validate.js';
import { onboardingSchema } from './providers.schemas.js';

const router = Router();

router.use(authenticate);
router.get('/me', providersController.getMine);
router.post(
  '/onboarding-link',
  strictRateLimiter,
  validate(onboardingSchema),
  providersController.createOnboardingLink
);

export default router;
