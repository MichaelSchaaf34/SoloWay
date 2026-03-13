import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as controller from './buddy.controller.js';
import { authenticate } from '../../shared/middleware/auth.js';
import { validate } from '../../shared/middleware/validate.js';
import {
  createInviteSchema,
  tokenParamSchema,
  linkIdParamSchema,
  historyQuerySchema,
  phoneVerifyWithTokenSchema,
  codeConfirmWithTokenSchema,
  connectionRespondWithParamSchema,
} from './buddy.schemas.js';

const router = Router();

const guestVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many verification attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const guestConfirmLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many confirmation attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// HOST-SIDE (authenticated)
router.post('/invite', authenticate, validate(createInviteSchema), controller.createInvite);
router.get('/invite/:token', authenticate, validate(tokenParamSchema), controller.getInviteDetails);
router.delete('/invite/:token', authenticate, validate(tokenParamSchema), controller.cancelInvite);
router.patch('/link/:linkId/close', authenticate, validate(linkIdParamSchema), controller.closeLink);
router.get('/history', authenticate, validate(historyQuerySchema), controller.getHistory);
router.get('/history/:linkId', authenticate, validate(linkIdParamSchema), controller.getHistoryDetail);

// GUEST-SIDE (public, rate-limited)
router.get('/join/:token', validate(tokenParamSchema), controller.joinPreview);
router.post('/join/:token/verify', guestVerifyLimiter, validate(phoneVerifyWithTokenSchema), controller.verifyPhone);
router.post('/join/:token/confirm', guestConfirmLimiter, validate(codeConfirmWithTokenSchema), controller.confirmCode);

// POST-EVENT (authenticated)
router.post('/connect/:linkId', authenticate, validate(linkIdParamSchema), controller.requestConnection);
router.patch('/connect/:connectionId/respond', authenticate, validate(connectionRespondWithParamSchema), controller.respondToConnection);

export default router;
