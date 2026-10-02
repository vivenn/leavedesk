import { http } from './http';

export function listRoles() {
  return http.get('/roles').then((r) => r.data.data);
}
