const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
<<<<<<< HEAD
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true, email: true, role: true }
      });

      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ success: false, error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized, no token provided' });
  }
};

=======

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded JWT:', decoded);

      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      });

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Not authorized, user not found'
        });
      }

      return next();

    } catch (error) {
      console.error('AUTH ERROR:', error);

      return res.status(401).json({
        success: false,
        error: error.message
      });
    }
  }

  return res.status(401).json({
    success: false,
    error: 'Not authorized, no token provided'
  });
};

 


>>>>>>> 32b6107 (initial commit)
// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
