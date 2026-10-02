import Joi from 'joi';
import { BLOOD_RELATIONS } from '../../config/constants.js';

export const initializeRelationsSchema = Joi.object({
  userId: Joi.string().uuid().required()
});

export const useRelationLeaveSchema = Joi.object({
  relation: Joi.string().valid(...BLOOD_RELATIONS).required()
});
