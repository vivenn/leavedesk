import * as notifService from './notification.service.js';
import { sendSuccess, sendPaginated } from '../../shared/utils/response.js';
import { getPagination, buildPaginationMeta } from '../../shared/utils/pagination.js';

export async function getNotifications(req, res, next) {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { notifications, total } = await notifService.getNotifications(req.user.id, { limit, offset });
    sendPaginated(res, 'Notifications fetched', notifications, buildPaginationMeta(page, limit, total));
  } catch (err) {
    next(err);
  }
}

export async function getUnreadCount(req, res, next) {
  try {
    const count = await notifService.getUnreadCount(req.user.id);
    sendSuccess(res, 'Unread count fetched', { count });
  } catch (err) {
    next(err);
  }
}

export async function markRead(req, res, next) {
  try {
    const success = await notifService.markRead(req.params.id, req.user.id);
    sendSuccess(res, success ? 'Notification marked as read' : 'Notification not found');
  } catch (err) {
    next(err);
  }
}

export async function markAllRead(req, res, next) {
  try {
    await notifService.markAllRead(req.user.id);
    sendSuccess(res, 'All notifications marked as read');
  } catch (err) {
    next(err);
  }
}
