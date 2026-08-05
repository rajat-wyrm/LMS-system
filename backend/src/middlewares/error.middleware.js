const ErrorResponse = require('../utils/errorResponse');

const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode;
  error.name = err.name;

  // Log with pino
  logger.error(err);

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    const message = 'Record not found';
    error = new ErrorResponse(message, 404);
  }

  // Zod Validation Error
  if (err.name === 'ZodError') {
    const message = err.errors.map(val => val.message).join(', ');
    error = new ErrorResponse(message, 400);
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again.';
    error = new ErrorResponse(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Your token has expired. Please log in again.';
    error = new ErrorResponse(message, 401);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};

module.exports = { errorHandler };
