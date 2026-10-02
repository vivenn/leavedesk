import eventBus from '../../shared/event-bus.js';
import { EVENTS } from '../../config/constants.js';
import * as balanceService from './leave-balance.service.js';

eventBus.on(EVENTS.LEAVE_APPROVED, async (payload) => {
  try {
    if (!payload.finalApproval) return;
    await balanceService.deductBalance(
      payload.userId,
      payload.leaveTypeId,
      payload.financialYear,
      payload.numDays,
      payload.leaveRequestId,
      payload.approverId
    );
  } catch (err) {
    console.error('Balance deduction failed:', err.message);
  }
});

eventBus.on(EVENTS.LEAVE_CANCELLED, async (payload) => {
  try {
    if (payload.previousStatus !== 'APPROVED') return;
    await balanceService.restoreBalance(
      payload.userId,
      payload.leaveTypeId,
      payload.financialYear,
      payload.numDays,
      payload.leaveRequestId,
      payload.userId
    );
  } catch (err) {
    console.error('Balance restoration failed:', err.message);
  }
});
