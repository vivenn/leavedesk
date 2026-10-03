import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../../shared/errors/app-error.js';
import { AUTH_COOKIE } from './auth.cookie.js';

// Browser sessions use the httpOnly cookie; the Bearer header stays for API clients and tests
function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return req.cookies?.[AUTH_COOKIE];
}

export function authenticate(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    return next(new UnauthorizedError('Access token is required'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    next(new UnauthorizedError('Invalid or expired token'));
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Access token is required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('You do not have permission to perform this action'));
    }

    next();
  };
}
