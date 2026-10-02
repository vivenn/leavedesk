import * as roleRepo from './role.repository.js';

export async function listRoles() {
  return roleRepo.findAllActive();
}
