import { Router } from 'express';
import * as adminController from './admin.controller.js';
import { authenticate, requireAdmin } from '../../shared/middleware/auth.js';
import { validate } from '../../shared/middleware/validate.js';
import {
  listUsersSchema,
  userIdSchema,
  listWaitlistSchema,
  listExperiencesSchema,
  updateExperienceSchema,
  listOrdersSchema,
  orderIdSchema,
  refundOrderSchema,
  listReviewsSchema,
  reviewIdSchema,
  listAuditLogSchema,
} from './admin.schemas.js';

const router = Router();

// Every admin route requires an authenticated admin user.
router.use(authenticate, requireAdmin);

// Dashboard
router.get('/stats', adminController.getStats);

// Users
router.get('/users', validate(listUsersSchema), adminController.listUsers);
router.get('/users/:userId', validate(userIdSchema), adminController.getUserDetail);
router.delete('/users/:userId', validate(userIdSchema), adminController.deleteUser);

// Waitlist
router.get('/waitlist', validate(listWaitlistSchema), adminController.listWaitlist);

// Providers & experiences
router.get('/providers', adminController.listProviders);
router.get('/experiences', validate(listExperiencesSchema), adminController.listExperiences);
router.patch('/experiences/:experienceId', validate(updateExperienceSchema), adminController.updateExperience);

// Orders & refunds
router.get('/orders', validate(listOrdersSchema), adminController.listOrders);
router.get('/orders/:orderId', validate(orderIdSchema), adminController.getOrderDetail);
router.post('/orders/:orderId/refund', validate(refundOrderSchema), adminController.refundOrder);

// Reviews
router.get('/reviews', validate(listReviewsSchema), adminController.listReviews);
router.delete('/reviews/:reviewId', validate(reviewIdSchema), adminController.deleteReview);

// Audit log
router.get('/audit-log', validate(listAuditLogSchema), adminController.listAuditLog);

export default router;
