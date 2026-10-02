import Joi from 'joi';

export const remarksRequiredSchema = Joi.object({
  remarks: Joi.string().trim().min(3).max(500).required()
});

export const approvalActionSchema = Joi.object({
  remarks: Joi.string().max(500).allow('', null)
});
