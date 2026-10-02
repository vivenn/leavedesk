import { Router } from 'express';
import { validate, validateQuery } from '../../shared/middleware/validate.js';
import { authenticate, authorize } from '../auth/auth.middleware.js';
import { ROLES } from '../../config/constants.js';
import { generateReportSchema, listReportsQuerySchema, monthQuerySchema } from './report.validation.js';
import * as reportController from './report.controller.js';

const router = Router();

router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

router.post('/generate', validate(generateReportSchema), reportController.generateReport);
router.get('/', validateQuery(listReportsQuerySchema), reportController.getReports);
router.get('/summary/overall', validateQuery(monthQuerySchema), reportController.getOverallSummary);
router.get('/summary/employee-wise', validateQuery(monthQuerySchema), reportController.getEmployeeWiseSummary);
router.get('/summary/department-wise', validateQuery(monthQuerySchema), reportController.getDepartmentWiseSummary);
router.get('/summary/leave-type-wise', validateQuery(monthQuerySchema), reportController.getLeaveTypeWiseSummary);
router.get('/:id', reportController.getReportById);

export default router;
