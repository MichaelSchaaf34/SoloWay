import { Router } from 'express';
import * as reviewsController from './reviews.controller.js';
import { authenticate } from '../../shared/middleware/auth.js';
import { validate } from '../../shared/middleware/validate.js';
import {
  createReviewSchema,
  listReviewsSchema,
  reviewIdSchema,
} from './reviews.schemas.js';

const router = Router();

// Reading reviews is public; writing requires an account.
router.get('/', validate(listReviewsSchema), reviewsController.list);
router.post('/', authenticate, validate(createReviewSchema), reviewsController.create);
router.delete('/:reviewId', authenticate, validate(reviewIdSchema), reviewsController.remove);

export default router;
