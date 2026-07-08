const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');
const AppError = require('../utils/AppError');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true, email: true, role: true }
      });

      if (!req.user) {
        return next(new AppError('Not authorized, user not found', 401, 'AUTHENTICATION_ERROR'));
      }

      return next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return next(new AppError('Access token has expired', 401, 'AUTHENTICATION_ERROR'));
      }
      return next(new AppError('Not authorized, token failed', 401, 'AUTHENTICATION_ERROR'));
    }
  }

  if (!token) {
    return next(new AppError('Not authorized, no token provided', 401, 'AUTHENTICATION_ERROR'));
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Not authorized', 401, 'AUTHENTICATION_ERROR'));
    }
    const hasRole = roles.some(role => req.user.role.toLowerCase() === role.toLowerCase());
    if (!hasRole) {
      return next(new AppError(
        `Role '${req.user.role}' is not authorized to access this route`,
        403,
        'AUTHORIZATION_ERROR'
      ));
    }
    next();
  };
};

const verifyToken = protect;

const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role.toLowerCase() !== 'admin') {
    return next(new AppError('Admin permission required', 403, 'AUTHORIZATION_ERROR'));
  }
  next();
};

module.exports = {
  protect,
  authorize,
  verifyToken,
  verifyAdmin
};

