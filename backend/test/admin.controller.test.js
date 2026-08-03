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

test('getInstructors returns list of instructors', async () => {
  const prisma = {
    user: {
      count: async () => 1,
      findMany: async () => [
        {
          id: 'inst-1',
          name: 'Instructor One',
          email: 'inst1@test.com',
          status: 'approved',
          bio: 'Bio',
          avatar: null,
          createdAt: new Date(),
          courses: [
            {
              id: 'course-1',
              title: 'Course One',
              price: 100,
              rating: 4.8,
              status: 'approved',
              _count: { enrollments: 5 }
            }
          ]
        }
      ],
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
  await controller.getInstructors(req, res, (error) => {
    nextError = error;
  });

  assert.equal(nextError, undefined);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.count, 1);
  assert.equal(res.body.data[0].name, 'Instructor One');
  assert.equal(res.body.data[0].revenue, 500); // 5 enrollments * 100 price

  if (originalDbModule) {
    require.cache[dbModulePath] = originalDbModule;
  } else {
    delete require.cache[dbModulePath];
  }
  delete require.cache[controllerModulePath];
});

const cacheModulePath = path.resolve(__dirname, '../src/middlewares/cache.middleware.js');

test('updateCourseStatus clears public course cache', async () => {
  let clearedKeys = [];
  const mockCache = {
    clearCache: async (key) => {
      clearedKeys.push(key);
    }
  };

  const prisma = {
    category: {
      findUnique: async () => ({ id: 'cat-1', name: 'Web' }),
    },
    course: {
      findUnique: async () => ({ id: 'course-1', title: 'Course 1', status: 'pending' }),
      update: async () => ({ id: 'course-1', title: 'Course 1 Updated', status: 'approved' }),
    },
    courseActivity: {
      create: async () => ({}),
    }
  };

  const originalDbModule = require.cache[dbModulePath];
  const originalCacheModule = require.cache[cacheModulePath];

  require.cache[dbModulePath] = {
    id: dbModulePath,
    filename: dbModulePath,
    loaded: true,
    exports: { prisma },
  };

  require.cache[cacheModulePath] = {
    id: cacheModulePath,
    filename: cacheModulePath,
    loaded: true,
    exports: mockCache,
  };

  delete require.cache[controllerModulePath];

  const controller = require('../src/controllers/admin.controller.js');
  const req = {
    params: { id: 'course-1' },
    body: { status: 'approved', category: 'Web' },
    user: { id: 'admin-1', name: 'Admin User' }
  };
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
  await controller.updateCourseStatus(req, res, (error) => {
    nextError = error;
  });

  assert.equal(nextError, undefined);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  
  assert.ok(clearedKeys.includes('cache:/api/courses'));
  assert.ok(clearedKeys.includes('cache:/api/courses/course-1'));

  if (originalDbModule) {
    require.cache[dbModulePath] = originalDbModule;
  } else {
    delete require.cache[dbModulePath];
  }
  if (originalCacheModule) {
    require.cache[cacheModulePath] = originalCacheModule;
  } else {
    delete require.cache[cacheModulePath];
  }
  delete require.cache[controllerModulePath];
});


