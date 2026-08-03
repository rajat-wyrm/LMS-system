class AppError extends Error {
  /**
   * Create an AppError.
   * @param {string} message - The error message.
   * @param {number} statusCode - The HTTP status code.
   * @param {string} errorCode - The specific application error code.
   */
  constructor(message, statusCode, errorCode) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
