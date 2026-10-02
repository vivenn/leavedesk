import bcrypt from 'bcryptjs';
import * as userRepo from './user.repository.js';
import { NotFoundError, ConflictError } from '../../shared/errors/app-error.js';

export async function listUsers(query) {
  return userRepo.findAll(query);
}

export async function getUserById(id) {
  const user = await userRepo.findById(id);
  if (!user) throw new NotFoundError('User not found');
  return user;
}

export async function createUser(data) {
  const existing = await userRepo.findByEmail(data.email);
  if (existing) throw new ConflictError('Email already in use');

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(data.password, salt);

  const id = await userRepo.create({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    passwordHash,
    phone: data.phone,
    roleId: data.roleId,
    departmentId: data.departmentId,
    managerId: data.managerId
  });

  return userRepo.findById(id);
}

export async function updateUser(id, data) {
  const user = await userRepo.findById(id);
  if (!user) throw new NotFoundError('User not found');

  if (data.email && data.email !== user.email) {
    const existing = await userRepo.findByEmail(data.email);
    if (existing) throw new ConflictError('Email already in use');
  }

  await userRepo.update(id, data);
  return userRepo.findById(id);
}

export async function deleteUser(id) {
  const user = await userRepo.findById(id);
  if (!user) throw new NotFoundError('User not found');
  await userRepo.softDelete(id);
}

export async function getTeam(managerId) {
  return userRepo.findTeam(managerId);
}

export async function getActiveUserIdsByRole(roleName) {
  return userRepo.findActiveIdsByRole(roleName);
}
