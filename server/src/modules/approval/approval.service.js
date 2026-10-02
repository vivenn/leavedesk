import * as approvalRepo from './approval.repository.js';
import * as leaveRequestRepo from '../leave-request/leave-request.repository.js';
import { NotFoundError, ValidationError } from '../../shared/errors/app-error.js';
import { LEAVE_REQUEST_STATUS, APPROVAL_STATUS, APPROVER_ROLE, ROLES, EVENTS } from '../../config/constants.js';
import eventBus from '../../shared/event-bus.js';

export async function getPendingApprovals(user, { limit, offset }) {
  if (user.role === ROLES.ADMIN) {
    return approvalRepo.findPendingForAdmin({ limit, offset });
  }
  return approvalRepo.findPendingForManager(user.id, { limit, offset });
}

export async function approveRequest(leaveRequestId, approver, remarks) {
  const request = await leaveRequestRepo.findById(leaveRequestId);
  if (!request) throw new NotFoundError('Leave request not found');

  const approverRole = approver.role === ROLES.ADMIN ? APPROVER_ROLE.ADMIN : APPROVER_ROLE.MANAGER;

  validateApprovalAction(request, approver, 'approve');

  await approvalRepo.create({
    leaveRequestId,
    approverId: approver.id,
    approverRole,
    status: APPROVAL_STATUS.APPROVED,
    remarks
  });

  let newStatus;
  let finalApproval = false;

  if (approverRole === APPROVER_ROLE.MANAGER) {
    newStatus = LEAVE_REQUEST_STATUS.MANAGER_APPROVED;
  } else {
    newStatus = LEAVE_REQUEST_STATUS.APPROVED;
    finalApproval = true;
  }

  if (approverRole === APPROVER_ROLE.MANAGER && request.status === LEAVE_REQUEST_STATUS.PENDING) {
    newStatus = LEAVE_REQUEST_STATUS.APPROVED;
    finalApproval = true;
  }

  await leaveRequestRepo.updateStatus(leaveRequestId, newStatus);

  eventBus.emit(EVENTS.LEAVE_APPROVED, {
    leaveRequestId,
    userId: request.userId,
    leaveTypeId: request.leaveTypeId,
    numDays: request.numDays,
    financialYear: request.financialYear,
    approverId: approver.id,
    approverRole,
    finalApproval
  });

  const updated = await leaveRequestRepo.findById(leaveRequestId);
  const approvals = await approvalRepo.findByLeaveRequest(leaveRequestId);
  return { ...updated, approvals };
}

export async function rejectRequest(leaveRequestId, approver, remarks) {
  const request = await leaveRequestRepo.findById(leaveRequestId);
  if (!request) throw new NotFoundError('Leave request not found');

  const approverRole = approver.role === ROLES.ADMIN ? APPROVER_ROLE.ADMIN : APPROVER_ROLE.MANAGER;

  validateApprovalAction(request, approver, 'reject');

  await approvalRepo.create({
    leaveRequestId,
    approverId: approver.id,
    approverRole,
    status: APPROVAL_STATUS.REJECTED,
    remarks
  });

  await leaveRequestRepo.updateStatus(leaveRequestId, LEAVE_REQUEST_STATUS.REJECTED);

  eventBus.emit(EVENTS.LEAVE_REJECTED, {
    leaveRequestId,
    userId: request.userId,
    approverId: approver.id,
    approverRole,
    remarks
  });

  const updated = await leaveRequestRepo.findById(leaveRequestId);
  const approvals = await approvalRepo.findByLeaveRequest(leaveRequestId);
  return { ...updated, approvals };
}

export async function getApprovalHistory(leaveRequestId) {
  const request = await leaveRequestRepo.findById(leaveRequestId);
  if (!request) throw new NotFoundError('Leave request not found');

  const approvals = await approvalRepo.findByLeaveRequest(leaveRequestId);
  return { ...request, approvals };
}

function validateApprovalAction(request, approver, action) {
  if (request.status === LEAVE_REQUEST_STATUS.CANCELLED) {
    throw new ValidationError('Cannot act on a cancelled request');
  }
  if (request.status === LEAVE_REQUEST_STATUS.REJECTED) {
    throw new ValidationError('Cannot act on an already rejected request');
  }
  if (request.status === LEAVE_REQUEST_STATUS.APPROVED) {
    throw new ValidationError('Request is already fully approved');
  }

  if (approver.role === ROLES.MANAGER) {
    if (request.status !== LEAVE_REQUEST_STATUS.PENDING) {
      throw new ValidationError('Manager can only act on pending requests');
    }
  }

  if (approver.role === ROLES.ADMIN) {
    if (request.status !== LEAVE_REQUEST_STATUS.PENDING && request.status !== LEAVE_REQUEST_STATUS.MANAGER_APPROVED) {
      throw new ValidationError('Admin can only act on pending or manager-approved requests');
    }
  }

  if (request.userId === approver.id) {
    throw new ValidationError('You cannot approve your own leave request');
  }
}
