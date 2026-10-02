import { http } from './http';

export function listDepartments() {
  return http.get('/departments').then((r) => r.data.data);
}

export function createDepartment(payload) {
  return http.post('/departments', payload).then((r) => r.data);
}

export function updateDepartment(id, payload) {
  return http.put(`/departments/${id}`, payload).then((r) => r.data);
}

export function deleteDepartment(id) {
  return http.delete(`/departments/${id}`).then((r) => r.data);
}
