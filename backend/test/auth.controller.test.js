const test = require('node:test');
const assert = require('node:assert/strict');
const { prisma } = require('../src/config/db');
const authController = require('../src/controllers/auth.controller');

test('login falls back to seeded demo credentials when Prisma cannot connect', async () => {
  const originalFindUnique = prisma.user.findUnique;
  prisma.user.findUnique = async () => {
    const error = new Error('connect ECONNREFUSED');
    error.code = 'ECONNREFUSED';
    throw error;
  };

  const response = {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
    },
  };

  await authController.login(
    { body: { email: 'admin.amit@lms.com', password: 'password123' } },
    response,
    (err) => {
      throw err;
    }
  );

  assert.equal(response.statusCode, 200);
  assert.equal(response.payload.success, true);
  assert.equal(response.payload.user.email, 'admin.amit@lms.com');
  assert.equal(response.payload.user.role, 'admin');

  prisma.user.findUnique = originalFindUnique;
});
