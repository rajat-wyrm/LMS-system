const test = require("node:test");
const assert = require("node:assert/strict");

const {
  getResourceTypeFromMime,
  isValidMimeForType,
  getMaxSizeForType,
} = require("../src/validations/resource.validation");

const {
  generateStorageKey,
  generateStoragePath,
  validateFileMetadata,
  sanitizeMetadata,
  buildResourceWhere,
} = require("../src/services/resource.service");

const AppError = require("../src/utils/AppError");

// ─────────────────────────────────────────────────────────────
// Validation Helpers
// ─────────────────────────────────────────────────────────────
test("getResourceTypeFromMime maps video/mp4 to video", () => {
  assert.equal(getResourceTypeFromMime("video/mp4"), "video");
});

test("getResourceTypeFromMime maps application/pdf to document", () => {
  assert.equal(getResourceTypeFromMime("application/pdf"), "document");
});

test("getResourceTypeFromMime returns other for unknown MIME", () => {
  assert.equal(getResourceTypeFromMime("application/octet-stream"), "other");
});

test("isValidMimeForType accepts video/mp4 for video type", () => {
  assert.equal(isValidMimeForType("video/mp4", "video"), true);
});

test("isValidMimeForType rejects image/png for video type", () => {
  assert.equal(isValidMimeForType("image/png", "video"), false);
});

test("isValidMimeForType allows any MIME for other type", () => {
  assert.equal(isValidMimeForType("application/octet-stream", "other"), true);
});

test("getMaxSizeForType returns 500MB for video", () => {
  assert.equal(getMaxSizeForType("video"), 500 * 1024 * 1024);
});

test("getMaxSizeForType returns 50MB for document", () => {
  assert.equal(getMaxSizeForType("document"), 50 * 1024 * 1024);
});

// ─────────────────────────────────────────────────────────────
// Service: Storage Key Generation
// ─────────────────────────────────────────────────────────────
test("generateStorageKey includes courseId and is unique", () => {
  const key1 = generateStorageKey("course-abc123", "My Video.mp4");
  const key2 = generateStorageKey("course-abc123", "My Video.mp4");

  assert.ok(key1.startsWith("course-abc123/"));
  assert.notEqual(key1, key2); // random component ensures uniqueness
  assert.ok(key1.endsWith(".mp4"));
});

test("generateStorageKey sanitizes special characters in filename", () => {
  const key = generateStorageKey("course-1", "File @#$% Name!!!.pdf");
  assert.ok(!key.includes("@"));
  assert.ok(!key.includes("#"));
  assert.ok(key.endsWith(".pdf"));
});

test("generateStoragePath prefixes with /uploads/resources/", () => {
  const path = generateStoragePath("course-1/123-abc-file.pdf");
  assert.equal(path, "/uploads/resources/course-1/123-abc-file.pdf");
});

// ─────────────────────────────────────────────────────────────
// Service: File Metadata Validation
// ─────────────────────────────────────────────────────────────
test("validateFileMetadata accepts a valid video file", () => {
  const file = {
    mimetype: "video/mp4",
    size: 10 * 1024 * 1024, // 10 MB
    originalname: "lesson1.mp4",
  };
  const result = validateFileMetadata(file, "video");
  assert.equal(result.effectiveType, "video");
});

test("validateFileMetadata infers type when not declared", () => {
  const file = {
    mimetype: "image/png",
    size: 1 * 1024 * 1024,
    originalname: "diagram.png",
  };
  const result = validateFileMetadata(file, null);
  assert.equal(result.effectiveType, "image");
});

test("validateFileMetadata throws on MIME/type mismatch", () => {
  const file = {
    mimetype: "image/png",
    size: 1 * 1024 * 1024,
    originalname: "diagram.png",
  };
  try {
    validateFileMetadata(file, "video");
    assert.fail("Expected AppError to be thrown");
  } catch (err) {
    assert.ok(err instanceof AppError);
    assert.equal(err.statusCode, 400);
  }
});

test("validateFileMetadata throws on oversized file", () => {
  const file = {
    mimetype: "video/mp4",
    size: 600 * 1024 * 1024, // 600 MB > 500 MB limit
    originalname: "huge.mp4",
  };
  try {
    validateFileMetadata(file, "video");
    assert.fail("Expected AppError to be thrown");
  } catch (err) {
    assert.ok(err instanceof AppError);
    assert.equal(err.statusCode, 413);
    assert.ok(err.message.includes("exceeds"));
  }
});

test("validateFileMetadata throws on dangerous extension", () => {
  const file = {
    mimetype: "application/octet-stream",
    size: 1024,
    originalname: "virus.exe",
  };
  try {
    validateFileMetadata(file, "other");
    assert.fail("Expected AppError to be thrown");
  } catch (err) {
    assert.ok(err instanceof AppError);
    assert.equal(err.statusCode, 400);
    assert.ok(err.message.includes("not allowed"));
  }
});

// ─────────────────────────────────────────────────────────────
// Service: Metadata Sanitization
// ─────────────────────────────────────────────────────────────
test("sanitizeMetadata keeps allowed keys", () => {
  const input = { title: "Lecture 1", description: "Intro", tags: ["math", "algebra"] };
  const result = sanitizeMetadata(input);
  assert.equal(result.title, "Lecture 1");
  assert.equal(result.description, "Intro");
  assert.deepEqual(result.tags, ["math", "algebra"]);
});

test("sanitizeMetadata strips unknown keys", () => {
  const input = { title: "OK", evil: "payload", __proto__: "pollution" };
  const result = sanitizeMetadata(input);
  assert.equal(result.title, "OK");
  assert.equal("evil" in result, false);
});

test("sanitizeMetadata returns empty object for non-object input", () => {
  assert.deepEqual(sanitizeMetadata(null), {});
  assert.deepEqual(sanitizeMetadata("string"), {});
  assert.deepEqual(sanitizeMetadata(42), {});
});

// ─────────────────────────────────────────────────────────────
// Service: Where Clause Builder
// ─────────────────────────────────────────────────────────────
test("buildResourceWhere builds correct base clause", () => {
  const where = buildResourceWhere("course-1", {});
  assert.equal(where.courseId, "course-1");
  assert.deepEqual(where.status, { not: "deleted" });
});

test("buildResourceWhere adds resourceType filter when provided", () => {
  const where = buildResourceWhere("course-1", { resourceType: "video" });
  assert.equal(where.resourceType, "video");
});

test("buildResourceWhere adds status filter when provided", () => {
  const where = buildResourceWhere("course-1", { status: "archived" });
  assert.equal(where.status, "archived");
});

// ─────────────────────────────────────────────────────────────
// Controller: Mocked Integration Tests
// ─────────────────────────────────────────────────────────────
const {
  uploadResource,
  getResourcesByCourse,
  getResourceById,
  updateResource,
  deleteResource,
  restoreResource,
} = require("../src/controllers/resource.controller");
const { prisma } = require("../src/config/db");

test("uploadResource — rejects when no file is present", async () => {
  const req = { file: null, body: { courseId: "c1" }, user: { id: "u1", role: "admin" } };
  let nextErr = null;
  const next = (err) => { nextErr = err; };

  await uploadResource(req, {}, next);

  assert.ok(nextErr instanceof AppError);
  assert.equal(nextErr.statusCode, 400);
  assert.equal(nextErr.message, "No file uploaded");
});

test("uploadResource — rejects when course does not exist", async () => {
  const originalFindUnique = prisma.course.findUnique;
  prisma.course.findUnique = async () => null;

  const req = {
    file: { mimetype: "video/mp4", size: 1024, originalname: "v.mp4", filename: "v.mp4" },
    body: { courseId: "missing-course", lessonId: null, resourceType: "video", metadata: {} },
    user: { id: "u1", role: "admin" },
  };
  let nextErr = null;
  const next = (err) => { nextErr = err; };

  try {
    await uploadResource(req, {}, next);
    assert.ok(nextErr instanceof AppError);
    assert.equal(nextErr.statusCode, 404);
  } finally {
    prisma.course.findUnique = originalFindUnique;
  }
});

test("uploadResource — rejects unauthorized instructor", async () => {
  const originalFindUnique = prisma.course.findUnique;
  prisma.course.findUnique = async () => ({ id: "c1", instructorId: "other-instructor" });

  const req = {
    file: { mimetype: "video/mp4", size: 1024, originalname: "v.mp4", filename: "v.mp4" },
    body: { courseId: "c1", lessonId: null, resourceType: "video", metadata: {} },
    user: { id: "u1", role: "instructor" },
  };
  let nextErr = null;
  const next = (err) => { nextErr = err; };

  try {
    await uploadResource(req, {}, next);
    assert.ok(nextErr instanceof AppError);
    assert.equal(nextErr.statusCode, 403);
  } finally {
    prisma.course.findUnique = originalFindUnique;
  }
});

test("uploadResource — succeeds for admin on any course", async () => {
  const originalFindUnique = prisma.course.findUnique;
  const originalCreate = prisma.courseResource.create;

  prisma.course.findUnique = async () => ({ id: "c1", instructorId: "other" });
  prisma.courseResource.create = async ({ data }) => ({
    id: "res-1",
    ...data,
    uploader: { id: "u1", name: "Admin", email: "admin@test.com" },
    course: { id: "c1", title: "Test Course" },
    lesson: null,
  });

  const req = {
    file: { mimetype: "video/mp4", size: 1024, originalname: "v.mp4", filename: "v.mp4" },
    body: { courseId: "c1", lessonId: null, resourceType: "video", metadata: {} },
    user: { id: "u1", role: "admin" },
  };
  const res = {
    statusCode: null,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(data) { this.body = data; return this; },
  };

  try {
    await uploadResource(req, res, () => {});
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.id, "res-1");
    assert.equal(res.body.data.resourceType, "video");
  } finally {
    prisma.course.findUnique = originalFindUnique;
    prisma.courseResource.create = originalCreate;
  }
});

test("getResourcesByCourse — returns paginated list", async () => {
  const originalFindMany = prisma.courseResource.findMany;
  const originalCount = prisma.courseResource.count;

  prisma.courseResource.findMany = async () => [
    { id: "r1", fileName: "a.pdf", size: 1024 },
    { id: "r2", fileName: "b.mp4", size: 2048 },
  ];
  prisma.courseResource.count = async () => 2;

  const req = {
    params: { courseId: "c1" },
    query: { page: "1", limit: "10" },
    user: { role: "admin" },
  };
  const res = {
    statusCode: null,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(data) { this.body = data; return this; },
  };

  try {
    await getResourcesByCourse(req, res, () => {});
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.count, 2);
    assert.equal(res.body.meta.total, 2);
    assert.equal(res.body.meta.page, 1);
  } finally {
    prisma.courseResource.findMany = originalFindMany;
    prisma.courseResource.count = originalCount;
  }
});

test("getResourceById — returns 404 for missing resource", async () => {
  const originalFindUnique = prisma.courseResource.findUnique;
  prisma.courseResource.findUnique = async () => null;

  const req = { params: { id: "missing" }, user: { role: "admin" } };
  let nextErr = null;
  const next = (err) => { nextErr = err; };

  try {
    await getResourceById(req, {}, next);
    assert.ok(nextErr instanceof AppError);
    assert.equal(nextErr.statusCode, 404);
  } finally {
    prisma.courseResource.findUnique = originalFindUnique;
  }
});

test("getResourceById — hides non-active resources from students", async () => {
  const originalFindUnique = prisma.courseResource.findUnique;
  prisma.courseResource.findUnique = async () => ({ id: "r1", status: "archived" });

  const req = { params: { id: "r1" }, user: { role: "user" } };
  let nextErr = null;
  const next = (err) => { nextErr = err; };

  try {
    await getResourceById(req, {}, next);
    assert.ok(nextErr instanceof AppError);
    assert.equal(nextErr.statusCode, 404);
  } finally {
    prisma.courseResource.findUnique = originalFindUnique;
  }
});

test("deleteResource — soft-deletes and returns updated record", async () => {
  const originalFindUnique = prisma.courseResource.findUnique;
  const originalUpdate = prisma.courseResource.update;
  const originalCourseFind = prisma.course.findUnique;

  prisma.courseResource.findUnique = async () => ({
    id: "r1", uploadedBy: "u1", courseId: "c1", status: "active",
  });
  prisma.courseResource.update = async ({ data }) => ({ id: "r1", status: data.status });
  prisma.course.findUnique = async () => ({ instructorId: "u1" });

  const req = { params: { id: "r1" }, user: { id: "u1", role: "instructor" } };
  const res = {
    statusCode: null,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(data) { this.body = data; return this; },
  };

  try {
    await deleteResource(req, res, () => {});
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.data.status, "deleted");
  } finally {
    prisma.courseResource.findUnique = originalFindUnique;
    prisma.courseResource.update = originalUpdate;
    prisma.course.findUnique = originalCourseFind;
  }
});

test("restoreResource — restores a deleted resource", async () => {
  const originalFindUnique = prisma.courseResource.findUnique;
  const originalUpdate = prisma.courseResource.update;
  const originalCourseFind = prisma.course.findUnique;

  prisma.courseResource.findUnique = async () => ({
    id: "r1", courseId: "c1", status: "deleted",
  });
  prisma.courseResource.update = async ({ data }) => ({ id: "r1", status: data.status });
  prisma.course.findUnique = async () => ({ instructorId: "u1" });

  const req = { params: { id: "r1" }, user: { id: "u1", role: "instructor" } };
  const res = {
    statusCode: null,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(data) { this.body = data; return this; },
  };

  try {
    await restoreResource(req, res, () => {});
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.data.status, "active");
  } finally {
    prisma.courseResource.findUnique = originalFindUnique;
    prisma.courseResource.update = originalUpdate;
    prisma.course.findUnique = originalCourseFind;
  }
});
