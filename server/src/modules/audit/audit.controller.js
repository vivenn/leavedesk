import * as auditService from './audit.service.js';
import { sendSuccess, sendPaginated } from '../../shared/utils/response.js';
import { getPagination, buildPaginationMeta } from '../../shared/utils/pagination.js';

export async function getAuditLogs(req, res, next) {
  try {
    const query = req.validatedQuery || req.query;
    const { page, limit, offset } = getPagination(query);
    const { userId, actionType, entityType, fromDate, toDate } = query;
    const { logs, total } = await auditService.getAuditLogs({ limit, offset, userId, actionType, entityType, fromDate, toDate });
    sendPaginated(res, 'Audit logs fetched', logs, buildPaginationMeta(page, limit, total));
  } catch (err) {
    next(err);
  }
}

export function getActionTypes(req, res) {
  sendSuccess(res, 'Audit action types fetched', auditService.getActionTypes());
}
