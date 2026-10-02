import { http } from './http';

export function listAuditLogs(params = {}) {
  return http.get('/audit-logs', { params }).then((r) => r.data);
}

export function listAuditActionTypes() {
  return http.get('/audit-logs/action-types').then((r) => r.data.data);
}
