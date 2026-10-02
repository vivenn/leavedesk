import Joi from 'joi';
import { AUDIT_ACTION } from '../../config/constants.js';

export const listAuditLogsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  userId: Joi.string().uuid().allow(''),
  actionType: Joi.string().valid(...Object.values(AUDIT_ACTION)).allow(''),
  entityType: Joi.string().max(50).allow(''),
  fromDate: Joi.date().iso().raw().allow(''),
  toDate: Joi.when('fromDate', {
    is: Joi.date().iso().required(),
    then: Joi.date().iso().min(Joi.ref('fromDate')),
    otherwise: Joi.date().iso()
  }).raw().allow('')
});
