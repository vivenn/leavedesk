import * as userService from './user.service.js';
import { sendSuccess, sendPaginated } from '../../shared/utils/response.js';
import { getPagination, buildPaginationMeta } from '../../shared/utils/pagination.js';

export async function listUsers(req, res, next) {
  try {
    const query = req.validatedQuery || req.query;
    const { page, limit, offset } = getPagination(query);
    const { role, department, isActive, search } = query;
    const { users, total } = await userService.listUsers({ limit, offset, role, department, isActive, search });
    sendPaginated(res, 'Users fetched', users, buildPaginationMeta(page, limit, total));
  } catch (err) {
    next(err);
  }
}

export async function getUserById(req, res, next) {
  try {
    const user = await userService.getUserById(req.params.id);
    sendSuccess(res, 'User fetched', user);
  } catch (err) {
    next(err);
  }
}

export async function getProfile(req, res, next) {
  try {
    const user = await userService.getUserById(req.user.id);
    sendSuccess(res, 'Profile fetched', user);
  } catch (err) {
    next(err);
  }
}

export async function createUser(req, res, next) {
  try {
    const user = await userService.createUser(req.body);
    sendSuccess(res, 'User created', user, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req, res, next) {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    sendSuccess(res, 'User updated', user);
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req, res, next) {
  try {
    await userService.deleteUser(req.params.id);
    sendSuccess(res, 'User deactivated');
  } catch (err) {
    next(err);
  }
}

export async function getTeam(req, res, next) {
  try {
    const team = await userService.getTeam(req.params.id);
    sendSuccess(res, 'Team fetched', team);
  } catch (err) {
    next(err);
  }
}
