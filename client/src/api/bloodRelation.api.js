import { http } from './http';

export function getMyRelations() {
  return http.get('/blood-relation-leaves').then((r) => r.data.data);
}

export function useRelationLeave(payload) {
  return http.post('/blood-relation-leaves/use', payload).then((r) => r.data);
}
