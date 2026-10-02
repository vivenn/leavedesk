import Joi from 'joi';

export const createHolidaySchema = Joi.object({
  holidayName: Joi.string().max(100).required(),
  holidayDate: Joi.date().iso().required(),
  holidayType: Joi.string().valid('PUBLIC', 'COMPANY', 'REGIONAL').required(),
  financialYear: Joi.string().pattern(/^\d{4}-\d{4}$/).required()
});

export const updateHolidaySchema = Joi.object({
  holidayName: Joi.string().max(100),
  holidayDate: Joi.date().iso(),
  holidayType: Joi.string().valid('PUBLIC', 'COMPANY', 'REGIONAL'),
  financialYear: Joi.string().pattern(/^\d{4}-\d{4}$/),
  isActive: Joi.boolean()
}).min(1);

export const listHolidaysQuerySchema = Joi.object({
  financialYear: Joi.string().pattern(/^\d{4}-\d{4}$/).allow(''),
  holidayType: Joi.string().valid('PUBLIC', 'COMPANY', 'REGIONAL').allow('')
});
