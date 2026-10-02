import eventBus from '../../shared/event-bus.js';
import { EVENTS, NOTIFICATION_TYPE, ROLES } from '../../config/constants.js';
import * as notifService from './notification.service.js';
import * as userService from '../user/user.service.js';
import { formatDisplayDate, formatDayCount } from '../../shared/utils/date.js';

eventBus.on(EVENTS.LEAVE_APPLIED, async (payload) => {
  try {
    if (!payload.managerId) return;
    await notifService.createNotification({
      recipientId: payload.managerId,
      notificationType: NOTIFICATION_TYPE.LEAVE_APPLIED,
      leaveRequestId: payload.leaveRequestId,
      title: 'New Leave Request',
      message: `New ${payload.leaveTypeName} leave request (${formatDayCount(payload.numDays)}) from ${formatDisplayDate(payload.startDate)} to ${formatDisplayDate(payload.endDate)}`
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
      message: payload.isOverride
        ? 'An administrator overrode the earlier decision and approved your leave request'
        : `Your leave request has been approved by ${payload.approverRole.toLowerCase()}`
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
      message: `${payload.isOverride
        ? 'An administrator revoked your approved leave request.'
        : 'Your leave request has been rejected.'} ${payload.remarks ? 'Reason: ' + payload.remarks : ''}`.trim()
    });
  } catch (err) {
    console.error('Notification (leave:rejected) failed:', err.message);
  }
});

eventBus.on(EVENTS.LEAVE_ESCALATED, async (payload) => {
  try {
    const adminIds = await userService.getActiveUserIdsByRole(ROLES.ADMIN);
    await Promise.all(adminIds.map((recipientId) => notifService.createNotification({
      recipientId,
      notificationType: NOTIFICATION_TYPE.LEAVE_ESCALATED,
      leaveRequestId: payload.leaveRequestId,
      title: 'Leave Request Escalated',
      message: `${payload.employeeName}'s ${payload.leaveTypeName} request (${formatDayCount(payload.numDays)}) needs your decision${payload.remarks ? ': ' + payload.remarks : ''}`
    })));
  } catch (err) {
    console.error('Notification (leave:escalated) failed:', err.message);
  }
});

eventBus.on(EVENTS.LEAVE_CHANGES_REQUESTED, async (payload) => {
  try {
    await notifService.createNotification({
      recipientId: payload.userId,
      notificationType: NOTIFICATION_TYPE.CHANGES_REQUESTED,
      leaveRequestId: payload.leaveRequestId,
      title: 'Changes Requested',
      message: `Please update your ${payload.leaveTypeName} request: ${payload.remarks}`
    });
  } catch (err) {
    console.error('Notification (leave:changes-requested) failed:', err.message);
  }
});

eventBus.on(EVENTS.LEAVE_RESUBMITTED, async (payload) => {
  try {
    if (!payload.managerId) return;
    await notifService.createNotification({
      recipientId: payload.managerId,
      notificationType: NOTIFICATION_TYPE.LEAVE_RESUBMITTED,
      leaveRequestId: payload.leaveRequestId,
      title: 'Leave Request Updated',
      message: `Updated ${payload.leaveTypeName} request (${formatDayCount(payload.numDays)}) from ${formatDisplayDate(payload.startDate)} to ${formatDisplayDate(payload.endDate)} is waiting for review`
    });
  } catch (err) {
    console.error('Notification (leave:resubmitted) failed:', err.message);
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

eventBus.on(EVENTS.BLOOD_RELATION_USED, async (payload) => {
  try {
    if (!payload.managerId) return;
    await notifService.createNotification({
      recipientId: payload.managerId,
      notificationType: NOTIFICATION_TYPE.BLOOD_RELATION_USED,
      title: 'Family Emergency Leave',
      message: `${payload.employeeName} has taken blood relation leave (${payload.relation.replaceAll('_', ' ').toLowerCase()})`
    });
  } catch (err) {
    console.error('Notification (blood-relation:used) failed:', err.message);
  }
});

eventBus.on(EVENTS.BALANCE_LOW, async (payload) => {
  try {
    await notifService.createNotification({
      recipientId: payload.userId,
      notificationType: NOTIFICATION_TYPE.BALANCE_LOW,
      title: 'Low Leave Balance',
      message: `Your ${payload.leaveTypeName} balance is low: ${formatDayCount(payload.availableBalance)} remaining`
    });
  } catch (err) {
    console.error('Notification (balance:low) failed:', err.message);
  }
});
