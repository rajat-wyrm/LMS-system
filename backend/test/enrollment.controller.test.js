const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const dbModulePath = path.resolve(__dirname, '../src/config/db.js');
const controllerModulePath = path.resolve(__dirname, '../src/controllers/enrollment.controller.js');

test('syncProgress returns 404 when enrollment is not found', async () => {
  const prisma = {
    enrollment: {
      findUnique: async () => null,
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

  const controller = require('../src/controllers/enrollment.controller.js');
  const req = {
    params: { courseId: 'c1' },
    user: { id: 'u1' },
    body: { completedLessonIds: [] },
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
  await controller.syncProgress(req, res, (error) => {
    nextError = error;
  });

  assert.equal(nextError, undefined);
  assert.equal(res.statusCode, 404);
  assert.equal(res.body.success, false);
  assert.equal(res.body.error, 'Enrollment not found');

  if (originalDbModule) {
    require.cache[dbModulePath] = originalDbModule;
  } else {
    delete require.cache[dbModulePath];
  }
  delete require.cache[controllerModulePath];
});

test('syncProgress merges completed lessons, resolves newer lastWatchedAt, and merges playback positions', async () => {
  let updatedData = null;
  let updatedProgressData = null;

  const enrollmentInDb = {
    id: 'e1',
    userId: 'u1',
    courseId: 'c1',
    progress: 0,
    lastWatchedLessonId: 'lesson-1',
    lastWatchedAt: new Date('2026-08-09T10:00:00.000Z'),
    playbackPositions: { 'lesson-1': 10 },
    completedLessons: [{ id: 'lesson-1' }],
    course: {
      lessons: [{ id: 'lesson-1' }, { id: 'lesson-2' }, { id: 'lesson-3' }],
    },
  };

  const prisma = {
    enrollment: {
      findUnique: async () => enrollmentInDb,
      update: async ({ data }) => {
        if (data.progress !== undefined) {
          updatedProgressData = data;
          return {
            ...enrollmentInDb,
            ...updatedData,
            ...data,
            completedLessons: [
              { id: 'lesson-1' },
              { id: 'lesson-2' },
            ],
          };
        } else {
          updatedData = data;
          return {
            ...enrollmentInDb,
            ...data,
            completedLessons: [
              { id: 'lesson-1' },
              { id: 'lesson-2' },
            ],
          };
        }
      },
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

  const controller = require('../src/controllers/enrollment.controller.js');
  const req = {
    params: { courseId: 'c1' },
    user: { id: 'u1' },
    body: {
      completedLessonIds: ['lesson-2'],
      lastWatchedLessonId: 'lesson-2',
      lastWatchedAt: '2026-08-09T11:00:00.000Z', // newer
      playbackPositions: { 'lesson-1': 5, 'lesson-2': 40 }, // lesson-1 position is 5 (db is 10), so db 10 should be preserved (maximum)
    },
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
  await controller.syncProgress(req, res, (error) => {
    nextError = error;
  });

  assert.equal(nextError, undefined);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);

  // Check update data
  assert.ok(updatedData);
  assert.deepEqual(updatedData.completedLessons, {
    connect: [{ id: 'lesson-2' }],
  });
  assert.equal(updatedData.lastWatchedLessonId, 'lesson-2');
  assert.deepEqual(updatedData.playbackPositions, {
    'lesson-1': 10, // preserved maximum
    'lesson-2': 40,
  });

  // Check progress calculation: 2 completed lessons / 3 total lessons = 67%
  assert.ok(updatedProgressData);
  assert.equal(updatedProgressData.progress, 67);
  assert.equal(updatedProgressData.status, 'active');

  if (originalDbModule) {
    require.cache[dbModulePath] = originalDbModule;
  } else {
    delete require.cache[dbModulePath];
  }
  delete require.cache[controllerModulePath];
});
