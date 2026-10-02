import * as deptRepo from './department.repository.js';
import { NotFoundError, ConflictError } from '../../shared/errors/app-error.js';

export async function listDepartments() {
  return deptRepo.findAll();
}

export async function getDepartmentById(id) {
  const dept = await deptRepo.findById(id);
  if (!dept) throw new NotFoundError('Department not found');
  return dept;
}

export async function createDepartment(data) {
  const existing = await deptRepo.findByName(data.departmentName);
  if (existing) throw new ConflictError('Department name already exists');

  const id = await deptRepo.create(data);
  return deptRepo.findById(id);
}

export async function updateDepartment(id, data) {
  const dept = await deptRepo.findById(id);
  if (!dept) throw new NotFoundError('Department not found');

  if (data.departmentName && data.departmentName !== dept.departmentName) {
    const existing = await deptRepo.findByName(data.departmentName);
    if (existing) throw new ConflictError('Department name already exists');
  }

  await deptRepo.update(id, data);
  return deptRepo.findById(id);
}

export async function deleteDepartment(id) {
  const dept = await deptRepo.findById(id);
  if (!dept) throw new NotFoundError('Department not found');
  await deptRepo.softDelete(id);
}
