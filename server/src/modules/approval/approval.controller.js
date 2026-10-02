import * as approvalService from './approval.service.js';
import { sendSuccess, sendPaginated } from '../../shared/utils/response.js';
import { getPagination, buildPaginationMeta } from '../../shared/utils/pagination.js';

export async function getPendingApprovals(req, res, next) {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { requests, total } = await approvalService.getPendingApprovals(req.user, { limit, offset });
    sendPaginated(res, 'Pending approvals fetched', requests, buildPaginationMeta(page, limit, total));
  } catch (err) {
    next(err);
  }
}

export async function approveRequest(req, res, next) {
  try {
    const result = await approvalService.approveRequest(
      req.params.leaveRequestId, req.user, req.body.remarks
    );
    sendSuccess(res, 'Leave request approved', result);
  } catch (err) {
    next(err);
  }
}

export async function rejectRequest(req, res, next) {
  try {
    const result = await approvalService.rejectRequest(
      req.params.leaveRequestId, req.user, req.body.remarks
    );
    sendSuccess(res, 'Leave request rejected', result);
  } catch (err) {
    next(err);
  }
}

export async function escalateRequest(req, res, next) {
  try {
    const result = await approvalService.escalateRequest(
      req.params.leaveRequestId, req.user, req.body.remarks
    );
    sendSuccess(res, 'Leave request escalated to administrator', result);
  } catch (err) {
    next(err);
  }
}

export async function requestChanges(req, res, next) {
  try {
    const result = await approvalService.requestChanges(
      req.params.leaveRequestId, req.user, req.body.remarks
    );
    sendSuccess(res, 'Changes requested from employee', result);
  } catch (err) {
    next(err);
  }
}

export async function getApprovalHistory(req, res, next) {
  try {
    const result = await approvalService.getApprovalHistory(req.params.leaveRequestId);
    sendSuccess(res, 'Approval history fetched', result);
  } catch (err) {
    next(err);
  }
}
