const request = require('supertest');
const app = require('../app');
const { prisma } = require('../config/db');
const jwt = require('jsonwebtoken');

let token, userId, courseId, instructorId;

beforeAll(async () => {
  const instructor = await prisma.user.create({
    data: { name: 'Instr', email: `i${Date.now()}@t.com`, password: 'x', role: 'instructor' }
  });
  instructorId = instructor.id;

  const course = await prisma.course.create({
    data: { title: 'Test Course', description: 'd', category: 'c', instructorId, status: 'approved' }
  });
  courseId = course.id;

  const user = await prisma.user.create({
    data: { name: 'Student', email: `s${Date.now()}@t.com`, password: 'x', role: 'student' }
  });
  userId = user.id;
  token = jwt.sign({ id: userId }, process.env.JWT_SECRET);
});

afterAll(async () => {
  await prisma.enrollment.deleteMany({ where: { userId } });
  await prisma.course.deleteMany({ where: { id: courseId } });
  await prisma.user.deleteMany({ where: { id: { in: [userId, instructorId] } } });
  await prisma.$disconnect();
});

test('rejects enrollment with no auth token', async () => {
  const res = await request(app).post(`/api/enrollments/${courseId}`);
  expect(res.status).toBe(401);
});

test('rejects invalid mentor type on mentor update', async () => {
  const res = await request(app)
    .put(`/api/enrollments/${courseId}/mentor`)
    .set('Authorization', `Bearer ${token}`)
    .send({ mentor: 123 }); // wrong type
  expect(res.status).toBe(400);
  expect(res.body.success).toBe(false);
});

test('404 for non-existent course', async () => {
  const res = await request(app)
    .post('/api/enrollments/nonexistent-id-123')
    .set('Authorization', `Bearer ${token}`);
  expect(res.status).toBe(404);
});

test('successfully enrolls, then blocks duplicate enrollment', async () => {
  const first = await request(app)
    .post(`/api/enrollments/${courseId}`)
    .set('Authorization', `Bearer ${token}`);
  expect(first.status).toBe(201);

  const dup = await request(app)
    .post(`/api/enrollments/${courseId}`)
    .set('Authorization', `Bearer ${token}`);
  expect(dup.status).toBe(400);
  expect(dup.body.error).toMatch(/already enrolled/i);
});