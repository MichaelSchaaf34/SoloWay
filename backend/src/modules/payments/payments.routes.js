import { Router } from 'express';
import * as paymentsController from './payments.controller.js';
import { authenticate } from '../../shared/middleware/auth.js';
import { strictRateLimiter } from '../../shared/middleware/rateLimiter.js';
import { validate } from '../../shared/middleware/validate.js';
import {
  createCheckoutSchema,
  orderIdSchema,
  refundOrderSchema,
} from './payments.schemas.js';

const router = Router();

router.use(authenticate);
router.post(
  '/checkout',
  strictRateLimiter,
  validate(createCheckoutSchema),
  paymentsController.createCheckout
);
router.get('/orders/:orderId', validate(orderIdSchema), paymentsController.getOrder);
router.post(
  '/orders/:orderId/refund',
  strictRateLimiter,
  validate(refundOrderSchema),
  paymentsController.refundOrder
);

export default router;
