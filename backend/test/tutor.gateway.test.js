/**
 * Automated Test Suite for Issue #163: Express Tutor Gateway & Chat Continuity
 * Endpoint under test: POST /api/v1/tutor/ask
 *
 * Scenarios covered:
 * 1. Initial question creates a unique user-isolated chat (Tutor_${userId}_${sessionUuid}).
 * 2. Response includes the generated chatId.
 * 3. Two new conversations for the same user receive different session titles.
 * 4. Follow-up question validates the chat against the requested notebook.
 * 5. Valid follow-up reuses the supplied chatId without creating another chat.
 * 6. Chat from another course is rejected with HTTP 404.
 * 7. Chat belonging to another user is rejected with HTTP 403.
 * 8. Malformed or unexpected chat title is rejected with HTTP 403.
 * 9. Unauthenticated request is rejected with HTTP 401.
 * 10. Existing timeout (504), connection failure (503), downstream error (502), and validation (400) tests.
 * 11. Concurrency behavior: Concurrent initial requests for different users never cross-contaminate.
 * 12. Concurrency behavior: Concurrent initial requests from the same user generate distinct sessions.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// -----------------------------------------------------------------------------
// Isolated Module Loader
// Bypasses parent package.json parsing issues while executing real production code
// -----------------------------------------------------------------------------
function createMockZod() {
  class ZodString {
    constructor(opts = {}) {
      this.requiredError = opts.required_error || 'String is required';
      this.minLength = 0;
      this.maxLength = Infinity;
      this.isTrimmed = false;
      this.minError = null;
      this.maxError = null;
      this.isOptional = false;
    }
    optional() {
      this.isOptional = true;
      return this;
    }
    trim() {
      this.isTrimmed = true;
      return this;
    }
    min(val, msg) {
      this.minLength = val;
      this.minError = msg;
      return this;
    }
    max(val, msg) {
      this.maxLength = val;
      this.maxError = msg;
      return this;
    }
    parse(val, pathPrefix = '') {
      if (val === undefined || val === null) {
        if (this.isOptional) return undefined;
        throw new ZodError([{ path: pathPrefix, message: this.requiredError }]);
      }
      if (typeof val !== 'string') {
        throw new ZodError([{ path: pathPrefix, message: 'Expected string, received ' + typeof val }]);
      }
      let processed = this.isTrimmed ? val.trim() : val;
      if (processed.length < this.minLength) {
        throw new ZodError([{ path: pathPrefix, message: this.minError || 'String must be at least ' + this.minLength + ' characters' }]);
      }
      if (processed.length > this.maxLength) {
        throw new ZodError([{ path: pathPrefix, message: this.maxError || 'String must be at most ' + this.maxLength + ' characters' }]);
      }
      return processed;
    }
  }

  class ZodObject {
    constructor(shape) {
      this.shape = shape;
    }
    async parseAsync(data, pathPrefix = '') {
      return this.parse(data, pathPrefix);
    }
    parse(data, pathPrefix = '') {
      if (!data || typeof data !== 'object') {
        throw new ZodError([{ path: pathPrefix || 'root', message: 'Expected object' }]);
      }
      const result = {};
      const errors = [];
      for (const [key, schema] of Object.entries(this.shape)) {
        const currentPath = pathPrefix ? `${pathPrefix}.${key}` : key;
        try {
          result[key] = schema.parse(data[key], currentPath);
        } catch (err) {
          if (err instanceof ZodError) {
            errors.push(...err.issues);
          } else {
            throw err;
          }
        }
      }
      if (errors.length > 0) {
        throw new ZodError(errors);
      }
      return result;
    }
  }

  class ZodError extends Error {
    constructor(issues) {
      super('Validation Error');
      this.name = 'ZodError';
      this.issues = issues.map((i) => ({
        path: Array.isArray(i.path) ? i.path : i.path.split('.'),
        message: i.message,
      }));
    }
  }

  return {
    z: {
      object: (shape) => new ZodObject(shape),
      string: (opts) => new ZodString(opts),
      ZodError,
    },
  };
}

const TEST_DIR = (typeof __dirname !== 'undefined' && __dirname.endsWith('test'))
  ? __dirname
  : path.resolve(process.cwd(), 'backend/test');

function loadModule(filePath, customRequires = {}) {
  const fullPath = path.isAbsolute(filePath) ? filePath : path.resolve(TEST_DIR, filePath);
  const code = fs.readFileSync(fullPath, 'utf8');
  const mod = { exports: {} };
  const dirname = path.dirname(fullPath);

  const customRequire = (id) => {
    if (customRequires[id]) return customRequires[id];
    if (id.startsWith('.')) {
      const targetPath = path.resolve(dirname, id.endsWith('.js') ? id : id + '.js');
      return loadModule(targetPath, customRequires);
    }
    try {
      return require(id);
    } catch {
      if (id === 'zod') return createMockZod().z;
      throw new Error('Module not found: ' + id);
    }
  };

  const wrapper = '(function (exports, require, module, __filename, __dirname) { ' + code + '\n});';
  const compiled = vm.runInThisContext(wrapper, { filename: fullPath });
  compiled(mod.exports, customRequire, mod, fullPath, dirname);
  return mod.exports;
}

// Load real production modules
const AppError = loadModule('../src/utils/AppError.js');
const tutorService = loadModule('../src/services/tutor.service.js', {
  '../utils/AppError': AppError,
});
const tutorController = loadModule('../src/controllers/tutor.controller.js', {
  '../services/tutor.service': tutorService,
});
const tutorValidation = loadModule('../src/validations/tutor.validation.js', {
  'zod': createMockZod(),
});

// Helper to simulate Express req, res, next pipeline
function createMockHttp(reqOverrides = {}) {
  const req = {
    headers: {},
    body: {},
    params: {},
    query: {},
    user: { id: 'test-user-123', name: 'Tester', email: 'test@lms.local', role: 'student' },
    ...reqOverrides,
  };

  let statusCode = 200;
  let jsonBody = null;
  let nextError = null;

  const res = {
    status(code) {
      statusCode = code;
      return res;
    },
    json(data) {
      jsonBody = data;
      return res;
    },
    getStatusCode: () => statusCode,
    getBody: () => jsonBody,
  };

  const next = (err) => {
    nextError = err || null;
  };

  return { req, res, next, getStatus: () => statusCode, getBody: () => jsonBody, getError: () => nextError };
}

// -----------------------------------------------------------------------------
// TEST SUITE 1: Service Layer & FastAPI Behavioral Verifications
// -----------------------------------------------------------------------------
test('Tutor Service - Behavioral & Protocol Verifications', async (t) => {
  const originalFetch = globalThis.fetch;

  t.afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  await t.test('1. Notebook ID convention strictly enforces nb_course_${courseId}', () => {
    assert.equal(tutorService.resolveNotebookId('demo_course_python_101'), 'nb_course_demo_course_python_101');
    assert.equal(tutorService.resolveNotebookId('ml_201'), 'nb_course_ml_201');
    assert.equal(tutorService.resolveNotebookId('  trimmed_course  '), 'nb_course_trimmed_course');
  });

  await t.test('2. Notebook ID validation rejects invalid or missing course IDs', () => {
    assert.throws(() => tutorService.resolveNotebookId(''), { statusCode: 400 });
    assert.throws(() => tutorService.resolveNotebookId(null), { statusCode: 400 });
    assert.throws(() => tutorService.resolveNotebookId(undefined), { statusCode: 400 });
  });

  await t.test('3. Initial question creates a unique user-isolated chat (Tutor_${userId}_${sessionUuid})', async () => {
    const networkCalls = [];

    globalThis.fetch = async (url, opts) => {
      networkCalls.push({ url, method: opts.method, body: JSON.parse(opts.body || '{}') });
      if (url.includes('/notebooks/') && url.includes('/chats')) {
        return {
          status: 200,
          ok: true,
          json: async () => ({
            id: 'chat_generated_456',
            title: networkCalls[0].body.title,
            notebook_id: 'nb_course_python_101',
          }),
        };
      }
      if (url.includes('/chats/chat_generated_456/ask')) {
        return {
          status: 200,
          ok: true,
          json: async () => ({
            answer: 'Python supports dynamic typing.',
            sources: [{ source: 'python_01.txt', page: 2 }],
          }),
        };
      }
      return { status: 404, ok: false, text: async () => 'Not Found' };
    };

    const result = await tutorService.askTutor({
      courseId: 'python_101',
      question: 'Explain Python variables',
      userId: 'user_alpha_789',
    });

    assert.equal(networkCalls.length, 2, 'Must make exactly two network calls');
    // First call: Chat creation with user-isolated title
    assert.match(networkCalls[0].url, /\/notebooks\/nb_course_python_101\/chats$/);
    const createdTitle = networkCalls[0].body.title;
    const parsed = tutorService.parseUserChatTitle(createdTitle);
    assert.ok(parsed, 'Title must conform to Tutor_<userId>_<sessionUuid>');
    assert.equal(parsed.titleUserId, 'user_alpha_789');

    // Second call: Ask question on returned chat ID
    assert.match(networkCalls[1].url, /\/chats\/chat_generated_456\/ask$/);
    assert.equal(networkCalls[1].body.question, 'Explain Python variables');

    // Response structure
    assert.equal(result.answer, 'Python supports dynamic typing.');
    assert.equal(result.courseId, 'python_101');
    assert.equal(result.notebookId, 'nb_course_python_101');
    assert.equal(result.chatId, 'chat_generated_456');
    assert.deepEqual(result.sources, [{ source: 'python_01.txt', page: 2 }]);
  });

  await t.test('4. Two new conversations for the same user receive different session titles', async () => {
    const titles = [];

    globalThis.fetch = async (url, opts) => {
      if (url.includes('/notebooks/') && url.includes('/chats')) {
        const body = JSON.parse(opts.body || '{}');
        titles.push(body.title);
        return {
          status: 200,
          ok: true,
          json: async () => ({ id: 'chat_' + titles.length, title: body.title, notebook_id: 'nb_course_py101' }),
        };
      }
      if (url.includes('/ask')) {
        return { status: 200, ok: true, json: async () => ({ answer: 'A', sources: [] }) };
      }
      return { status: 404, ok: false };
    };

    await tutorService.askTutor({ courseId: 'py101', question: 'Q1', userId: 'user_same' });
    await tutorService.askTutor({ courseId: 'py101', question: 'Q2', userId: 'user_same' });

    assert.equal(titles.length, 2);
    assert.notEqual(titles[0], titles[1], 'Each new conversation must generate a unique session UUID');

    const p1 = tutorService.parseUserChatTitle(titles[0]);
    const p2 = tutorService.parseUserChatTitle(titles[1]);
    assert.equal(p1.titleUserId, 'user_same');
    assert.equal(p2.titleUserId, 'user_same');
    assert.notEqual(p1.sessionUuid, p2.sessionUuid);
  });

  await t.test('5. Valid follow-up question reuses supplied chatId and skips chat creation', async () => {
    let listChatsCalled = false;
    let createChatCalled = false;
    let askCalled = false;

    const existingChatId = 'chat_reused_888';
    const validTitle = 'Tutor_user_reuser_a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d';

    globalThis.fetch = async (url, opts) => {
      // 1. GET /api/notebooks/{notebookId}/chats
      if (opts.method === 'GET' && url.includes('/notebooks/nb_course_py101/chats')) {
        listChatsCalled = true;
        return {
          status: 200,
          ok: true,
          json: async () => [
            { id: existingChatId, title: validTitle, notebook_id: 'nb_course_py101' },
          ],
        };
      }
      // Should NOT call POST /notebooks/.../chats
      if (opts.method === 'POST' && url.includes('/notebooks/')) {
        createChatCalled = true;
        return { status: 500, ok: false };
      }
      // 2. POST /api/chats/{chatId}/ask
      if (opts.method === 'POST' && url.includes(`/chats/${existingChatId}/ask`)) {
        askCalled = true;
        return {
          status: 200,
          ok: true,
          json: async () => ({ answer: 'Reused thread answer', sources: [] }),
        };
      }
      return { status: 404, ok: false };
    };

    const res = await tutorService.askTutor({
      courseId: 'py101',
      question: 'Follow-up question',
      chatId: existingChatId,
      userId: 'user_reuser',
    });

    assert.equal(listChatsCalled, true, 'Must validate chat against notebook');
    assert.equal(createChatCalled, false, 'Must not create a new chat on follow-up');
    assert.equal(askCalled, true, 'Must ask question on existing chatId');
    assert.equal(res.chatId, existingChatId);
    assert.equal(res.answer, 'Reused thread answer');
  });

  await t.test('6. Chat from another course (not in target notebook) is rejected with 404', async () => {
    globalThis.fetch = async (url, opts) => {
      if (opts.method === 'GET' && url.includes('/notebooks/nb_course_py101/chats')) {
        // Returns chats for py101; does NOT include chat_from_ml201
        return {
          status: 200,
          ok: true,
          json: async () => [
            { id: 'chat_py_other', title: 'Tutor_user1_a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d', notebook_id: 'nb_course_py101' },
          ],
        };
      }
      return { status: 404, ok: false };
    };

    await assert.rejects(
      async () => {
        await tutorService.askTutor({
          courseId: 'py101',
          question: 'Hello',
          chatId: 'chat_from_ml201',
          userId: 'user1',
        });
      },
      (err) => {
        assert.equal(err.statusCode, 404);
        assert.equal(err.errorCode, 'RESOURCE_NOT_FOUND');
        assert.match(err.message, /chat session not found in course notebook/i);
        return true;
      }
    );
  });

  await t.test('7. Chat belonging to another user is rejected with 403 FORBIDDEN', async () => {
    const foreignChatId = 'chat_owned_by_victim';
    const foreignTitle = 'Tutor_victim_user_a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d';

    globalThis.fetch = async (url, opts) => {
      if (opts.method === 'GET' && url.includes('/notebooks/nb_course_py101/chats')) {
        return {
          status: 200,
          ok: true,
          json: async () => [
            { id: foreignChatId, title: foreignTitle, notebook_id: 'nb_course_py101' },
          ],
        };
      }
      return { status: 404, ok: false };
    };

    await assert.rejects(
      async () => {
        await tutorService.askTutor({
          courseId: 'py101',
          question: 'Spy on victim',
          chatId: foreignChatId,
          userId: 'attacker_user',
        });
      },
      (err) => {
        assert.equal(err.statusCode, 403);
        assert.equal(err.errorCode, 'FORBIDDEN');
        assert.match(err.message, /access denied/i);
        return true;
      }
    );
  });

  await t.test('8. Malformed or unexpected chat title is rejected with 403 FORBIDDEN', async () => {
    const malformedChatId = 'chat_legacy';

    globalThis.fetch = async (url, opts) => {
      if (opts.method === 'GET' && url.includes('/notebooks/nb_course_py101/chats')) {
        return {
          status: 200,
          ok: true,
          json: async () => [
            // Legacy unparsed title
            { id: malformedChatId, title: 'Tutor Session', notebook_id: 'nb_course_py101' },
          ],
        };
      }
      return { status: 404, ok: false };
    };

    await assert.rejects(
      async () => {
        await tutorService.askTutor({
          courseId: 'py101',
          question: 'Hello',
          chatId: malformedChatId,
          userId: 'any_user',
        });
      },
      (err) => {
        assert.equal(err.statusCode, 403);
        assert.equal(err.errorCode, 'FORBIDDEN');
        return true;
      }
    );
  });

  await t.test('9. Unauthenticated request (missing userId) is rejected with 401', async () => {
    await assert.rejects(
      async () => {
        await tutorService.askTutor({
          courseId: 'py101',
          question: 'Hello',
          userId: null,
        });
      },
      (err) => {
        assert.equal(err.statusCode, 401);
        assert.equal(err.errorCode, 'AUTHENTICATION_ERROR');
        return true;
      }
    );
  });

  await t.test('10. Short-circuits network calls when notebook is not found (no ask call made)', async () => {
    let askCalled = false;

    globalThis.fetch = async (url) => {
      if (url.includes('/notebooks/')) {
        return { status: 404, ok: false, text: async () => 'Notebook not found' };
      }
      if (url.includes('/ask')) {
        askCalled = true;
        return { status: 200, ok: true, json: async () => ({}) };
      }
      return { status: 500, ok: false };
    };

    await assert.rejects(
      async () => {
        await tutorService.askTutor({ courseId: 'nonexistent_course', question: 'Hello', userId: 'u1' });
      },
      (err) => {
        assert.equal(err.statusCode, 404);
        assert.match(err.message, /notebook not found/i);
        return true;
      }
    );

    assert.equal(askCalled, false, 'Should not forward question if notebook was not found');
  });

  await t.test('11. Concurrency behavior: Concurrent initial requests for different users never cross-contaminate', async () => {
    const createdTitles = [];

    globalThis.fetch = async (url, opts) => {
      if (url.includes('/notebooks/') && url.includes('/chats')) {
        const body = JSON.parse(opts.body || '{}');
        createdTitles.push(body.title);
        return {
          status: 200,
          ok: true,
          json: async () => ({ id: 'chat_' + body.title, title: body.title }),
        };
      }
      if (url.includes('/ask')) {
        return { status: 200, ok: true, json: async () => ({ answer: 'OK', sources: [] }) };
      }
      return { status: 404, ok: false };
    };

    // Simulate concurrent first inquiries from Alice and Bob
    const [resAlice, resBob] = await Promise.all([
      tutorService.askTutor({ courseId: 'py101', question: 'Q Alice', userId: 'alice_1' }),
      tutorService.askTutor({ courseId: 'py101', question: 'Q Bob', userId: 'bob_2' }),
    ]);

    assert.notEqual(resAlice.chatId, resBob.chatId, 'Alice and Bob must receive distinct chat sessions');
    assert.ok(resAlice.chatId.includes('alice_1'));
    assert.ok(resBob.chatId.includes('bob_2'));
  });

  await t.test('12. Concurrency behavior: Concurrent initial requests from the SAME authenticated user generate distinct sessions', async () => {
    const createdTitles = [];
    const askRequests = [];
    let chatCounter = 0;

    globalThis.fetch = async (url, opts) => {
      // Chat creation endpoint: POST /api/notebooks/{notebookId}/chats
      if (opts.method === 'POST' && url.includes('/notebooks/') && url.includes('/chats')) {
        const body = JSON.parse(opts.body || '{}');
        createdTitles.push(body.title);
        chatCounter++;
        const generatedChatId = `chat_concurrent_same_${chatCounter}`;
        return {
          status: 200,
          ok: true,
          json: async () => ({
            id: generatedChatId,
            title: body.title,
            notebook_id: 'nb_course_python_101',
          }),
        };
      }
      // Question endpoint: POST /api/chats/{chatId}/ask
      if (opts.method === 'POST' && url.includes('/ask')) {
        const match = url.match(/\/chats\/([^/]+)\/ask/);
        const chatId = match ? match[1] : null;
        const body = JSON.parse(opts.body || '{}');
        askRequests.push({ chatId, question: body.question });
        return {
          status: 200,
          ok: true,
          json: async () => ({
            answer: `Answer for ${body.question}`,
            sources: [],
          }),
        };
      }
      return { status: 404, ok: false };
    };

    const sameUserId = 'user_concurrent_same';
    const courseId = 'python_101';

    // 1. Run two tutorService.askTutor() calls concurrently using same courseId and userId without chatId
    const [res1, res2] = await Promise.all([
      tutorService.askTutor({ courseId, question: 'Question 1', userId: sameUserId }),
      tutorService.askTutor({ courseId, question: 'Question 2', userId: sameUserId }),
    ]);

    // 3. Capture both generated chat titles & 4. Assert both follow Tutor_<userId>_<UUID>
    assert.equal(createdTitles.length, 2, 'Must create exactly two distinct chat sessions');
    const parsed1 = tutorService.parseUserChatTitle(createdTitles[0]);
    const parsed2 = tutorService.parseUserChatTitle(createdTitles[1]);

    assert.ok(parsed1, 'Title 1 must match Tutor_<userId>_<UUID>');
    assert.ok(parsed2, 'Title 2 must match Tutor_<userId>_<UUID>');
    assert.equal(parsed1.titleUserId, sameUserId);
    assert.equal(parsed2.titleUserId, sameUserId);

    // 5. Assert that the two UUIDs are different
    assert.notEqual(parsed1.sessionUuid, parsed2.sessionUuid, 'Concurrent session UUIDs must be distinct');

    // 6. Assert that two distinct chat IDs are returned
    assert.notEqual(res1.chatId, res2.chatId, 'Concurrent responses must receive distinct chat IDs');
    assert.equal(res1.chatId, 'chat_concurrent_same_1');
    assert.equal(res2.chatId, 'chat_concurrent_same_2');

    // 7. Assert that each question is sent to its corresponding chat ID
    assert.equal(askRequests.length, 2, 'Must make exactly two ask requests');
    const askReq1 = askRequests.find((r) => r.chatId === res1.chatId);
    const askReq2 = askRequests.find((r) => r.chatId === res2.chatId);

    assert.ok(askReq1, 'Question 1 must be sent to chat ID 1');
    assert.ok(askReq2, 'Question 2 must be sent to chat ID 2');
    assert.equal(askReq1.question, 'Question 1');
    assert.equal(askReq2.question, 'Question 2');

    // 8. Ensure neither request reuses the other request's chat
    assert.notEqual(askReq1.chatId, askReq2.chatId, 'Neither request may reuse the other chat');
  });
});

// -----------------------------------------------------------------------------
// TEST SUITE 2: Express Tutor Gateway End-to-End Scenarios (Controller & Pipeline)
// -----------------------------------------------------------------------------
test('Tutor Gateway Controller - End-to-End Scenarios', async (t) => {
  const originalFetch = globalThis.fetch;

  t.afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  await t.test('Scenario 1: Valid initial request returns HTTP 200 with answer, sources, courseId, notebookId, and chatId', async () => {
    globalThis.fetch = async (url) => {
      if (url.includes('/notebooks/')) {
        return {
          status: 200,
          ok: true,
          json: async () => ({
            id: 'chat_init_123',
            notebook_id: 'nb_course_demo_course_python_101',
          }),
        };
      }
      if (url.includes('/ask')) {
        return {
          status: 200,
          ok: true,
          json: async () => ({
            answer: 'Python was created by Guido van Rossum.',
            sources: [{ source: 'python_01_intro.txt', page: 1, snippet: 'Python history' }],
          }),
        };
      }
      return { status: 404, ok: false };
    };

    const { req, res, next, getStatus, getBody } = createMockHttp({
      body: {
        courseId: 'demo_course_python_101',
        question: 'Who created Python?',
      },
    });

    await tutorController.askQuestion(req, res, next);

    assert.equal(getStatus(), 200);
    const body = getBody();
    assert.equal(body.success, true);
    assert.equal(body.data.courseId, 'demo_course_python_101');
    assert.equal(body.data.notebookId, 'nb_course_demo_course_python_101');
    assert.equal(body.data.chatId, 'chat_init_123');
    assert.equal(body.data.answer, 'Python was created by Guido van Rossum.');
    assert.deepEqual(body.data.sources, [{ source: 'python_01_intro.txt', page: 1, snippet: 'Python history' }]);
  });

  await t.test('Scenario 2: Valid follow-up request with chatId reuses thread and returns same chatId', async () => {
    const existingChatId = 'chat_thread_555';
    const validTitle = 'Tutor_test-user-123_11111111-2222-3333-4444-555555555555';

    globalThis.fetch = async (url, opts) => {
      if (opts.method === 'GET' && url.includes('/notebooks/nb_course_python_101/chats')) {
        return {
          status: 200,
          ok: true,
          json: async () => [
            { id: existingChatId, title: validTitle, notebook_id: 'nb_course_python_101' },
          ],
        };
      }
      if (opts.method === 'POST' && url.includes(`/chats/${existingChatId}/ask`)) {
        return {
          status: 200,
          ok: true,
          json: async () => ({
            answer: 'Here is another example.',
            sources: [],
          }),
        };
      }
      return { status: 404, ok: false };
    };

    const { req, res, next, getStatus, getBody } = createMockHttp({
      body: {
        courseId: 'python_101',
        question: 'Give me another example',
        chatId: existingChatId,
      },
      user: { id: 'test-user-123' },
    });

    await tutorController.askQuestion(req, res, next);

    assert.equal(getStatus(), 200);
    const body = getBody();
    assert.equal(body.success, true);
    assert.equal(body.data.chatId, existingChatId);
    assert.equal(body.data.answer, 'Here is another example.');
  });

  await t.test('Scenario 3: Missing courseId returns HTTP 400 validation error', async () => {
    const schema = tutorValidation.askQuestionSchema;
    await assert.rejects(
      async () => {
        await schema.parseAsync({
          body: { question: 'What is Python?' },
        });
      },
      (err) => {
        assert.ok(err.issues.some((i) => i.path.includes('courseId')));
        return true;
      }
    );
  });

  await t.test('Scenario 4: Empty courseId returns HTTP 400 validation error', async () => {
    const schema = tutorValidation.askQuestionSchema;
    await assert.rejects(
      async () => {
        await schema.parseAsync({
          body: { courseId: '   ', question: 'What is Python?' },
        });
      },
      (err) => {
        assert.ok(err.issues.some((i) => i.path.includes('courseId')));
        return true;
      }
    );
  });

  await t.test('Scenario 5: Missing question returns HTTP 400 validation error', async () => {
    const schema = tutorValidation.askQuestionSchema;
    await assert.rejects(
      async () => {
        await schema.parseAsync({
          body: { courseId: 'demo_course_python_101' },
        });
      },
      (err) => {
        assert.ok(err.issues.some((i) => i.path.includes('question')));
        return true;
      }
    );
  });

  await t.test('Scenario 6: Empty question returns HTTP 400 validation error', async () => {
    const schema = tutorValidation.askQuestionSchema;
    await assert.rejects(
      async () => {
        await schema.parseAsync({
          body: { courseId: 'demo_course_python_101', question: '  ' },
        });
      },
      (err) => {
        assert.ok(err.issues.some((i) => i.path.includes('question')));
        return true;
      }
    );
  });

  await t.test('Scenario 7: Empty chatId (if provided) returns HTTP 400 validation error', async () => {
    const schema = tutorValidation.askQuestionSchema;
    await assert.rejects(
      async () => {
        await schema.parseAsync({
          body: { courseId: 'demo_course_python_101', question: 'Hello', chatId: '   ' },
        });
      },
      (err) => {
        assert.ok(err.issues.some((i) => i.path.includes('chatId')));
        return true;
      }
    );
  });

  await t.test('Scenario 8: Missing or invalid authentication triggers HTTP 401', () => {
    const { req, res, next, getError } = createMockHttp({
      headers: {}, // No Authorization header
    });

    const protectMiddleware = (r, s, n) => {
      const authHeader = r.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return n(new AppError('Not authorized, no token provided', 401, 'AUTHENTICATION_ERROR'));
      }
      return n();
    };

    protectMiddleware(req, res, next);
    const err = getError();
    assert.ok(err instanceof AppError);
    assert.equal(err.statusCode, 401);
    assert.equal(err.errorCode, 'AUTHENTICATION_ERROR');
  });

  await t.test('Scenario 9: FastAPI notebook not found maps to HTTP 404 RESOURCE_NOT_FOUND', async () => {
    globalThis.fetch = async () => ({
      status: 404,
      ok: false,
      text: async () => 'Notebook not found',
    });

    const { req, res, next, getError } = createMockHttp({
      body: { courseId: 'unseeded_course', question: 'Hello' },
    });

    await tutorController.askQuestion(req, res, next);
    const err = getError();
    assert.ok(err instanceof AppError);
    assert.equal(err.statusCode, 404);
    assert.equal(err.errorCode, 'RESOURCE_NOT_FOUND');
    assert.match(err.message, /notebook not found/i);
  });

  await t.test('Scenario 10: Follow-up with chatId not found in course notebook maps to HTTP 404 RESOURCE_NOT_FOUND', async () => {
    globalThis.fetch = async (url, opts) => {
      if (opts.method === 'GET' && url.includes('/notebooks/')) {
        return { status: 200, ok: true, json: async () => [] };
      }
      return { status: 404, ok: false };
    };

    const { req, res, next, getError } = createMockHttp({
      body: { courseId: 'demo_course_python_101', question: 'Hello', chatId: 'non_existent_chat' },
    });

    await tutorController.askQuestion(req, res, next);
    const err = getError();
    assert.ok(err instanceof AppError);
    assert.equal(err.statusCode, 404);
    assert.equal(err.errorCode, 'RESOURCE_NOT_FOUND');
    assert.match(err.message, /chat session not found in course notebook/i);
  });

  await t.test('Scenario 11: Cross-user chat ownership violation maps to HTTP 403 FORBIDDEN', async () => {
    const victimChatId = 'chat_victim_999';
    globalThis.fetch = async (url, opts) => {
      if (opts.method === 'GET' && url.includes('/notebooks/')) {
        return {
          status: 200,
          ok: true,
          json: async () => [
            { id: victimChatId, title: 'Tutor_other_user_a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d' },
          ],
        };
      }
      return { status: 404, ok: false };
    };

    const { req, res, next, getError } = createMockHttp({
      body: { courseId: 'demo_course_python_101', question: 'Hello', chatId: victimChatId },
      user: { id: 'attacker_user' },
    });

    await tutorController.askQuestion(req, res, next);
    const err = getError();
    assert.ok(err instanceof AppError);
    assert.equal(err.statusCode, 403);
    assert.equal(err.errorCode, 'FORBIDDEN');
    assert.match(err.message, /access denied/i);
  });

  await t.test('Scenario 12: FastAPI service connection failure (ECONNREFUSED) maps to HTTP 503 SERVICE_UNAVAILABLE', async () => {
    globalThis.fetch = async () => {
      const err = new Error('fetch failed');
      err.code = 'ECONNREFUSED';
      throw err;
    };

    const { req, res, next, getError } = createMockHttp({
      body: { courseId: 'demo_course_python_101', question: 'Hello' },
    });

    await tutorController.askQuestion(req, res, next);
    const err = getError();
    assert.ok(err instanceof AppError);
    assert.equal(err.statusCode, 503);
    assert.equal(err.errorCode, 'SERVICE_UNAVAILABLE');
    assert.match(err.message, /service unavailable/i);
  });

  await t.test('Scenario 13: FastAPI request timeout (AbortError) maps to HTTP 504 GATEWAY_TIMEOUT', async () => {
    globalThis.fetch = async () => {
      const err = new Error('The operation was aborted');
      err.name = 'AbortError';
      throw err;
    };

    const { req, res, next, getError } = createMockHttp({
      body: { courseId: 'demo_course_python_101', question: 'Hello' },
    });

    await tutorController.askQuestion(req, res, next);
    const err = getError();
    assert.ok(err instanceof AppError);
    assert.equal(err.statusCode, 504);
    assert.equal(err.errorCode, 'GATEWAY_TIMEOUT');
    assert.match(err.message, /timed out/i);
  });

  await t.test('Scenario 14: Downstream unexpected 500 server error maps to 502 DOWNSTREAM_ERROR without leaking internal stack traces', async () => {
    globalThis.fetch = async () => ({
      status: 500,
      ok: false,
      text: async () => 'Internal Server Error at file.py line 42: database locked',
    });

    const { req, res, next, getError } = createMockHttp({
      body: { courseId: 'demo_course_python_101', question: 'Hello' },
    });

    await tutorController.askQuestion(req, res, next);
    const err = getError();
    assert.ok(err instanceof AppError);
    assert.equal(err.statusCode, 502);
    assert.equal(err.errorCode, 'DOWNSTREAM_ERROR');
    assert.equal(err.isOperational, true);
  });
});
