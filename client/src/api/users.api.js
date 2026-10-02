import { http } from './http';

export function getMyProfile() {
  return http.get('/users/me').then((r) => r.data.data);
}

export function listUsers(params = {}) {
  return http.get('/users', { params }).then((r) => r.data);
}

export function getUserById(id) {
  return http.get(`/users/${id}`).then((r) => r.data.data);
}

export function createUser(payload) {
  return http.post('/users', payload).then((r) => r.data);
}

export function updateUser(id, payload) {
  return http.put(`/users/${id}`, payload).then((r) => r.data);
}

export function deleteUser(id) {
  return http.delete(`/users/${id}`).then((r) => r.data);
}

export function getTeam(id) {
  return http.get(`/users/${id}/team`).then((r) => r.data.data);
}
