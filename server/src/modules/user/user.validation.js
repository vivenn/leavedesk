import Joi from 'joi';

export const createUserSchema = Joi.object({
  firstName: Joi.string().max(100).required(),
  lastName: Joi.string().max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().max(15).allow('', null),
  roleId: Joi.string().uuid().required(),
  departmentId: Joi.string().uuid().allow(null),
  managerId: Joi.string().uuid().allow(null)
});

export const updateUserSchema = Joi.object({
  firstName: Joi.string().max(100),
  lastName: Joi.string().max(100),
  email: Joi.string().email(),
  phone: Joi.string().max(15).allow('', null),
  roleId: Joi.string().uuid(),
  departmentId: Joi.string().uuid().allow(null),
  managerId: Joi.string().uuid().allow(null),
  isActive: Joi.boolean()
}).min(1);

export const listUsersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  role: Joi.string().allow(''),
  department: Joi.string().uuid().allow(''),
  isActive: Joi.string().valid('true', 'false').allow(''),
  search: Joi.string().max(100).allow('')
});
