import { Router } from 'express';
import { validate } from '../../shared/middleware/validate.js';
import { authenticate, authorize } from '../auth/auth.middleware.js';
import { createLeaveTypeSchema, updateLeaveTypeSchema } from './leave-type.validation.js';
import * as leaveTypeController from './leave-type.controller.js';
import { ROLES } from '../../config/constants.js';

const router = Router();

router.use(authenticate);

router.get('/', leaveTypeController.listLeaveTypes);
router.get('/:id', leaveTypeController.getLeaveTypeById);
router.post('/', authorize(ROLES.ADMIN), validate(createLeaveTypeSchema), leaveTypeController.createLeaveType);
router.put('/:id', authorize(ROLES.ADMIN), validate(updateLeaveTypeSchema), leaveTypeController.updateLeaveType);
router.delete('/:id', authorize(ROLES.ADMIN), leaveTypeController.deleteLeaveType);

export default router;
