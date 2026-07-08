const logger = require('../utils/logger');

/**
 * Middleware to capture and log structured information for all incoming requests.
 * Ensures we do not log sensitive information (tokens, passwords, secrets, JWTs).
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const responseTime = `${duration}ms`;

    // Extract user ID safely, falling back to 'Anonymous'
    const userId = req.user ? (req.user.id || req.user.userId || 'Anonymous') : 'Anonymous';

    // Construct structured log object (never include headers, body, or tokens here to prevent leaks)
    const logInfo = {
      timestamp: new Date().toISOString(),
      method: req.method,
      endpoint: req.originalUrl || req.url,
      userId,
      statusCode: res.statusCode,
      responseTime
    };

    logger.info(logInfo, `Request: ${req.method} ${req.originalUrl || req.url} - ${res.statusCode} (${responseTime})`);
  });

  next();
};

module.exports = requestLogger;
