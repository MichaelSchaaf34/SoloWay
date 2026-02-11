/**
 * User routes
 */

import { Router } from 'express';
import * as usersController from './users.controller.js';
import { validate } from '../../shared/middleware/validate.js';
import { authenticate } from '../../shared/middleware/auth.js';
import { updateProfileSchema, updateLocationSchema, updateVisibilitySchema, addContactSchema } from './users.schemas.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Profile routes
router.get('/profile', usersController.getProfile);
router.patch('/profile', validate(updateProfileSchema), usersController.updateProfile);
router.delete('/profile', usersController.deleteAccount);

// Location routes
router.patch('/location', validate(updateLocationSchema), usersController.updateLocation);
router.patch('/visibility', validate(updateVisibilitySchema), usersController.updateVisibility);

// Trusted contacts routes
router.get('/contacts', usersController.getTrustedContacts);
router.post('/contacts', validate(addContactSchema), usersController.addTrustedContact);
router.delete('/contacts/:contactId', usersController.removeTrustedContact);

export default router;
