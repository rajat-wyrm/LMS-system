const ErrorResponse = require('../utils/errorResponse');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  error.name = err.name;
  error.errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';

  // Log with pino
  logger.error(err);

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
    error.errorCode = 'VALIDATION_ERROR';
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    const message = 'Record not found';
    error = new ErrorResponse(message, 404);
    error.errorCode = 'RESOURCE_NOT_FOUND';
  }

  // Zod Validation Error
  if (err.name === 'ZodError') {
    const message = err.errors.map(val => val.message).join(', ');
    error = new ErrorResponse(message, 400);
    error.errorCode = 'VALIDATION_ERROR';
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again.';
    error = new ErrorResponse(message, 401);
    error.errorCode = 'AUTHENTICATION_ERROR';
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Your token has expired. Please log in again.';
    error = new ErrorResponse(message, 401);
    error.errorCode = 'AUTHENTICATION_ERROR';
  }

  // AppError instance check
  if (err instanceof AppError) {
    error.statusCode = err.statusCode;
    error.errorCode = err.errorCode;
    error.message = err.message;
  }

  // Set default errorCode depending on statusCode
  if (error.errorCode === 'INTERNAL_SERVER_ERROR') {
    if (error.statusCode === 400) {
      error.errorCode = 'VALIDATION_ERROR';
    } else if (error.statusCode === 401) {
      error.errorCode = 'AUTHENTICATION_ERROR';
    } else if (error.statusCode === 403) {
      error.errorCode = 'AUTHORIZATION_ERROR';
    } else if (error.statusCode === 404) {
      error.errorCode = 'RESOURCE_NOT_FOUND';
    }
  }

  // Send standardized error response
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    data: null,
    timestamp: new Date().toISOString(),
    errorCode: error.errorCode || 'INTERNAL_SERVER_ERROR',
    error: error.message || 'Server Error' // Preserve legacy key for compatibility
  });
};

module.exports = { errorHandler };

