/**
 * @fileoverview Users routes.
 */

import { Router } from 'express';
import { usersController } from './users.controller.js';
import { requireAuth } from '../../shared/middlewares/auth.middleware.js';
import { validateBody } from '../../shared/middlewares/validate.middleware.js';
import { uploadAvatar } from '../../shared/middlewares/upload.middleware.js';
import { updateProfileSchema, changePasswordSchema } from './users.validation.js';

const router = Router();

// Protected routes
router.get('/me', requireAuth, usersController.getProfile);
router.patch('/me', requireAuth, validateBody(updateProfileSchema), usersController.updateProfile);
router.post('/me/avatar', requireAuth, uploadAvatar, usersController.uploadAvatar);
router.post('/me/password', requireAuth, validateBody(changePasswordSchema), usersController.changePassword);

// Public routes
router.get('/:userId', usersController.getPublicProfile);
router.get('/:userId/listings', usersController.getUserListings);

export default router;
