import * as leaveRequestRepo from './leave-request.repository.js';
import * as balanceService from '../leave-balance/leave-balance.service.js';
import * as holidayService from '../holiday/holiday.service.js';
import * as userRepo from '../user/user.repository.js';
import { calculateLeaveDays } from './sandwich-leave.helper.js';
import { NotFoundError, ValidationError, ConflictError } from '../../shared/errors/app-error.js';
import { getFinancialYear } from '../../shared/utils/date.js';
import { LEAVE_REQUEST_STATUS, EVENTS } from '../../config/constants.js';
import eventBus from '../../shared/event-bus.js';

export async function applyLeave(userId, data) {
  const financialYear = getFinancialYear(new Date(data.startDate));

  const overlapping = await leaveRequestRepo.findOverlapping(userId, data.startDate, data.endDate);
  if (overlapping.length > 0) {
    throw new ConflictError('You already have a leave request for overlapping dates');
  }

  const holidayDates = await holidayService.getHolidaysBetween(data.startDate, data.endDate);
  const numDays = calculateLeaveDays(data.startDate, data.endDate, holidayDates);

  if (numDays <= 0) {
    throw new ValidationError('No working days in the selected date range');
  }

  await balanceService.checkSufficientBalance(userId, data.leaveTypeId, financialYear, numDays);

  const id = await leaveRequestRepo.create({
    userId,
    leaveTypeId: data.leaveTypeId,
    startDate: data.startDate,
    endDate: data.endDate,
    numDays,
    reason: data.reason,
    attachmentUrl: data.attachmentUrl,
    financialYear
  });

  const request = await leaveRequestRepo.findById(id);

  const user = await userRepo.findById(userId);
  eventBus.emit(EVENTS.LEAVE_APPLIED, {
    leaveRequestId: id,
    userId,
    leaveTypeName: request.leaveTypeName,
    startDate: data.startDate,
    endDate: data.endDate,
    numDays,
    managerId: user?.manager?.id || null
  });

  return request;
}

const EDITABLE_STATUSES = [LEAVE_REQUEST_STATUS.PENDING, LEAVE_REQUEST_STATUS.CHANGES_REQUESTED];

// Employee edits a pending request, or resubmits one after a manager asked for changes
export async function updateRequest(id, userId, data) {
  const request = await leaveRequestRepo.findById(id);
  if (!request) throw new NotFoundError('Leave request not found');

  if (request.userId !== userId) {
    throw new ValidationError('You can only edit your own leave requests');
  }
  if (!EDITABLE_STATUSES.includes(request.status)) {
    throw new ValidationError('Only pending requests or requests awaiting changes can be edited');
  }

  const financialYear = getFinancialYear(new Date(data.startDate));

  const overlapping = await leaveRequestRepo.findOverlapping(userId, data.startDate, data.endDate, id);
  if (overlapping.length > 0) {
    throw new ConflictError('You already have a leave request for overlapping dates');
  }

  const holidayDates = await holidayService.getHolidaysBetween(data.startDate, data.endDate);
  const numDays = calculateLeaveDays(data.startDate, data.endDate, holidayDates);
  if (numDays <= 0) {
    throw new ValidationError('No working days in the selected date range');
  }

  await balanceService.checkSufficientBalance(userId, data.leaveTypeId, financialYear, numDays);

  await leaveRequestRepo.update(id, {
    leaveTypeId: data.leaveTypeId,
    startDate: data.startDate,
    endDate: data.endDate,
    numDays,
    reason: data.reason,
    attachmentUrl: data.attachmentUrl,
    financialYear,
    status: LEAVE_REQUEST_STATUS.PENDING
  });

  const updated = await leaveRequestRepo.findById(id);
  eventBus.emit(EVENTS.LEAVE_RESUBMITTED, {
    leaveRequestId: id,
    userId,
    leaveTypeName: updated.leaveTypeName,
    startDate: data.startDate,
    endDate: data.endDate,
    numDays,
    previousStatus: request.status,
    managerId: updated.managerId
  });

  return updated;
}

export async function getMyRequests(userId, query) {
  return leaveRequestRepo.findByUser(userId, query);
}

export async function getTeamRequests(managerId, query) {
  return leaveRequestRepo.findByTeam(managerId, query);
}

export async function getAllRequests(query) {
  return leaveRequestRepo.findAll(query);
}

export async function getRequestById(id) {
  const request = await leaveRequestRepo.findById(id);
  if (!request) throw new NotFoundError('Leave request not found');
  return request;
}

export async function cancelRequest(id, userId) {
  const request = await leaveRequestRepo.findById(id);
  if (!request) throw new NotFoundError('Leave request not found');

  if (request.userId !== userId) {
    throw new ValidationError('You can only cancel your own leave requests');
  }

  if (request.status === LEAVE_REQUEST_STATUS.CANCELLED) {
    throw new ValidationError('Leave request is already cancelled');
  }

  if (request.status === LEAVE_REQUEST_STATUS.REJECTED) {
    throw new ValidationError('Cannot cancel a rejected leave request');
  }

  const previousStatus = request.status;
  await leaveRequestRepo.updateStatus(id, LEAVE_REQUEST_STATUS.CANCELLED);

  eventBus.emit(EVENTS.LEAVE_CANCELLED, {
    leaveRequestId: id,
    userId,
    leaveTypeId: request.leaveTypeId,
    numDays: request.numDays,
    financialYear: request.financialYear,
    previousStatus
  });

  return leaveRequestRepo.findById(id);
}
