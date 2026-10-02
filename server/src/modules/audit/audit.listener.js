import eventBus from '../../shared/event-bus.js';
import { EVENTS, AUDIT_ACTION } from '../../config/constants.js';
import * as auditService from './audit.service.js';

eventBus.on(EVENTS.LEAVE_APPLIED, async (payload) => {
  try {
    await auditService.logAction({
      userId: payload.userId,
      actionType: AUDIT_ACTION.LEAVE_APPLIED,
      entityType: 'LeaveRequest',
      entityId: payload.leaveRequestId,
      newValues: { leaveType: payload.leaveTypeName, numDays: payload.numDays, startDate: payload.startDate, endDate: payload.endDate }
    });
  } catch (err) {
    console.error('Audit (leave:applied) failed:', err.message);
  }
});

eventBus.on(EVENTS.LEAVE_APPROVED, async (payload) => {
  try {
    await auditService.logAction({
      userId: payload.approverId,
      actionType: AUDIT_ACTION.LEAVE_APPROVED,
      entityType: 'LeaveRequest',
      entityId: payload.leaveRequestId,
      newValues: { approverRole: payload.approverRole, finalApproval: payload.finalApproval }
    });
  } catch (err) {
    console.error('Audit (leave:approved) failed:', err.message);
  }
});

eventBus.on(EVENTS.LEAVE_REJECTED, async (payload) => {
  try {
    await auditService.logAction({
      userId: payload.approverId,
      actionType: AUDIT_ACTION.LEAVE_REJECTED,
      entityType: 'LeaveRequest',
      entityId: payload.leaveRequestId,
      newValues: { approverRole: payload.approverRole, remarks: payload.remarks }
    });
  } catch (err) {
    console.error('Audit (leave:rejected) failed:', err.message);
  }
});

eventBus.on(EVENTS.LEAVE_CANCELLED, async (payload) => {
  try {
    await auditService.logAction({
      userId: payload.userId,
      actionType: AUDIT_ACTION.LEAVE_CANCELLED,
      entityType: 'LeaveRequest',
      entityId: payload.leaveRequestId,
      newValues: { previousStatus: payload.previousStatus }
    });
  } catch (err) {
    console.error('Audit (leave:cancelled) failed:', err.message);
  }
});

eventBus.on(EVENTS.BALANCE_UPDATED, async (payload) => {
  try {
    await auditService.logBalanceChange({
      leaveBalanceId: payload.leaveBalanceId,
      previousBalance: payload.previousBalance,
      newBalance: payload.newBalance,
      changeReason: payload.changeReason,
      leaveRequestId: payload.leaveRequestId,
      changedBy: payload.changedBy
    });

    await auditService.logAction({
      userId: payload.changedBy,
      actionType: AUDIT_ACTION.BALANCE_UPDATED,
      entityType: 'LeaveBalance',
      entityId: payload.leaveBalanceId,
      oldValues: { balance: payload.previousBalance },
      newValues: { balance: payload.newBalance, reason: payload.changeReason }
    });
  } catch (err) {
    console.error('Audit (balance:updated) failed:', err.message);
  }
});
