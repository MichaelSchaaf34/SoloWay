import { Router } from 'express';
import * as experiencesController from './experiences.controller.js';
import { authenticate } from '../../shared/middleware/auth.js';
import { validate } from '../../shared/middleware/validate.js';
import {
  createExperienceSchema,
  listExperiencesSchema,
  updateExperienceSchema,
} from './experiences.schemas.js';

const router = Router();

router.get('/', validate(listExperiencesSchema), experiencesController.list);
router.post('/', authenticate, validate(createExperienceSchema), experiencesController.create);
router.patch(
  '/:experienceId',
  authenticate,
  validate(updateExperienceSchema),
  experiencesController.update
);

export default router;
