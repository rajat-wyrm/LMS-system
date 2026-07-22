const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const dbModulePath = path.resolve(__dirname, '../src/config/db.js');
const controllerModulePath = path.resolve(__dirname, '../src/controllers/admin.controller.js');

test('getDashboardStats returns a revenue trend without crashing', async () => {
  const prisma = {
    user: {
      count: async () => 0,
      findMany: async () => [],
    },
    course: {
      count: async () => 0,
    },
    enrollment: {
      count: async () => 0,
      findMany: async () => [],
    },
  };

  const originalDbModule = require.cache[dbModulePath];
  require.cache[dbModulePath] = {
    id: dbModulePath,
    filename: dbModulePath,
    loaded: true,
    exports: { prisma },
  };
  delete require.cache[controllerModulePath];

  const controller = require('../src/controllers/admin.controller.js');
  const req = { query: {} };
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
    },
  };

  let nextError;
  await controller.getDashboardStats(req, res, (error) => {
    nextError = error;
  });

  assert.equal(nextError, undefined);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.revenueTrend, '0%');
  assert.equal(res.body.data.revenueTrendUp, true);

  if (originalDbModule) {
    require.cache[dbModulePath] = originalDbModule;
  } else {
    delete require.cache[dbModulePath];
  }
  delete require.cache[controllerModulePath];
});
