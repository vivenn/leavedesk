import * as balanceService from './leave-balance.service.js';
import { sendSuccess } from '../../shared/utils/response.js';
import { getFinancialYear } from '../../shared/utils/date.js';

export async function getMyBalances(req, res, next) {
  try {
    const financialYear = req.query.financialYear || getFinancialYear();
    const balances = await balanceService.getBalancesByUser(req.user.id, financialYear);
    sendSuccess(res, 'Balances fetched', balances);
  } catch (err) {
    next(err);
  }
}

export async function getUserBalances(req, res, next) {
  try {
    const financialYear = req.query.financialYear || getFinancialYear();
    const balances = await balanceService.getBalancesByUser(req.params.userId, financialYear);
    sendSuccess(res, 'Balances fetched', balances);
  } catch (err) {
    next(err);
  }
}

export async function adjustBalance(req, res, next) {
  try {
    const balance = await balanceService.adjustBalance(req.params.userId, req.body, req.user.id);
    sendSuccess(res, 'Balance adjusted', balance);
  } catch (err) {
    next(err);
  }
}

export async function initializeBalances(req, res, next) {
  try {
    const { userId, financialYear } = req.body;
    const balances = await balanceService.initializeBalances(userId, financialYear);
    sendSuccess(res, 'Balances initialized', balances, 201);
  } catch (err) {
    next(err);
  }
}
