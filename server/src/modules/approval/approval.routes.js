import { Router } from 'express';
import { validate } from '../../shared/middleware/validate.js';
import { authenticate, authorize } from '../auth/auth.middleware.js';
import { approvalActionSchema } from './approval.validation.js';
import * as approvalController from './approval.controller.js';
import { ROLES } from '../../config/constants.js';

const router = Router();

router.use(authenticate);

router.get('/pending', authorize(ROLES.MANAGER, ROLES.ADMIN), approvalController.getPendingApprovals);
router.patch('/:leaveRequestId/approve', authorize(ROLES.MANAGER, ROLES.ADMIN), validate(approvalActionSchema), approvalController.approveRequest);
router.patch('/:leaveRequestId/reject', authorize(ROLES.MANAGER, ROLES.ADMIN), validate(approvalActionSchema), approvalController.rejectRequest);
router.get('/:leaveRequestId/history', authenticate, approvalController.getApprovalHistory);

export default router;
