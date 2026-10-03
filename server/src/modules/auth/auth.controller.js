import * as authService from './auth.service.js';
import { setAuthCookie, clearAuthCookie } from './auth.cookie.js';
import { sendSuccess } from '../../shared/utils/response.js';

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { token, user } = await authService.login(email, password);
    setAuthCookie(res, token);
    sendSuccess(res, 'Login successful', { user });
  } catch (err) {
    next(err);
  }
}

export function logout(req, res) {
  clearAuthCookie(res);
  sendSuccess(res, 'Logged out');
}

export async function me(req, res, next) {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    sendSuccess(res, 'Current user', { user });
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
