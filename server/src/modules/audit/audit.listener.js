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
      actionType: payload.isOverride ? AUDIT_ACTION.LEAVE_OVERRIDDEN : AUDIT_ACTION.LEAVE_APPROVED,
      entityType: 'LeaveRequest',
      entityId: payload.leaveRequestId,
      oldValues: { status: payload.previousStatus },
      newValues: { status: 'APPROVED', approverRole: payload.approverRole, finalApproval: payload.finalApproval, remarks: payload.remarks }
    });
  } catch (err) {
    console.error('Audit (leave:approved) failed:', err.message);
  }
});

eventBus.on(EVENTS.LEAVE_REJECTED, async (payload) => {
  try {
    await auditService.logAction({
      userId: payload.approverId,
      actionType: payload.isOverride ? AUDIT_ACTION.LEAVE_OVERRIDDEN : AUDIT_ACTION.LEAVE_REJECTED,
      entityType: 'LeaveRequest',
      entityId: payload.leaveRequestId,
      oldValues: { status: payload.previousStatus },
      newValues: { status: 'REJECTED', approverRole: payload.approverRole, remarks: payload.remarks }
    });
  } catch (err) {
    console.error('Audit (leave:rejected) failed:', err.message);
  }
});

eventBus.on(EVENTS.LEAVE_ESCALATED, async (payload) => {
  try {
    await auditService.logAction({
      userId: payload.approverId,
      actionType: AUDIT_ACTION.LEAVE_ESCALATED,
      entityType: 'LeaveRequest',
      entityId: payload.leaveRequestId,
      oldValues: { status: payload.previousStatus },
      newValues: { status: 'ESCALATED', remarks: payload.remarks }
    });
  } catch (err) {
    console.error('Audit (leave:escalated) failed:', err.message);
  }
});

eventBus.on(EVENTS.LEAVE_CHANGES_REQUESTED, async (payload) => {
  try {
    await auditService.logAction({
      userId: payload.approverId,
      actionType: AUDIT_ACTION.CHANGES_REQUESTED,
      entityType: 'LeaveRequest',
      entityId: payload.leaveRequestId,
      oldValues: { status: payload.previousStatus },
      newValues: { status: 'CHANGES_REQUESTED', approverRole: payload.approverRole, remarks: payload.remarks }
    });
  } catch (err) {
    console.error('Audit (leave:changes-requested) failed:', err.message);
  }
});

eventBus.on(EVENTS.LEAVE_RESUBMITTED, async (payload) => {
  try {
    await auditService.logAction({
      userId: payload.userId,
      actionType: AUDIT_ACTION.LEAVE_RESUBMITTED,
      entityType: 'LeaveRequest',
      entityId: payload.leaveRequestId,
      oldValues: { status: payload.previousStatus },
      newValues: { status: 'PENDING', numDays: payload.numDays, startDate: payload.startDate, endDate: payload.endDate }
    });
  } catch (err) {
    console.error('Audit (leave:resubmitted) failed:', err.message);
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

eventBus.on(EVENTS.BLOOD_RELATION_USED, async (payload) => {
  try {
    await auditService.logAction({
      userId: payload.userId,
      actionType: AUDIT_ACTION.BLOOD_RELATION_USED,
      entityType: 'BloodRelationLeave',
      entityId: payload.recordId,
      oldValues: { status: 'AVAILABLE' },
      newValues: { status: 'CONSUMED', relation: payload.relation }
    });
  } catch (err) {
    console.error('Audit (blood-relation:used) failed:', err.message);
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
      newValues: { balance: payload.newBalance, reason: payload.changeReason, note: payload.note }
    });
  } catch (err) {
    console.error('Audit (balance:updated) failed:', err.message);
  }
});
