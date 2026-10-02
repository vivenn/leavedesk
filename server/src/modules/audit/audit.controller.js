import * as auditService from './audit.service.js';
import { sendPaginated } from '../../shared/utils/response.js';
import { getPagination, buildPaginationMeta } from '../../shared/utils/pagination.js';

export async function getAuditLogs(req, res, next) {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { userId, actionType, entityType, fromDate, toDate } = req.query;
    const { logs, total } = await auditService.getAuditLogs({ limit, offset, userId, actionType, entityType, fromDate, toDate });
    sendPaginated(res, 'Audit logs fetched', logs, buildPaginationMeta(page, limit, total));
  } catch (err) {
    next(err);
  }
}
