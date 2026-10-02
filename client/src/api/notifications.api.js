import { http } from './http';

export function getNotifications(params = {}) {
  return http.get('/notifications', { params }).then((r) => r.data.data);
}

export function getUnreadCount() {
  return http.get('/notifications/unread-count').then((r) => r.data.data);
}

export function markRead(id) {
  return http.patch(`/notifications/${id}/read`).then((r) => r.data);
}

export function markAllRead() {
  return http.patch('/notifications/read-all').then((r) => r.data);
}
