import eventBus from '../../shared/event-bus.js';
import { EVENTS, NOTIFICATION_TYPE } from '../../config/constants.js';
import * as notifService from './notification.service.js';

eventBus.on(EVENTS.LEAVE_APPLIED, async (payload) => {
  try {
    if (!payload.managerId) return;
    await notifService.createNotification({
      recipientId: payload.managerId,
      notificationType: NOTIFICATION_TYPE.LEAVE_APPLIED,
      leaveRequestId: payload.leaveRequestId,
      title: 'New Leave Request',
      message: `New ${payload.leaveTypeName} leave request (${payload.numDays} days) from ${payload.startDate} to ${payload.endDate}`
    });
  } catch (err) {
    console.error('Notification (leave:applied) failed:', err.message);
  }
});

eventBus.on(EVENTS.LEAVE_APPROVED, async (payload) => {
  try {
    await notifService.createNotification({
      recipientId: payload.userId,
      notificationType: NOTIFICATION_TYPE.LEAVE_APPROVED,
      leaveRequestId: payload.leaveRequestId,
      title: 'Leave Approved',
      message: `Your leave request has been approved by ${payload.approverRole.toLowerCase()}`
    });
  } catch (err) {
    console.error('Notification (leave:approved) failed:', err.message);
  }
});

eventBus.on(EVENTS.LEAVE_REJECTED, async (payload) => {
  try {
    await notifService.createNotification({
      recipientId: payload.userId,
      notificationType: NOTIFICATION_TYPE.LEAVE_REJECTED,
      leaveRequestId: payload.leaveRequestId,
      title: 'Leave Rejected',
      message: `Your leave request has been rejected. ${payload.remarks ? 'Reason: ' + payload.remarks : ''}`
    });
  } catch (err) {
    console.error('Notification (leave:rejected) failed:', err.message);
  }
});

eventBus.on(EVENTS.LEAVE_CANCELLED, async (payload) => {
  try {
    await notifService.createNotification({
      recipientId: payload.userId,
      notificationType: NOTIFICATION_TYPE.LEAVE_CANCELLED,
      leaveRequestId: payload.leaveRequestId,
      title: 'Leave Cancelled',
      message: 'Your leave request has been cancelled'
    });
  } catch (err) {
    console.error('Notification (leave:cancelled) failed:', err.message);
  }
});

eventBus.on(EVENTS.BALANCE_LOW, async (payload) => {
  try {
    await notifService.createNotification({
      recipientId: payload.userId,
      notificationType: NOTIFICATION_TYPE.BALANCE_LOW,
      title: 'Low Leave Balance',
      message: `Your ${payload.leaveTypeName} balance is low: ${payload.availableBalance} days remaining`
    });
  } catch (err) {
    console.error('Notification (balance:low) failed:', err.message);
  }
});
