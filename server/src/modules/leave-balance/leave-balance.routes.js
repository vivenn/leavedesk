import { Router } from 'express';
import { validate } from '../../shared/middleware/validate.js';
import { authenticate, authorize } from '../auth/auth.middleware.js';
import { adjustBalanceSchema, initializeBalancesSchema } from './leave-balance.validation.js';
import * as balanceController from './leave-balance.controller.js';
import { ROLES } from '../../config/constants.js';

const router = Router();

router.use(authenticate);

router.get('/', balanceController.getMyBalances);
router.get('/:userId', authorize(ROLES.MANAGER, ROLES.ADMIN), balanceController.getUserBalances);
router.put('/:userId', authorize(ROLES.ADMIN), validate(adjustBalanceSchema), balanceController.adjustBalance);
router.post('/initialize', authorize(ROLES.ADMIN), validate(initializeBalancesSchema), balanceController.initializeBalances);

export default router;
