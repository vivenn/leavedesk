import { jest } from '@jest/globals';
import { errorHandler } from '../../shared/middleware/error-handler.js';
import { ValidationError, NotFoundError } from '../../shared/errors/app-error.js';

function mockResponse() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe('errorHandler', () => {
  test('uses the status and code of application errors', () => {
    const res = mockResponse();
    errorHandler(new NotFoundError('Leave request not found'), {}, res, () => {});
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Leave request not found',
      error: { code: 'NOT_FOUND' }
    });
  });

  test('keeps custom error codes', () => {
    const res = mockResponse();
    errorHandler(new ValidationError('Insufficient balance', 'INSUFFICIENT_BALANCE'), {}, res, () => {});
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].error).toEqual({ code: 'INSUFFICIENT_BALANCE' });
  });

  test.each([
    ['22P02', 400, 'INVALID_INPUT'],
    ['23503', 400, 'INVALID_REFERENCE'],
    ['23505', 409, 'CONFLICT']
  ])('maps PostgreSQL error %s to %i', (code, status, errorCode) => {
    const res = mockResponse();
    errorHandler(Object.assign(new Error('pg error'), { code }), {}, res, () => {});
    expect(res.status).toHaveBeenCalledWith(status);
    expect(res.json.mock.calls[0][0].error).toEqual({ code: errorCode });
  });

  test('hides unexpected error details in production', () => {
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = mockResponse();

    errorHandler(new Error('connection string leaked'), {}, res, () => {});

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json.mock.calls[0][0].message).toBe('Internal server error');
    spy.mockRestore();
    process.env.NODE_ENV = previous;
  });
});
