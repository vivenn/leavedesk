import * as approvalRepo from './approval.repository.js';
import * as leaveRequestRepo from '../leave-request/leave-request.repository.js';
import * as balanceService from '../leave-balance/leave-balance.service.js';
import { NotFoundError } from '../../shared/errors/app-error.js';
import { LEAVE_REQUEST_STATUS, APPROVAL_STATUS, APPROVER_ROLE, ROLES, EVENTS } from '../../config/constants.js';
import { resolveTransition, APPROVAL_ACTION } from './approval.workflow.js';
import eventBus from '../../shared/event-bus.js';

const ACTION_TO_APPROVAL_STATUS = {
  [APPROVAL_ACTION.APPROVE]: APPROVAL_STATUS.APPROVED,
  [APPROVAL_ACTION.REJECT]: APPROVAL_STATUS.REJECTED,
  [APPROVAL_ACTION.ESCALATE]: APPROVAL_STATUS.ESCALATED,
  [APPROVAL_ACTION.REQUEST_CHANGES]: APPROVAL_STATUS.CHANGES_REQUESTED
};

export async function getPendingApprovals(user, { limit, offset }) {
  if (user.role === ROLES.ADMIN) {
    return approvalRepo.findPendingForAdmin({ limit, offset });
  }
  return approvalRepo.findPendingForManager(user.id, { limit, offset });
}

export function approveRequest(leaveRequestId, approver, remarks) {
  return actOnRequest(leaveRequestId, approver, APPROVAL_ACTION.APPROVE, remarks);
}

export function rejectRequest(leaveRequestId, approver, remarks) {
  return actOnRequest(leaveRequestId, approver, APPROVAL_ACTION.REJECT, remarks);
}

export function escalateRequest(leaveRequestId, approver, remarks) {
  return actOnRequest(leaveRequestId, approver, APPROVAL_ACTION.ESCALATE, remarks);
}

export function requestChanges(leaveRequestId, approver, remarks) {
  return actOnRequest(leaveRequestId, approver, APPROVAL_ACTION.REQUEST_CHANGES, remarks);
}

async function actOnRequest(leaveRequestId, approver, action, remarks) {
  const request = await leaveRequestRepo.findById(leaveRequestId);
  if (!request) throw new NotFoundError('Leave request not found');

  const transition = resolveTransition(request, approver, action, {
    isTeamMember: request.managerId === approver.id
  });

  // Fail fast with a clear error instead of letting the async balance listener fail silently
  if (transition.finalApproval) {
    await balanceService.checkSufficientBalance(
      request.userId, request.leaveTypeId, request.financialYear, request.numDays
    );
  }

  const approverRole = approver.role === ROLES.ADMIN ? APPROVER_ROLE.ADMIN : APPROVER_ROLE.MANAGER;

  await approvalRepo.create({
    leaveRequestId,
    approverId: approver.id,
    approverRole,
    status: ACTION_TO_APPROVAL_STATUS[action],
    remarks
  });

  await leaveRequestRepo.updateStatus(leaveRequestId, transition.newStatus);

  emitTransitionEvent(request, approver, approverRole, transition, remarks);

  const updated = await leaveRequestRepo.findById(leaveRequestId);
  const approvals = await approvalRepo.findByLeaveRequest(leaveRequestId);
  return { ...updated, approvals };
}

function emitTransitionEvent(request, approver, approverRole, transition, remarks) {
  const base = {
    leaveRequestId: request.id,
    userId: request.userId,
    leaveTypeId: request.leaveTypeId,
    leaveTypeName: request.leaveTypeName,
    numDays: request.numDays,
    financialYear: request.financialYear,
    approverId: approver.id,
    approverRole,
    remarks,
    isOverride: transition.isOverride,
    previousStatus: transition.previousStatus
  };

  switch (transition.newStatus) {
    case LEAVE_REQUEST_STATUS.APPROVED:
      eventBus.emit(EVENTS.LEAVE_APPROVED, { ...base, finalApproval: transition.finalApproval });
      break;
    case LEAVE_REQUEST_STATUS.REJECTED:
      eventBus.emit(EVENTS.LEAVE_REJECTED, base);
      break;
    case LEAVE_REQUEST_STATUS.ESCALATED:
      eventBus.emit(EVENTS.LEAVE_ESCALATED, {
        ...base,
        employeeName: `${request.user.firstName} ${request.user.lastName}`
      });
      break;
    case LEAVE_REQUEST_STATUS.CHANGES_REQUESTED:
      eventBus.emit(EVENTS.LEAVE_CHANGES_REQUESTED, base);
      break;
  }
}

export async function getApprovalHistory(leaveRequestId) {
  const request = await leaveRequestRepo.findById(leaveRequestId);
  if (!request) throw new NotFoundError('Leave request not found');

  const approvals = await approvalRepo.findByLeaveRequest(leaveRequestId);
  return { ...request, approvals };
}
