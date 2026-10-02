import { http } from './http';

export function applyLeave(payload) {
  return http.post('/leave-requests', payload).then((r) => r.data);
}

export function getMyRequests(params = {}) {
  return http.get('/leave-requests', { params }).then((r) => r.data);
}

export function getTeamRequests(params = {}) {
  return http.get('/leave-requests/team', { params }).then((r) => r.data);
}

export function getAllRequests(params = {}) {
  return http.get('/leave-requests/all', { params }).then((r) => r.data);
}

export function getRequestById(id) {
  return http.get(`/leave-requests/${id}`).then((r) => r.data.data);
}

export function cancelRequest(id) {
  return http.patch(`/leave-requests/${id}/cancel`).then((r) => r.data);
}

export function updateRequest(id, payload) {
  return http.put(`/leave-requests/${id}`, payload).then((r) => r.data);
}
