import { http } from './http';

export function getMyBalances() {
  return http.get('/leave-balances').then((r) => r.data.data);
}

export function getUserBalances(userId) {
  return http.get(`/leave-balances/${userId}`).then((r) => r.data.data);
}

export function adjustBalance(userId, payload) {
  return http.put(`/leave-balances/${userId}`, payload).then((r) => r.data);
}

export function initializeBalances(payload) {
  return http.post('/leave-balances/initialize', payload).then((r) => r.data);
}
