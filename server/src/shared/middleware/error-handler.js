import { AppError } from '../errors/app-error.js';

// PostgreSQL error codes caused by bad client input rather than server faults
const PG_CLIENT_ERRORS = {
  '22P02': { status: 400, code: 'INVALID_INPUT', message: 'Invalid identifier or value format' },
  '23503': { status: 400, code: 'INVALID_REFERENCE', message: 'Referenced record does not exist' },
  '23505': { status: 409, code: 'CONFLICT', message: 'Record already exists' }
};

export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: err.errorCode ? { code: err.errorCode } : undefined
    });
  }

  const pgError = PG_CLIENT_ERRORS[err.code];
  if (pgError) {
    return res.status(pgError.status).json({
      success: false,
      message: pgError.message,
      error: { code: pgError.code }
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
