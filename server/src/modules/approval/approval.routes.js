import { Router } from 'express';
import { validate } from '../../shared/middleware/validate.js';
import { authenticate, authorize } from '../auth/auth.middleware.js';
import { approvalActionSchema, remarksRequiredSchema } from './approval.validation.js';
import * as approvalController from './approval.controller.js';
import { ROLES } from '../../config/constants.js';

const router = Router();

router.use(authenticate);

router.get('/pending', authorize(ROLES.MANAGER, ROLES.ADMIN), approvalController.getPendingApprovals);
router.patch('/:leaveRequestId/approve', authorize(ROLES.MANAGER, ROLES.ADMIN), validate(approvalActionSchema), approvalController.approveRequest);
router.patch('/:leaveRequestId/reject', authorize(ROLES.MANAGER, ROLES.ADMIN), validate(approvalActionSchema), approvalController.rejectRequest);
router.patch('/:leaveRequestId/escalate', authorize(ROLES.MANAGER), validate(approvalActionSchema), approvalController.escalateRequest);
router.patch('/:leaveRequestId/request-changes', authorize(ROLES.MANAGER, ROLES.ADMIN), validate(remarksRequiredSchema), approvalController.requestChanges);
router.get('/:leaveRequestId/history', authenticate, approvalController.getApprovalHistory);

export default router;
