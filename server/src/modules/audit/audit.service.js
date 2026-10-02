import * as auditRepo from './audit.repository.js';
import { AUDIT_ACTION } from '../../config/constants.js';

export async function logAction(data) {
  return auditRepo.create(data);
}

export async function logBalanceChange(data) {
  return auditRepo.createBalanceAudit(data);
}

export async function getAuditLogs(query) {
  return auditRepo.findAll(query);
}

export function getActionTypes() {
  return Object.values(AUDIT_ACTION);
}
