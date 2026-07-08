const adminController = require('./src/controllers/admin.controller');
const coursesController = require('./src/controllers/courses.controller');
const usersController = require('./src/controllers/users.controller');

// Mock response object helper
function mockResponse() {
  const res = {
    statusCode: 200,
    json: function(data) {
      this.data = data;
      return this;
    },
    status: function(code) {
      this.statusCode = code;
      return this;
    }
  };
  return res;
}

async function verify() {
  console.log("=================================================");
  console.log("🔍 RUNNING STATUS VALIDATION INTEGRITY CHECKS...");
  console.log("=================================================\n");

  let allPassed = true;

  // 1. Test Admin Course Status Update Validation
  console.log("1️⃣ Testing Course Status Update (admin.controller.js)...");
  const req1 = { body: { status: 'invalid_status_xyz' }, params: { id: 'test-id' } };
  const res1 = mockResponse();
  await adminController.updateCourseStatus(req1, res1, () => {});
  if (res1.statusCode === 400 && res1.data.success === false) {
    console.log("✅ Passed: Invalid course status update was successfully blocked with 400 Bad Request.");
  } else {
    console.log("❌ Failed: Invalid course status update was not blocked correctly.");
    allPassed = false;
  }

  // 2. Test Course Creation Status Validation
  console.log("\n2️⃣ Testing Course Creation Status (courses.controller.js)...");
  const req2 = { user: { role: 'admin' }, body: { title: 'Test Course', status: 'invalid_status_xyz' } };
  const res2 = mockResponse();
  await coursesController.createCourse(req2, res2, () => {});
  if (res2.statusCode === 400 && res2.data.success === false) {
    console.log("✅ Passed: Invalid course status during creation was successfully blocked with 400 Bad Request.");
  } else {
    console.log("❌ Failed: Invalid course status during creation was not blocked correctly.");
    allPassed = false;
  }

  // 3. Test User Status Update Validation
  console.log("\n3️⃣ Testing User Status Update (users.controller.js)...");
  const req3 = { body: { status: 'invalid_status_xyz' }, params: { id: 'test-id' } };
  const res3 = mockResponse();
  await usersController.updateUser(req3, res3, () => {});
  if (res3.statusCode === 400 && res3.data.success === false) {
    console.log("✅ Passed: Invalid user status update was successfully blocked with 400 Bad Request.");
  } else {
    console.log("❌ Failed: Invalid user status update was not blocked correctly.");
    allPassed = false;
  }

  // 4. Test User Role Update Validation
  console.log("\n4️⃣ Testing User Role Update (users.controller.js)...");
  const req4 = { body: { role: 'invalid_role_xyz' }, params: { id: 'test-id' } };
  const res4 = mockResponse();
  await usersController.updateUser(req4, res4, () => {});
  if (res4.statusCode === 400 && res4.data.success === false) {
    console.log("✅ Passed: Invalid user role update was successfully blocked with 400 Bad Request.");
  } else {
    console.log("❌ Failed: Invalid user role update was not blocked correctly.");
    allPassed = false;
  }

  console.log("\n=================================================");
  if (allPassed) {
    console.log("🎉 ALL TESTS PASSED: All invalid statuses are successfully blocked!");
  } else {
    console.log("⚠️ SOME TESTS FAILED: Please inspect logs above.");
  }
  console.log("=================================================");
}

verify();
