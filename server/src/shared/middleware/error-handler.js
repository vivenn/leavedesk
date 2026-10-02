import { AppError } from '../errors/app-error.js';

export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: err.errorCode ? { code: err.errorCode } : undefined
    });
  }

  console.error('Unhandled error:', err);

  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
}
