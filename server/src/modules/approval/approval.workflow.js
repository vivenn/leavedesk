import { ValidationError, ForbiddenError } from '../../shared/errors/app-error.js';
import { LEAVE_REQUEST_STATUS, ROLES } from '../../config/constants.js';

export const APPROVAL_ACTION = {
  APPROVE: 'approve',
  REJECT: 'reject',
  ESCALATE: 'escalate',
  REQUEST_CHANGES: 'request-changes'
};

const { PENDING, MANAGER_APPROVED, ESCALATED, APPROVED, REJECTED, CANCELLED, CHANGES_REQUESTED } = LEAVE_REQUEST_STATUS;

// Statuses an admin can decide on directly (manager approval is optional)
const ADMIN_OPEN_STATUSES = [PENDING, MANAGER_APPROVED, ESCALATED];

/**
 * Pure state-machine for the approval workflow.
 *
 * Manager (own team only):  PENDING -> APPROVED | REJECTED | ESCALATED | CHANGES_REQUESTED
 * Admin:                    PENDING | MANAGER_APPROVED | ESCALATED -> APPROVED | REJECTED | CHANGES_REQUESTED
 * Admin override:           APPROVED -> REJECTED (balance restored), REJECTED -> APPROVED
 *
 * @returns {{ newStatus: string, finalApproval: boolean, isOverride: boolean, previousStatus: string }}
 */
export function resolveTransition(request, approver, action, { isTeamMember = false } = {}) {
  if (!Object.values(APPROVAL_ACTION).includes(action)) {
    throw new ValidationError(`Unknown approval action: ${action}`);
  }
  if (request.userId === approver.id) {
    throw new ValidationError('You cannot act on your own leave request');
  }
  if (request.status === CANCELLED) {
    throw new ValidationError('Cannot act on a cancelled request');
  }
  if (request.status === CHANGES_REQUESTED) {
    throw new ValidationError('Waiting for the employee to update this request');
  }

  const previousStatus = request.status;

  if (approver.role === ROLES.MANAGER) {
    if (!isTeamMember) {
      throw new ForbiddenError('You can only act on requests from your own team');
    }
    if (request.status !== PENDING) {
      throw new ValidationError('Manager can only act on pending requests');
    }
    return { ...managerOutcome(action), isOverride: false, previousStatus };
  }

  if (approver.role === ROLES.ADMIN) {
    if (action === APPROVAL_ACTION.ESCALATE) {
      throw new ValidationError('Administrators cannot escalate requests');
    }

    if (ADMIN_OPEN_STATUSES.includes(request.status)) {
      return { ...adminOutcome(action), isOverride: false, previousStatus };
    }

    if (request.status === APPROVED && action === APPROVAL_ACTION.REJECT) {
      return { newStatus: REJECTED, finalApproval: false, isOverride: true, previousStatus };
    }
    if (request.status === REJECTED && action === APPROVAL_ACTION.APPROVE) {
      return { newStatus: APPROVED, finalApproval: true, isOverride: true, previousStatus };
    }

    throw new ValidationError(`Cannot ${action} a request that is ${request.status.toLowerCase()}`);
  }

  throw new ForbiddenError('Only managers and administrators can act on leave requests');
}

function managerOutcome(action) {
  switch (action) {
    case APPROVAL_ACTION.APPROVE:
      return { newStatus: APPROVED, finalApproval: true };
    case APPROVAL_ACTION.REJECT:
      return { newStatus: REJECTED, finalApproval: false };
    case APPROVAL_ACTION.ESCALATE:
      return { newStatus: ESCALATED, finalApproval: false };
    default:
      return { newStatus: CHANGES_REQUESTED, finalApproval: false };
  }
}

function adminOutcome(action) {
  switch (action) {
    case APPROVAL_ACTION.APPROVE:
      return { newStatus: APPROVED, finalApproval: true };
    case APPROVAL_ACTION.REJECT:
      return { newStatus: REJECTED, finalApproval: false };
    default:
      return { newStatus: CHANGES_REQUESTED, finalApproval: false };
  }
}
