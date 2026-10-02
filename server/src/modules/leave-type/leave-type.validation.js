import Joi from 'joi';

export const createLeaveTypeSchema = Joi.object({
  leaveTypeName: Joi.string().max(50).required(),
  yearlyLimit: Joi.number().integer().min(0).required(),
  isCarryforwardAllowed: Joi.boolean().default(false),
  maxCarryforwardDays: Joi.number().integer().min(0).allow(null),
  expiryDays: Joi.number().integer().min(0).allow(null)
});

export const updateLeaveTypeSchema = Joi.object({
  leaveTypeName: Joi.string().max(50),
  yearlyLimit: Joi.number().integer().min(0),
  isCarryforwardAllowed: Joi.boolean(),
  maxCarryforwardDays: Joi.number().integer().min(0).allow(null),
  expiryDays: Joi.number().integer().min(0).allow(null),
  isActive: Joi.boolean()
}).min(1);
