import * as holidayRepo from './holiday.repository.js';
import { NotFoundError } from '../../shared/errors/app-error.js';

export async function listHolidays(filters) {
  return holidayRepo.findAll(filters);
}

export async function getHolidayById(id) {
  const holiday = await holidayRepo.findById(id);
  if (!holiday) throw new NotFoundError('Holiday not found');
  return holiday;
}

export async function getUpcomingHolidays() {
  return holidayRepo.findUpcoming();
}

export async function getHolidaysBetween(startDate, endDate) {
  return holidayRepo.findBetweenDates(startDate, endDate);
}

export async function createHoliday(data) {
  const id = await holidayRepo.create(data);
  return holidayRepo.findById(id);
}

export async function updateHoliday(id, data) {
  const holiday = await holidayRepo.findById(id);
  if (!holiday) throw new NotFoundError('Holiday not found');

  await holidayRepo.update(id, data);
  return holidayRepo.findById(id);
}

export async function deleteHoliday(id) {
  const holiday = await holidayRepo.findById(id);
  if (!holiday) throw new NotFoundError('Holiday not found');
  await holidayRepo.softDelete(id);
}
