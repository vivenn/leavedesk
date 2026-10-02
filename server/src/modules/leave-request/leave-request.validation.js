import Joi from 'joi';
import { LEAVE_REQUEST_STATUS } from '../../config/constants.js';

export const createLeaveRequestSchema = Joi.object({
  leaveTypeId: Joi.string().uuid().required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
  reason: Joi.string().min(3).max(500).required(),
  attachmentUrl: Joi.string().max(500).allow('', null)
});

export const listLeaveRequestsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid(...Object.values(LEAVE_REQUEST_STATUS)).allow(''),
  leaveType: Joi.string().uuid().allow(''),
  fromDate: Joi.date().iso().allow(''),
  toDate: Joi.date().iso().allow(''),
  financialYear: Joi.string().pattern(/^\d{4}-\d{4}$/).allow('')
});
