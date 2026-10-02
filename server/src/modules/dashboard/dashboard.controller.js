import * as dashboardService from './dashboard.service.js';
import { sendSuccess } from '../../shared/utils/response.js';

export async function getDashboard(req, res, next) {
  try {
    const data = await dashboardService.getDashboard(req.user);
    sendSuccess(res, 'Dashboard data fetched', data);
  } catch (err) {
    next(err);
  }
}
