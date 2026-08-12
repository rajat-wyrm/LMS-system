const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  const expiresIn = process.env.JWT_EXPIRES_IN || process.env.JWT_EXPIRE || '30d';

  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn,
  });
};

module.exports = { generateToken };
