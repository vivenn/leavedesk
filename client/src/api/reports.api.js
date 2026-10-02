import { http } from './http';

export function getOverallSummary(month) {
  return http.get('/reports/summary/overall', { params: { month } }).then((r) => r.data.data);
}

export function getEmployeeWiseSummary(month) {
  return http.get('/reports/summary/employee-wise', { params: { month } }).then((r) => r.data.data);
}

export function getDepartmentWiseSummary(month) {
  return http.get('/reports/summary/department-wise', { params: { month } }).then((r) => r.data.data);
}

export function getLeaveTypeWiseSummary(month) {
  return http.get('/reports/summary/leave-type-wise', { params: { month } }).then((r) => r.data.data);
}
