const { test } = require("node:test");
const assert = require("node:assert");
const { prisma } = require("../src/config/db");
const { completeLesson } = require("../src/controllers/courses.controller");

test("completeLesson rejects when lesson does not belong to the enrolled course", async () => {
  // 1. Create mock User (Use uppercase "STUDENT" for Prisma Enum)
  const user = await prisma.user.create({
    data: {
      name: "Test Student",
      email: `test_${Date.now()}@example.com`,
      password: "hashedpassword",
      role: "user",
    },
  });

  // 2. Create mock Courses
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

  // 3. Create Lesson in Course B
  const lessonInCourseB = await prisma.lesson.create({
    data: {
      title: "Lesson in Course B",
      content: "Content",
      order: 1,
      courseId: courseB.id,
    },
  });

  // 4. Enroll Student in Course A
  await prisma.enrollment.create({
    data: {
      userId: user.id,
      courseId: courseA.id,
    },
  });

  // 5. Mock Request trying to complete Lesson B while passing Course A
  const req = {
    params: { courseId: courseA.id, lessonId: lessonInCourseB.id },
    body: { courseId: courseA.id, lessonId: lessonInCourseB.id },
    user: { id: user.id },
  };

  let statusCode;
  let responseData;
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    },
  };

  const next = (err) => {
    if (err) throw err;
  };

  try {
    // 6. Run Controller
    await completeLesson(req, res, next);

    // 7. Assertions
    assert.strictEqual(statusCode, 400);
    assert.strictEqual(responseData.success, false);
    assert.strictEqual(
      responseData.error,
      "This lesson does not belong to the enrolled course!"
    );
  } finally {
    // 8. Cleanup DB (Safe cascade ordering using exact Prisma client models)
    await prisma.enrollment.deleteMany({ where: { userId: user.id } });
    await prisma.lesson.deleteMany({ where: { id: lessonInCourseB.id } });
    await prisma.course.deleteMany({ where: { id: { in: [courseA.id, courseB.id] } } });
    await prisma.user.delete({ where: { id: user.id } });
  }
});