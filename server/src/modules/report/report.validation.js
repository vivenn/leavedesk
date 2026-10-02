import Joi from 'joi';

export const generateReportSchema = Joi.object({
  reportType: Joi.string().valid('OVERALL', 'EMPLOYEE_WISE', 'DEPARTMENT_WISE', 'LEAVE_TYPE_WISE').required(),
  month: Joi.string().pattern(/^\d{4}-\d{2}$/).required()
    .messages({ 'string.pattern.base': 'month must be in YYYY-MM format' })
});

export const listReportsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  reportType: Joi.string().valid('OVERALL', 'EMPLOYEE_WISE', 'DEPARTMENT_WISE', 'LEAVE_TYPE_WISE').allow(''),
  reportMonth: Joi.string().pattern(/^\d{4}-\d{2}$/).allow('')
});

export const monthQuerySchema = Joi.object({
  month: Joi.string().pattern(/^\d{4}-\d{2}$/).required()
    .messages({ 'string.pattern.base': 'month must be in YYYY-MM format' })
});
