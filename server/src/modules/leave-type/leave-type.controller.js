import * as leaveTypeService from './leave-type.service.js';
import { sendSuccess } from '../../shared/utils/response.js';

export async function listLeaveTypes(req, res, next) {
  try {
    const types = await leaveTypeService.listLeaveTypes();
    sendSuccess(res, 'Leave types fetched', types);
  } catch (err) {
    next(err);
  }
}

export async function getLeaveTypeById(req, res, next) {
  try {
    const lt = await leaveTypeService.getLeaveTypeById(req.params.id);
    sendSuccess(res, 'Leave type fetched', lt);
  } catch (err) {
    next(err);
  }
}

export async function createLeaveType(req, res, next) {
  try {
    const lt = await leaveTypeService.createLeaveType(req.body);
    sendSuccess(res, 'Leave type created', lt, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateLeaveType(req, res, next) {
  try {
    const lt = await leaveTypeService.updateLeaveType(req.params.id, req.body);
    sendSuccess(res, 'Leave type updated', lt);
  } catch (err) {
    next(err);
  }
}

export async function deleteLeaveType(req, res, next) {
  try {
    await leaveTypeService.deleteLeaveType(req.params.id);
    sendSuccess(res, 'Leave type deactivated');
  } catch (err) {
    next(err);
  }
}
