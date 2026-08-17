const { test } = require("node:test");
const assert = require("node:assert");
const { prisma } = require("../src/config/db");
const { completeLesson } = require("../src/controllers/courses.controller");

const makeRes = () => {
  const res = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
  return res;
};

async function cleanup(ctx) {
  if (ctx.enrollmentId) {
    await prisma.enrollment.deleteMany({ where: { id: ctx.enrollmentId } });
  }
  if (ctx.lessonId) {
    await prisma.lesson.deleteMany({ where: { id: ctx.lessonId } });
  }
  if (ctx.courseIds.length > 0) {
    await prisma.course.deleteMany({ where: { id: { in: ctx.courseIds } } });
  }
  if (ctx.userId) {
    await prisma.user.delete({ where: { id: ctx.userId } });
  }
}

test("completeLesson rejects when lesson does not belong to the enrolled course", async () => {
  const ctx = { courseIds: [] };
  try {
    const user = await prisma.user.create({
      data: {
        name: "Test Student",
        email: `test_${Date.now()}@example.com`,
        password: "hashedpassword",
        role: "user",
      },
    });
    ctx.userId = user.id;

    const courseA = await prisma.course.create({
      data: {
        title: "Course A",
        description: "Description A",
        category: "Tech",
        level: "Beginner",
        price: 0,
        instructorId: user.id,
      },
    });
    ctx.courseIds.push(courseA.id);

    const courseB = await prisma.course.create({
      data: {
        title: "Course B",
        description: "Description B",
        category: "Tech",
        level: "Beginner",
        price: 0,
        instructorId: user.id,
      },
    });
    ctx.courseIds.push(courseB.id);

    const lessonInCourseB = await prisma.lesson.create({
      data: {
        title: "Lesson in Course B",
        content: "Content",
        order: 1,
        courseId: courseB.id,
      },
    });
    ctx.lessonId = lessonInCourseB.id;

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: user.id,
        courseId: courseA.id,
      },
    });
    ctx.enrollmentId = enrollment.id;

    const req = {
      params: { courseId: courseA.id, lessonId: lessonInCourseB.id },
      body: { courseId: courseA.id, lessonId: lessonInCourseB.id },
      user: { id: user.id },
    };
    const res = makeRes();

    await completeLesson(req, res, () => {});

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(
      res.body.error,
      "This lesson does not belong to the enrolled course!"
    );
  } finally {
    await cleanup(ctx);
  }
});

test("completeLesson marks lesson complete and updates enrollment progress", async () => {
  const ctx = { courseIds: [] };
  try {
    const user = await prisma.user.create({
      data: {
        name: "Test Student",
        email: `test_${Date.now()}@example.com`,
        password: "hashedpassword",
        role: "user",
      },
    });
    ctx.userId = user.id;

    const course = await prisma.course.create({
      data: {
        title: "Course A",
        description: "Description A",
        category: "Tech",
        level: "Beginner",
        price: 0,
        instructorId: user.id,
      },
    });
    ctx.courseIds.push(course.id);

    const lesson1 = await prisma.lesson.create({
      data: {
        title: "Lesson A1",
        content: "Content 1",
        order: 1,
        courseId: course.id,
      },
    });
    const lesson2 = await prisma.lesson.create({
      data: {
        title: "Lesson A2",
        content: "Content 2",
        order: 2,
        courseId: course.id,
      },
    });
    ctx.lessonId = lesson1.id;

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: user.id,
        courseId: course.id,
      },
    });
    ctx.enrollmentId = enrollment.id;

    const req = {
      params: { courseId: course.id, lessonId: lesson1.id },
      body: { courseId: course.id, lessonId: lesson1.id },
      user: { id: user.id },
    };
    const res = makeRes();

    await completeLesson(req, res, () => {});

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.progress, 50); // 1 of 2 lessons
    assert.strictEqual(
      res.body.data.completedLessons.some((l) => l.id === lesson1.id),
      true
    );
  } finally {
    await cleanup(ctx);
  }
});