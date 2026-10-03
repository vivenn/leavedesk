import { Router } from 'express';
import { validate } from '../../shared/middleware/validate.js';
import { authenticate } from './auth.middleware.js';
import { loginSchema, changePasswordSchema } from './auth.validation.js';
import * as authController from './auth.controller.js';

const router = Router();

router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);

export default router;
