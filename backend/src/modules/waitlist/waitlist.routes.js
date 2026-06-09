import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as controller from './waitlist.controller.js';
import { validate } from '../../shared/middleware/validate.js';
import { joinWaitlistSchema } from './waitlist.schemas.js';

const router = Router();

// Guard public signup from abuse independently of the global limiter.
const joinLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many waitlist submissions. Please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', joinLimiter, validate(joinWaitlistSchema), controller.join);

export default router;
