import { Router } from 'express';
import { validate } from '../../shared/middleware/validate.js';
import { authenticate, authorize } from '../auth/auth.middleware.js';
import { initializeRelationsSchema, useRelationLeaveSchema } from './blood-relation.validation.js';
import * as bloodRelController from './blood-relation.controller.js';
import { ROLES } from '../../config/constants.js';

const router = Router();

router.use(authenticate);

router.get('/', bloodRelController.getMyRelations);
router.get('/:userId', authorize(ROLES.ADMIN), bloodRelController.getUserRelations);
router.post('/initialize', authorize(ROLES.ADMIN), validate(initializeRelationsSchema), bloodRelController.initializeRelations);
router.post('/use', validate(useRelationLeaveSchema), bloodRelController.useRelationLeave);

export default router;
