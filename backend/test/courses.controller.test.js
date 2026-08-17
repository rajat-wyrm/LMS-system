const test = require("node:test");
const assert = require("node:assert/strict");

const { createCourse } = require("../src/controllers/courses.controller");
const { prisma } = require("../src/config/db");

test("createCourse - duplicate title validation", async (t) => {
  await t.test(
    "returns 409 when an active course with the same title exists",
    async () => {
      const originalFindFirst = prisma.course.findFirst;
      const originalCreate = prisma.course.create;

      prisma.course.findFirst = async () => ({
        id: "course-1",
        title: "Java Programming",
        isDeleted: false,
      });

      let createCalled = false;

      prisma.course.create = async () => {
        createCalled = true;
      };

      const req = {
        user: {
          id: "admin-1",
          name: "Test Admin",
          role: "admin",
        },
        body: {
          title: "Java Programming",
          description: "Learn Java",
          category: "Programming",
          level: "Beginner",
        },
      };

      const res = {
        statusCode: null,
        body: null,

        status(code) {
          this.statusCode = code;
          return this;
        },

        json(data) {
          this.body = data;
          return this;
        },
      };

      let nextCalled = false;

      const next = () => {
        nextCalled = true;
      };

      try {
        await createCourse(req, res, next);

        assert.equal(res.statusCode, 409);

        assert.deepEqual(res.body, {
          success: false,
          error: "A course with this title already exists.",
        });

        assert.equal(createCalled, false);
        assert.equal(nextCalled, false);
      } finally {
        prisma.course.findFirst = originalFindFirst;
        prisma.course.create = originalCreate;
      }
    },
  );

  await t.test("returns 409 when the title differs only by case", async () => {
    const originalFindFirst = prisma.course.findFirst;
    const originalCreate = prisma.course.create;

    prisma.course.findFirst = async () => ({
      id: "course-1",
      title: "Java Programming",
      isDeleted: false,
    });

    let createCalled = false;

    prisma.course.create = async () => {
      createCalled = true;
    };

    const req = {
      user: {
        id: "admin-1",
        name: "Test Admin",
        role: "admin",
      },
      body: {
        title: "java programming",
        description: "Learn Java",
        category: "Programming",
        level: "Beginner",
      },
    };

    const res = {
      statusCode: null,
      body: null,

      status(code) {
        this.statusCode = code;
        return this;
      },

      json(data) {
        this.body = data;
        return this;
      },
    };

    let nextCalled = false;

    const next = () => {
      nextCalled = true;
    };

    try {
      await createCourse(req, res, next);

      assert.equal(res.statusCode, 409);

      assert.deepEqual(res.body, {
        success: false,
        error: "A course with this title already exists.",
      });

      assert.equal(createCalled, false);
      assert.equal(nextCalled, false);
    } finally {
      prisma.course.findFirst = originalFindFirst;
      prisma.course.create = originalCreate;
    }
  });

  await t.test(
    "allows a new course when no active course with the title exists",
    async () => {
      const originalFindFirst = prisma.course.findFirst;
      const originalCreate = prisma.course.create;
      const originalCategoryFindUnique = prisma.category.findUnique;
      const originalCourseActivityCreate = prisma.courseActivity.create;

      prisma.course.findFirst = async () => null;

      prisma.category.findUnique = async () => ({
        id: "category-1",
        name: "Programming",
      });

      prisma.course.create = async () => ({
        id: "course-2",
        title: "Java Programming",
        description: "Learn Java",
        category: "Programming",
        level: "Beginner",
      });

      prisma.courseActivity.create = async () => ({});

      const req = {
        user: {
          id: "admin-1",
          name: "Test Admin",
          role: "admin",
        },
        body: {
          title: "Java Programming",
          description: "Learn Java",
          category: "Programming",
          level: "Beginner",
        },
      };

      const res = {
        statusCode: null,
        body: null,

        status(code) {
          this.statusCode = code;
          return this;
        },

        json(data) {
          this.body = data;
          return this;
        },
      };

      let nextCalled = false;

      const next = () => {
        nextCalled = true;
      };

      try {
        await createCourse(req, res, next);

        assert.equal(res.statusCode, 201);

        assert.equal(res.body.success, true);

        assert.equal(res.body.data.id, "course-2");

        assert.equal(res.body.data.title, "Java Programming");

        assert.equal(nextCalled, false);
      } finally {
        prisma.course.findFirst = originalFindFirst;
        prisma.course.create = originalCreate;
        prisma.category.findUnique = originalCategoryFindUnique;
        prisma.courseActivity.create = originalCourseActivityCreate;
      }
    },
  );
});
