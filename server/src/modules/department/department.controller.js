import * as deptService from './department.service.js';
import { sendSuccess } from '../../shared/utils/response.js';

export async function listDepartments(req, res, next) {
  try {
    const departments = await deptService.listDepartments();
    sendSuccess(res, 'Departments fetched', departments);
  } catch (err) {
    next(err);
  }
}

export async function getDepartmentById(req, res, next) {
  try {
    const dept = await deptService.getDepartmentById(req.params.id);
    sendSuccess(res, 'Department fetched', dept);
  } catch (err) {
    next(err);
  }
}

export async function createDepartment(req, res, next) {
  try {
    const dept = await deptService.createDepartment(req.body);
    sendSuccess(res, 'Department created', dept, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateDepartment(req, res, next) {
  try {
    const dept = await deptService.updateDepartment(req.params.id, req.body);
    sendSuccess(res, 'Department updated', dept);
  } catch (err) {
    next(err);
  }
}

export async function deleteDepartment(req, res, next) {
  try {
    await deptService.deleteDepartment(req.params.id);
    sendSuccess(res, 'Department deactivated');
  } catch (err) {
    next(err);
  }
}
