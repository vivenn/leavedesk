import { Router } from 'express';
import { validate, validateQuery } from '../../shared/middleware/validate.js';
import { authenticate, authorize } from '../auth/auth.middleware.js';
import { createLeaveRequestSchema, listLeaveRequestsQuerySchema } from './leave-request.validation.js';
import * as leaveRequestController from './leave-request.controller.js';
import { ROLES } from '../../config/constants.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(createLeaveRequestSchema), leaveRequestController.applyLeave);
router.get('/', validateQuery(listLeaveRequestsQuerySchema), leaveRequestController.getMyRequests);
router.get('/team', authorize(ROLES.MANAGER, ROLES.ADMIN), leaveRequestController.getTeamRequests);
router.get('/all', authorize(ROLES.ADMIN), validateQuery(listLeaveRequestsQuerySchema), leaveRequestController.getAllRequests);
router.get('/:id', leaveRequestController.getRequestById);
router.patch('/:id/cancel', leaveRequestController.cancelRequest);

export default router;
