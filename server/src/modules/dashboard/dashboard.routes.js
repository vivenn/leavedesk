import { Router } from 'express';
import { authenticate } from '../auth/auth.middleware.js';
import * as dashboardController from './dashboard.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', dashboardController.getDashboard);

export default router;
