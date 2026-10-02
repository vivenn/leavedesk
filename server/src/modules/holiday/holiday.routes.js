import { Router } from 'express';
import { validate, validateQuery } from '../../shared/middleware/validate.js';
import { authenticate, authorize } from '../auth/auth.middleware.js';
import { createHolidaySchema, updateHolidaySchema, listHolidaysQuerySchema } from './holiday.validation.js';
import * as holidayController from './holiday.controller.js';
import { ROLES } from '../../config/constants.js';

const router = Router();

router.use(authenticate);

router.get('/', validateQuery(listHolidaysQuerySchema), holidayController.listHolidays);
router.get('/upcoming', holidayController.getUpcomingHolidays);
router.get('/:id', holidayController.getHolidayById);
router.post('/', authorize(ROLES.ADMIN), validate(createHolidaySchema), holidayController.createHoliday);
router.put('/:id', authorize(ROLES.ADMIN), validate(updateHolidaySchema), holidayController.updateHoliday);
router.delete('/:id', authorize(ROLES.ADMIN), holidayController.deleteHoliday);

export default router;
