import * as balanceRepo from './leave-balance.repository.js';
import * as leaveTypeRepo from '../leave-type/leave-type.repository.js';
import { NotFoundError, ValidationError } from '../../shared/errors/app-error.js';
import eventBus from '../../shared/event-bus.js';
import { EVENTS, BALANCE_CHANGE_REASON } from '../../config/constants.js';

const LOW_BALANCE_THRESHOLD = 2;

export async function getBalancesByUser(userId, financialYear) {
  return balanceRepo.findByUser(userId, financialYear);
}

export async function getBalance(userId, leaveTypeId, financialYear) {
  const balance = await balanceRepo.findOne(userId, leaveTypeId, financialYear);
  if (!balance) throw new NotFoundError('Leave balance not found. Initialize balances first.');
  return balance;
}

export async function initializeBalances(userId, financialYear) {
  const leaveTypes = await leaveTypeRepo.findAll();
  const created = [];

  for (const lt of leaveTypes) {
    const id = await balanceRepo.create({
      userId,
      leaveTypeId: lt.id,
      financialYear,
      openingBalance: lt.yearlyLimit,
      carryforwardBalance: 0
    });
    if (id) created.push(lt.leaveTypeName);
  }

  return balanceRepo.findByUser(userId, financialYear);
}

export async function adjustBalance(userId, data, changedBy) {
  const balance = await balanceRepo.findOne(userId, data.leaveTypeId, data.financialYear);
  if (!balance) throw new NotFoundError('Leave balance not found');

  const previousBalance = balance.availableBalance;
  await balanceRepo.setBalance(balance.id, data.availableBalance);

  eventBus.emit(EVENTS.BALANCE_UPDATED, {
    leaveBalanceId: balance.id,
    userId,
    leaveTypeId: data.leaveTypeId,
    previousBalance,
    newBalance: data.availableBalance,
    changeReason: BALANCE_CHANGE_REASON.MANUAL_ADJUSTMENT,
    changedBy
  });

  return balanceRepo.findById(balance.id);
}

export async function deductBalance(userId, leaveTypeId, financialYear, days, leaveRequestId, changedBy) {
  const balance = await balanceRepo.findOne(userId, leaveTypeId, financialYear);
  if (!balance) throw new NotFoundError('Leave balance not found');

  if (balance.availableBalance < days) {
    throw new ValidationError('Insufficient leave balance', 'INSUFFICIENT_BALANCE');
  }

  const previousBalance = balance.availableBalance;
  await balanceRepo.deductBalance(balance.id, days);
  const newBalance = previousBalance - days;

  eventBus.emit(EVENTS.BALANCE_UPDATED, {
    leaveBalanceId: balance.id,
    userId,
    leaveTypeId,
    previousBalance,
    newBalance,
    changeReason: BALANCE_CHANGE_REASON.LEAVE_APPROVED,
    leaveRequestId,
    changedBy
  });

  if (newBalance <= LOW_BALANCE_THRESHOLD) {
    const updated = await balanceRepo.findById(balance.id);
    eventBus.emit(EVENTS.BALANCE_LOW, {
      userId,
      leaveTypeName: updated.leaveTypeName,
      availableBalance: newBalance,
      financialYear
    });
  }
}

export async function restoreBalance(
  userId, leaveTypeId, financialYear, days, leaveRequestId, changedBy,
  changeReason = BALANCE_CHANGE_REASON.LEAVE_CANCELLED
) {
  const balance = await balanceRepo.findOne(userId, leaveTypeId, financialYear);
  if (!balance) return;

  const previousBalance = balance.availableBalance;
  await balanceRepo.restoreBalance(balance.id, days);

  eventBus.emit(EVENTS.BALANCE_UPDATED, {
    leaveBalanceId: balance.id,
    userId,
    leaveTypeId,
    previousBalance,
    newBalance: previousBalance + days,
    changeReason,
    leaveRequestId,
    changedBy
  });
}

export async function checkSufficientBalance(userId, leaveTypeId, financialYear, days) {
  const balance = await balanceRepo.findOne(userId, leaveTypeId, financialYear);
  if (!balance) throw new NotFoundError('Leave balance not found. Initialize balances first.');

  if (balance.availableBalance < days) {
    throw new ValidationError(
      `Insufficient balance. Available: ${balance.availableBalance}, Requested: ${days}`,
      'INSUFFICIENT_BALANCE'
    );
  }
  return balance;
}
