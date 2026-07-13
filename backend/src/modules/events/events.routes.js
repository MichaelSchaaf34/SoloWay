import { Router } from 'express';
import * as eventsController from './events.controller.js';
import { validate } from '../../shared/middleware/validate.js';
import { listEventsSchema } from './events.schemas.js';

const router = Router();

// Public — destination pages are browsable without an account.
router.get('/', validate(listEventsSchema), eventsController.list);

export default router;
