import { Router } from 'express';
import { authenticate } from '../auth/auth.middleware.js';
import * as notifController from './notification.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', notifController.getNotifications);
router.get('/unread-count', notifController.getUnreadCount);
router.patch('/:id/read', notifController.markRead);
router.patch('/read-all', notifController.markAllRead);

export default router;
