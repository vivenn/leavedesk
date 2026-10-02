import Joi from 'joi';

export const createDepartmentSchema = Joi.object({
  departmentName: Joi.string().max(100).required(),
  parentDepartmentId: Joi.string().uuid().allow(null)
});

export const updateDepartmentSchema = Joi.object({
  departmentName: Joi.string().max(100),
  parentDepartmentId: Joi.string().uuid().allow(null),
  isActive: Joi.boolean()
}).min(1);
