import Joi from 'joi';

export const approvalActionSchema = Joi.object({
  remarks: Joi.string().max(500).allow('', null)
});
