import * as leaveTypeRepo from './leave-type.repository.js';
import { NotFoundError, ConflictError } from '../../shared/errors/app-error.js';

export async function listLeaveTypes() {
  return leaveTypeRepo.findAll();
}

export async function getLeaveTypeById(id) {
  const lt = await leaveTypeRepo.findById(id);
  if (!lt) throw new NotFoundError('Leave type not found');
  return lt;
}

export async function createLeaveType(data) {
  const existing = await leaveTypeRepo.findByName(data.leaveTypeName);
  if (existing) throw new ConflictError('Leave type name already exists');

  const id = await leaveTypeRepo.create(data);
  return leaveTypeRepo.findById(id);
}

export async function updateLeaveType(id, data) {
  const lt = await leaveTypeRepo.findById(id);
  if (!lt) throw new NotFoundError('Leave type not found');

  if (data.leaveTypeName && data.leaveTypeName !== lt.leaveTypeName) {
    const existing = await leaveTypeRepo.findByName(data.leaveTypeName);
    if (existing) throw new ConflictError('Leave type name already exists');
  }

  await leaveTypeRepo.update(id, data);
  return leaveTypeRepo.findById(id);
}

export async function deleteLeaveType(id) {
  const lt = await leaveTypeRepo.findById(id);
  if (!lt) throw new NotFoundError('Leave type not found');
  await leaveTypeRepo.softDelete(id);
}
