import * as roleService from './role.service.js';
import { sendSuccess } from '../../shared/utils/response.js';

export async function listRoles(req, res, next) {
  try {
    const roles = await roleService.listRoles();
    sendSuccess(res, 'Roles fetched', roles);
  } catch (err) {
    next(err);
  }
}
