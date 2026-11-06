const { z } = require('zod');

/**
 * Validation schema for the AI Tutor question submission endpoint.
 * Route: POST /api/v1/tutor/ask
 */
const askQuestionSchema = z.object({
  body: z.object({
    courseId: z
      .string({ required_error: 'Course ID is required' })
      .trim()
      .min(1, 'Course ID cannot be empty'),
    question: z
      .string({ required_error: 'Question is required' })
      .trim()
      .min(1, 'Question cannot be empty')
      .max(1000, 'Question cannot exceed 1000 characters'),
  }),
});

module.exports = {
  askQuestionSchema,
};
