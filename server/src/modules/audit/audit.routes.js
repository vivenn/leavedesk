import { Router } from 'express';
import { authenticate, authorize } from '../auth/auth.middleware.js';
import { ROLES } from '../../config/constants.js';
import * as auditController from './audit.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize(ROLES.ADMIN), auditController.getAuditLogs);

export default router;
