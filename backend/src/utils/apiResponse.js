/**
 * Return consistent success response.
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} message
 * @param {object} [data={}]
 */
const sendSuccessResponse = (res, statusCode, message, data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

/**
 * Return consistent error response.
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} message
 * @param {string} errorCode
 */
const sendErrorResponse = (res, statusCode, message, errorCode) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
    timestamp: new Date().toISOString(),
    errorCode,
    error: message // For backward compatibility with existing frontends/middleware checks
  });
};

module.exports = {
  sendSuccessResponse,
  sendErrorResponse
};
