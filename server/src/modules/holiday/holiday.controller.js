import * as holidayService from './holiday.service.js';
import { sendSuccess } from '../../shared/utils/response.js';

export async function listHolidays(req, res, next) {
  try {
    const query = req.validatedQuery || req.query;
    const holidays = await holidayService.listHolidays(query);
    sendSuccess(res, 'Holidays fetched', holidays);
  } catch (err) {
    next(err);
  }
}

export async function getHolidayById(req, res, next) {
  try {
    const holiday = await holidayService.getHolidayById(req.params.id);
    sendSuccess(res, 'Holiday fetched', holiday);
  } catch (err) {
    next(err);
  }
}

export async function getUpcomingHolidays(req, res, next) {
  try {
    const holidays = await holidayService.getUpcomingHolidays();
    sendSuccess(res, 'Upcoming holidays fetched', holidays);
  } catch (err) {
    next(err);
  }
}

export async function createHoliday(req, res, next) {
  try {
    const holiday = await holidayService.createHoliday(req.body);
    sendSuccess(res, 'Holiday created', holiday, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateHoliday(req, res, next) {
  try {
    const holiday = await holidayService.updateHoliday(req.params.id, req.body);
    sendSuccess(res, 'Holiday updated', holiday);
  } catch (err) {
    next(err);
  }
}

export async function deleteHoliday(req, res, next) {
  try {
    await holidayService.deleteHoliday(req.params.id);
    sendSuccess(res, 'Holiday deactivated');
  } catch (err) {
    next(err);
  }
}
