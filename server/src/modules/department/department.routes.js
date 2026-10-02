import { Router } from 'express';
import { validate } from '../../shared/middleware/validate.js';
import { authenticate, authorize } from '../auth/auth.middleware.js';
import { createDepartmentSchema, updateDepartmentSchema } from './department.validation.js';
import * as deptController from './department.controller.js';
import { ROLES } from '../../config/constants.js';

const router = Router();

router.use(authenticate);

router.get('/', deptController.listDepartments);
router.get('/:id', deptController.getDepartmentById);
router.post('/', authorize(ROLES.ADMIN), validate(createDepartmentSchema), deptController.createDepartment);
router.put('/:id', authorize(ROLES.ADMIN), validate(updateDepartmentSchema), deptController.updateDepartment);
router.delete('/:id', authorize(ROLES.ADMIN), deptController.deleteDepartment);

export default router;
