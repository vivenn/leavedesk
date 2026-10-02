import { http } from './http';

export function listLeaveTypes() {
  return http.get('/leave-types').then((r) => r.data.data);
}

export function createLeaveType(payload) {
  return http.post('/leave-types', payload).then((r) => r.data);
}

export function updateLeaveType(id, payload) {
  return http.put(`/leave-types/${id}`, payload).then((r) => r.data);
}

export function deleteLeaveType(id) {
  return http.delete(`/leave-types/${id}`).then((r) => r.data);
}
