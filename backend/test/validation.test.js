const test = require('node:test');
const assert = require('node:assert/strict');

const { registerSchema, loginSchema } = require('../src/validations/auth.validation');
const { courseSchema, lessonSchema } = require('../src/validations/course.validation');
const ErrorResponse = require('../src/utils/errorResponse');

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
