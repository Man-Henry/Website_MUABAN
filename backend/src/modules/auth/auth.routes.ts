/**
 * @fileoverview Auth routes.
 */

import { Router } from 'express';
import { authController } from './auth.controller.js';
import { requireAuth } from '../../shared/middlewares/auth.middleware.js';
import { validateBody } from '../../shared/middlewares/validate.middleware.js';
import { loginSchema, registerSchema } from './auth.validation.js';

const router = Router();

router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login', validateBody(loginSchema), authController.login);
router.post('/logout', requireAuth, authController.logout);
router.post('/refresh', authController.refresh);
router.get('/me', requireAuth, authController.getMe);

export default router;
