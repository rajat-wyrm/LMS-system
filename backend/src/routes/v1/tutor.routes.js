const express = require('express');
const router = express.Router();

const { protect } = require('../../middlewares/auth.middleware');
const { validate } = require('../../middlewares/validate.middleware');
const { askQuestionSchema } = require('../../validations/tutor.validation');
const { askQuestion } = require('../../controllers/tutor.controller');

// @route   POST /api/v1/tutor/ask
// @desc    Ask a question to the AI Tutor for a specific course
// @access  Private (Authenticated users only)
router.post('/ask', protect, validate(askQuestionSchema), askQuestion);

module.exports = router;
