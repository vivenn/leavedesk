import { resolveTransition, APPROVAL_ACTION } from '../../modules/approval/approval.workflow.js';
import { ROLES, LEAVE_REQUEST_STATUS } from '../../config/constants.js';

const { APPROVE, REJECT, ESCALATE, REQUEST_CHANGES } = APPROVAL_ACTION;
const S = LEAVE_REQUEST_STATUS;

const manager = { id: 'manager-1', role: ROLES.MANAGER };
const admin = { id: 'admin-1', role: ROLES.ADMIN };
const employee = { id: 'employee-1', role: ROLES.EMPLOYEE };

function request(status, userId = employee.id) {
  return { id: 'request-1', userId, status };
}

describe('approval workflow — manager', () => {
  const asTeam = { isTeamMember: true };

  test.each([
    [APPROVE, S.APPROVED, true],
    [REJECT, S.REJECTED, false],
    [ESCALATE, S.ESCALATED, false],
    [REQUEST_CHANGES, S.CHANGES_REQUESTED, false]
  ])('%s on a pending request -> %s', (action, newStatus, finalApproval) => {
    const result = resolveTransition(request(S.PENDING), manager, action, asTeam);
    expect(result).toEqual({ newStatus, finalApproval, isOverride: false, previousStatus: S.PENDING });
  });

  test('cannot act on another team’s request', () => {
    expect(() => resolveTransition(request(S.PENDING), manager, APPROVE, { isTeamMember: false }))
      .toThrow('own team');
  });

  test.each([S.ESCALATED, S.MANAGER_APPROVED, S.APPROVED, S.REJECTED])(
    'cannot act once the request is %s',
    (status) => {
      expect(() => resolveTransition(request(status), manager, APPROVE, asTeam)).toThrow();
    }
  );
});

describe('approval workflow — administrator', () => {
  test.each([S.PENDING, S.ESCALATED, S.MANAGER_APPROVED])('approves a %s request as final', (status) => {
    const result = resolveTransition(request(status), admin, APPROVE);
    expect(result).toMatchObject({ newStatus: S.APPROVED, finalApproval: true, isOverride: false });
  });

  test('can request changes on an escalated request', () => {
    expect(resolveTransition(request(S.ESCALATED), admin, REQUEST_CHANGES).newStatus).toBe(S.CHANGES_REQUESTED);
  });

  test('cannot escalate', () => {
    expect(() => resolveTransition(request(S.PENDING), admin, ESCALATE)).toThrow('cannot escalate');
  });

  test('override: revoking an approved request', () => {
    const result = resolveTransition(request(S.APPROVED), admin, REJECT);
    expect(result).toEqual({ newStatus: S.REJECTED, finalApproval: false, isOverride: true, previousStatus: S.APPROVED });
  });

  test('override: approving a rejected request', () => {
    const result = resolveTransition(request(S.REJECTED), admin, APPROVE);
    expect(result).toEqual({ newStatus: S.APPROVED, finalApproval: true, isOverride: true, previousStatus: S.REJECTED });
  });

  test.each([
    [S.APPROVED, APPROVE],
    [S.REJECTED, REJECT]
  ])('rejects a no-op override (%s + %s)', (status, action) => {
    expect(() => resolveTransition(request(status), admin, action)).toThrow();
  });
});

describe('approval workflow — guards for every approver', () => {
  test.each([manager, admin])('nobody can act on their own request (%o)', (approver) => {
    expect(() => resolveTransition(request(S.PENDING, approver.id), approver, APPROVE, { isTeamMember: true }))
      .toThrow('your own');
  });

  test.each([manager, admin])('cancelled requests are closed', (approver) => {
    expect(() => resolveTransition(request(S.CANCELLED), approver, APPROVE, { isTeamMember: true }))
      .toThrow('cancelled');
  });

  test.each([manager, admin])('requests awaiting employee changes are locked', (approver) => {
    expect(() => resolveTransition(request(S.CHANGES_REQUESTED), approver, APPROVE, { isTeamMember: true }))
      .toThrow('Waiting for the employee');
  });

  test('employees cannot act on requests', () => {
    expect(() => resolveTransition(request(S.PENDING, 'someone-else'), employee, APPROVE)).toThrow();
  });

  test('unknown actions are rejected', () => {
    expect(() => resolveTransition(request(S.PENDING), admin, 'delete')).toThrow('Unknown approval action');
  });
});
