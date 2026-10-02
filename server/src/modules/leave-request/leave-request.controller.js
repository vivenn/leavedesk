import * as leaveRequestService from './leave-request.service.js';
import { sendSuccess, sendPaginated } from '../../shared/utils/response.js';
import { getPagination, buildPaginationMeta } from '../../shared/utils/pagination.js';

export async function applyLeave(req, res, next) {
  try {
    const request = await leaveRequestService.applyLeave(req.user.id, req.body);
    sendSuccess(res, 'Leave request submitted', request, 201);
  } catch (err) {
    next(err);
  }
}

export async function getMyRequests(req, res, next) {
  try {
    const query = req.validatedQuery || req.query;
    const { page, limit, offset } = getPagination(query);
    const { status, leaveType, fromDate, toDate, financialYear } = query;
    const { requests, total } = await leaveRequestService.getMyRequests(
      req.user.id, { limit, offset, status, leaveType, fromDate, toDate, financialYear }
    );
    sendPaginated(res, 'Leave requests fetched', requests, buildPaginationMeta(page, limit, total));
  } catch (err) {
    next(err);
  }
}

export async function getTeamRequests(req, res, next) {
  try {
    const query = req.validatedQuery || req.query;
    const { page, limit, offset } = getPagination(query);
    const { status } = query;
    const { requests, total } = await leaveRequestService.getTeamRequests(
      req.user.id, { limit, offset, status }
    );
    sendPaginated(res, 'Team leave requests fetched', requests, buildPaginationMeta(page, limit, total));
  } catch (err) {
    next(err);
  }
}

export async function getAllRequests(req, res, next) {
  try {
    const query = req.validatedQuery || req.query;
    const { page, limit, offset } = getPagination(query);
    const { status, financialYear } = query;
    const { requests, total } = await leaveRequestService.getAllRequests(
      { limit, offset, status, financialYear }
    );
    sendPaginated(res, 'All leave requests fetched', requests, buildPaginationMeta(page, limit, total));
  } catch (err) {
    next(err);
  }
}

export async function getRequestById(req, res, next) {
  try {
    const request = await leaveRequestService.getRequestById(req.params.id);
    sendSuccess(res, 'Leave request fetched', request);
  } catch (err) {
    next(err);
  }
}

export async function cancelRequest(req, res, next) {
  try {
    const request = await leaveRequestService.cancelRequest(req.params.id, req.user.id);
    sendSuccess(res, 'Leave request cancelled', request);
  } catch (err) {
    next(err);
  }
}
