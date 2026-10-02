import * as dashboardRepo from './dashboard.repository.js';
import { ROLES } from '../../config/constants.js';

export async function getDashboard(user) {
  const data = { role: user.role };

  data.employee = await dashboardRepo.getEmployeeStats(user.id);

  if (user.role === ROLES.MANAGER) {
    data.manager = await dashboardRepo.getManagerStats(user.id);
  }

  if (user.role === ROLES.ADMIN) {
    data.manager = await dashboardRepo.getManagerStats(user.id);
    data.admin = await dashboardRepo.getAdminStats();
  }

  return data;
}
