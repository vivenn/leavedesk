import { Router } from 'express';
import { validate, validateQuery } from '../../shared/middleware/validate.js';
import { authenticate, authorize } from '../auth/auth.middleware.js';
import { createUserSchema, updateUserSchema, listUsersQuerySchema } from './user.validation.js';
import * as userController from './user.controller.js';
import { ROLES } from '../../config/constants.js';

const router = Router();

router.use(authenticate);

router.get('/me', userController.getProfile);
router.get('/', authorize(ROLES.ADMIN), validateQuery(listUsersQuerySchema), userController.listUsers);
router.get('/:id', authorize(ROLES.ADMIN), userController.getUserById);
router.post('/', authorize(ROLES.ADMIN), validate(createUserSchema), userController.createUser);
router.put('/:id', authorize(ROLES.ADMIN), validate(updateUserSchema), userController.updateUser);
router.delete('/:id', authorize(ROLES.ADMIN), userController.deleteUser);
router.get('/:id/team', authorize(ROLES.MANAGER, ROLES.ADMIN), userController.getTeam);

export default router;
