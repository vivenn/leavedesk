import * as authService from './auth.service.js';
import { sendSuccess } from '../../shared/utils/response.js';

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    sendSuccess(res, 'Login successful', result);
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user.id, currentPassword, newPassword);
    sendSuccess(res, 'Password changed successfully');
  } catch (err) {
    next(err);
  }
}
