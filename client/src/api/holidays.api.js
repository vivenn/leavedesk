import { http } from './http';

export function listHolidays(params = {}) {
  return http.get('/holidays', { params }).then((r) => r.data.data);
}

export function getUpcomingHolidays() {
  return http.get('/holidays/upcoming').then((r) => r.data.data);
}

export function createHoliday(payload) {
  return http.post('/holidays', payload).then((r) => r.data);
}

export function updateHoliday(id, payload) {
  return http.put(`/holidays/${id}`, payload).then((r) => r.data);
}

export function deleteHoliday(id) {
  return http.delete(`/holidays/${id}`).then((r) => r.data);
}
