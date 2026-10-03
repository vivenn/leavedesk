import { http } from './http';

export function login(email, password) {
  return http.post('/auth/login', { email, password }).then((r) => r.data.data);
}

export function logout() {
  return http.post('/auth/logout').then((r) => r.data);
}

export function getMe() {
  return http.get('/auth/me').then((r) => r.data.data);
}

export function changePassword(currentPassword, newPassword) {
  return http.post('/auth/change-password', { currentPassword, newPassword }).then((r) => r.data);
}
