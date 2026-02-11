/**
 * Authentication routes
 */

import { Router } from 'express';
import * as authController from './auth.controller.js';
import { validate } from '../../shared/middleware/validate.js';
import { authenticate } from '../../shared/middleware/auth.js';
import { strictRateLimiter } from '../../shared/middleware/rateLimiter.js';
import { registerSchema, loginSchema, refreshTokenSchema, forgotPasswordSchema, resetPasswordSchema } from './auth.schemas.js';

const router = Router();

// Public routes with strict rate limiting
router.post(
  '/register',
  strictRateLimiter,
  validate(registerSchema),
  authController.register
);

router.post(
  '/login',
  strictRateLimiter,
  validate(loginSchema),
  authController.login
);

router.post(
  '/refresh',
  validate(refreshTokenSchema),
  authController.refreshToken
);

router.post(
  '/forgot-password',
  strictRateLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword
);

router.post(
  '/reset-password',
  strictRateLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword
);

// Protected routes
router.post(
  '/logout',
  authenticate,
  authController.logout
);

router.get(
  '/me',
  authenticate,
  authController.getCurrentUser
);

router.post(
  '/change-password',
  authenticate,
  strictRateLimiter,
  authController.changePassword
);

export default router;
