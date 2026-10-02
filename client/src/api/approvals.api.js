import { http } from './http';

export function getPendingApprovals() {
  return http.get('/approvals/pending').then((r) => r.data.data);
}

export function approveRequest(leaveRequestId, remarks = '') {
  return http.patch(`/approvals/${leaveRequestId}/approve`, { remarks }).then((r) => r.data);
}

export function rejectRequest(leaveRequestId, remarks = '') {
  return http.patch(`/approvals/${leaveRequestId}/reject`, { remarks }).then((r) => r.data);
}

export function getApprovalHistory(leaveRequestId) {
  return http.get(`/approvals/${leaveRequestId}/history`).then((r) => r.data.data);
}

export function escalateRequest(leaveRequestId, remarks = '') {
  return http.patch(`/approvals/${leaveRequestId}/escalate`, { remarks }).then((r) => r.data);
}

export function requestChanges(leaveRequestId, remarks) {
  return http.patch(`/approvals/${leaveRequestId}/request-changes`, { remarks }).then((r) => r.data);
}
