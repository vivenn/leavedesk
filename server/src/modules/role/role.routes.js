import { Router } from 'express';
import { authenticate, authorize } from '../auth/auth.middleware.js';
import * as roleController from './role.controller.js';
import { ROLES } from '../../config/constants.js';

const router = Router();

router.use(authenticate);
router.get('/', authorize(ROLES.ADMIN), roleController.listRoles);

export default router;
