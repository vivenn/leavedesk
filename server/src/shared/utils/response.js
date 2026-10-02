export function sendSuccess(res, message, data = null, statusCode = 200) {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
}

export function sendPaginated(res, message, data, pagination) {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination
  });
}

export function sendError(res, message, statusCode = 500, errorCode = null) {
  const response = { success: false, message };
  if (errorCode) response.error = { code: errorCode };
  return res.status(statusCode).json(response);
}
