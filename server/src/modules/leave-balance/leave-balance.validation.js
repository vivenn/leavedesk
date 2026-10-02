import Joi from 'joi';

export const adjustBalanceSchema = Joi.object({
  leaveTypeId: Joi.string().uuid().required(),
  financialYear: Joi.string().pattern(/^\d{4}-\d{4}$/).required(),
  availableBalance: Joi.number().min(0).required(),
  reason: Joi.string().max(100).required()
});

export const initializeBalancesSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  financialYear: Joi.string().pattern(/^\d{4}-\d{4}$/).required()
});
