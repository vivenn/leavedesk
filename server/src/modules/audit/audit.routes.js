import { Router } from 'express';
import { authenticate, authorize } from '../auth/auth.middleware.js';
import { validateQuery } from '../../shared/middleware/validate.js';
import { listAuditLogsQuerySchema } from './audit.validation.js';
import { ROLES } from '../../config/constants.js';
import * as auditController from './audit.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize(ROLES.ADMIN), validateQuery(listAuditLogsQuerySchema), auditController.getAuditLogs);
router.get('/action-types', authorize(ROLES.ADMIN), auditController.getActionTypes);

export default router;
