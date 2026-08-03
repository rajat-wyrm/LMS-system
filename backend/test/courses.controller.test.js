const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const dbModulePath = path.resolve(__dirname, '../src/config/db.js');
const controllerModulePath = path.resolve(__dirname, '../src/controllers/courses.controller.js');

test('updateCourse allows admin to update any course', async () => {
  const prisma = {
    course: {
      findUnique: async () => ({ id: 'course-123', instructorId: 'instructor-1' }),
      update: async () => ({ id: 'course-123', title: 'Updated Title' }),
    },
    courseActivity: {
      create: async () => ({}),
    }
  };

  const originalDbModule = require.cache[dbModulePath];
  require.cache[dbModulePath] = {
    id: dbModulePath,
    filename: dbModulePath,
    loaded: true,
    exports: { prisma },
  };
  delete require.cache[controllerModulePath];

  const controller = require('../src/controllers/courses.controller.js');
  const req = {
    params: { id: 'course-123' },
    body: { title: 'Updated Title' },
    user: { id: 'admin-999', role: 'admin', name: 'Admin User' }
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
  await controller.updateCourse(req, res, (error) => {
    nextError = error;
  });

  assert.equal(nextError, undefined);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.title, 'Updated Title');

  // clean up
  if (originalDbModule) {
    require.cache[dbModulePath] = originalDbModule;
  } else {
    delete require.cache[dbModulePath];
  }
  delete require.cache[controllerModulePath];
});

test('updateCourse allows instructor to update own course', async () => {
  const prisma = {
    course: {
      findUnique: async () => ({ id: 'course-123', instructorId: 'instructor-1' }),
      update: async () => ({ id: 'course-123', title: 'Updated Title' }),
    },
    courseActivity: {
      create: async () => ({}),
    }
  };

  const originalDbModule = require.cache[dbModulePath];
  require.cache[dbModulePath] = {
    id: dbModulePath,
    filename: dbModulePath,
    loaded: true,
    exports: { prisma },
  };
  delete require.cache[controllerModulePath];

  const controller = require('../src/controllers/courses.controller.js');
  const req = {
    params: { id: 'course-123' },
    body: { title: 'Updated Title' },
    user: { id: 'instructor-1', role: 'instructor', name: 'Instructor One' }
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
  await controller.updateCourse(req, res, (error) => {
    nextError = error;
  });

  assert.equal(nextError, undefined);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);

  if (originalDbModule) {
    require.cache[dbModulePath] = originalDbModule;
  } else {
    delete require.cache[dbModulePath];
  }
  delete require.cache[controllerModulePath];
});

test('updateCourse rejects instructor updating someone else course', async () => {
  const prisma = {
    course: {
      findUnique: async () => ({ id: 'course-123', instructorId: 'instructor-2' }),
    }
  };

  const originalDbModule = require.cache[dbModulePath];
  require.cache[dbModulePath] = {
    id: dbModulePath,
    filename: dbModulePath,
    loaded: true,
    exports: { prisma },
  };
  delete require.cache[controllerModulePath];

  const controller = require('../src/controllers/courses.controller.js');
  const req = {
    params: { id: 'course-123' },
    body: { title: 'Hack Title' },
    user: { id: 'instructor-1', role: 'instructor', name: 'Instructor One' }
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
  await controller.updateCourse(req, res, (error) => {
    nextError = error;
  });

  assert.equal(nextError, undefined);
  assert.equal(res.statusCode, 403);
  assert.equal(res.body.success, false);
  assert.match(res.body.error, /Not authorized/);

  if (originalDbModule) {
    require.cache[dbModulePath] = originalDbModule;
  } else {
    delete require.cache[dbModulePath];
  }
  delete require.cache[controllerModulePath];
});
