import * as notifRepo from './notification.repository.js';

export async function getNotifications(recipientId, { limit, offset }) {
  return notifRepo.findByRecipient(recipientId, { limit, offset });
}

export async function getUnreadCount(recipientId) {
  return notifRepo.getUnreadCount(recipientId);
}

export async function createNotification(data) {
  return notifRepo.create(data);
}

export async function markRead(id, recipientId) {
  return notifRepo.markRead(id, recipientId);
}

export async function markAllRead(recipientId) {
  return notifRepo.markAllRead(recipientId);
}
