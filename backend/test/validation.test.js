const test = require('node:test');
const assert = require('node:assert/strict');
const { z } = require('zod');

const validate = require('../src/middlewares/validate');
const { registerSchema, loginSchema } = require('../src/validations/auth.validation');
const { courseSchema, lessonSchema } = require('../src/validations/course.validation');
const ErrorResponse = require('../src/utils/errorResponse');

const createMockRes = () => ({
  statusCode: null,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
});

test('registerSchema accepts a valid registration payload', () => {
  const result = registerSchema.parse({
    body: {
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'secret123',
      role: 'user',
    },
  });

  assert.equal(result.body.email, 'jane@example.com');
});

test('loginSchema rejects an invalid email address', () => {
  assert.throws(
    () =>
      loginSchema.parse({
        body: {
          email: 'not-an-email',
          password: 'secret123',
        },
      }),
    /Invalid email address/
  );
});

test('courseSchema requires a category', () => {
  assert.throws(
    () =>
      courseSchema.parse({
        body: {
          title: 'Testing 101',
          description: 'A course about testing',
        },
      }),
    /Invalid input/
  );
});

test('lessonSchema accepts a valid lesson payload', () => {
  const result = lessonSchema.parse({
    body: {
      title: 'Introduction',
      content: 'Welcome to the course',
      order: 1,
    },
  });

  assert.equal(result.body.order, 1);
});

test('ErrorResponse preserves message and statusCode', () => {
  const error = new ErrorResponse('Forbidden', 403);

  assert.equal(error.message, 'Forbidden');
  assert.equal(error.statusCode, 403);
  assert.equal(error instanceof Error, true);
});

// Middleware Unit Tests
test('validate middleware: valid req.body calls next() and controller is reached', async () => {
  const schema = z.object({
    body: z.object({
      email: z.string().email(),
      password: z.string().min(6),
    }),
  });

  const req = { body: { email: 'user@example.com', password: 'password123' }, params: {}, query: {} };
  const res = createMockRes();
  let nextCalled = false;

  await validate(schema)(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, null);
});

test('validate middleware: invalid req.body returns HTTP 400 and does not call next()', async () => {
  const schema = z.object({
    body: z.object({
      email: z.string().email(),
    }),
  });

  const req = { body: { email: 'invalid-email' }, params: {}, query: {} };
  const res = createMockRes();
  let nextCalled = false;

  await validate(schema)(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
  assert.equal(res.body.errorCode, 'VALIDATION_ERROR');
});

test('validate middleware: valid req.params passes and updates req.params', async () => {
  const schema = z.object({
    params: z.object({
      id: z.string().min(3),
    }),
  });

  const req = { body: {}, params: { id: 'c123' }, query: {} };
  const res = createMockRes();
  let nextCalled = false;

  await validate(schema)(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.params.id, 'c123');
});

test('validate middleware: invalid req.params returns HTTP 400', async () => {
  const schema = z.object({
    params: z.object({
      id: z.string().min(5, 'ID must be at least 5 chars'),
    }),
  });

  const req = { body: {}, params: { id: '12' }, query: {} };
  const res = createMockRes();
  let nextCalled = false;

  await validate(schema)(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 400);
  assert.ok(res.body.message.includes('ID must be at least 5 chars'));
});

test('validate middleware: valid req.query passes', async () => {
  const schema = z.object({
    query: z.object({
      page: z.string().optional(),
    }),
  });

  const req = { body: {}, params: {}, query: { page: '1' } };
  const res = createMockRes();
  let nextCalled = false;

  await validate(schema)(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
});

test('validate middleware: invalid req.query returns HTTP 400', async () => {
  const schema = z.object({
    query: z.object({
      limit: z.string().min(2, 'Limit query must be 2 characters'),
    }),
  });

  const req = { body: {}, params: {}, query: { limit: '1' } };
  const res = createMockRes();
  let nextCalled = false;

  await validate(schema)(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 400);
});

test('validate middleware: collects multiple validation errors', async () => {
  const schema = z.object({
    body: z.object({
      email: z.string().email('Invalid email'),
      password: z.string().min(6, 'Password too short'),
    }),
  });

  const req = { body: { email: 'bad', password: '123' }, params: {}, query: {} };
  const res = createMockRes();
  let nextCalled = false;

  await validate(schema)(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 400);
  assert.ok(res.body.message.includes('Invalid email'));
  assert.ok(res.body.message.includes('Password too short'));
});

test('validate middleware: returns sanitized/parsed values from Zod', async () => {
  const schema = z.object({
    body: z.object({
      email: z.string().trim().toLowerCase(),
    }),
  });

  const req = { body: { email: '  TestUser@Example.COM  ' }, params: {}, query: {} };
  const res = createMockRes();
  let nextCalled = false;

  await validate(schema)(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.body.email, 'testuser@example.com');
});
