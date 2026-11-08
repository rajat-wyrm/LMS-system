
const express = require("express");

const { protect } = require("../../middlewares/auth.middleware");
const { askCourseTutor } = require("../../controllers/tutor.controller");

const router = express.Router();

// Ask a question about an enrolled course
router.post("/courses/:courseId/ask", protect, askCourseTutor);

module.exports = router;
