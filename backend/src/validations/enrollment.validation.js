const { z } = require('zod');

const enrollParamsSchema = z.object({
  params: z.object({
    courseId: z.string({ required_error: 'Course ID is required' }).min(1, 'Course ID cannot be empty')
  }),
  body: z.object({
    mentor: z.string().trim().min(1).max(100).optional()
  }).optional()
});

const lessonParamsSchema = z.object({
  params: z.object({
    courseId: z.string().min(1, 'Course ID cannot be empty'),
    lessonId: z.string().min(1, 'Lesson ID cannot be empty')
  })
});

const mentorSchema = z.object({
  params: z.object({
    courseId: z.string().min(1, 'Course ID cannot be empty')
  }),
  body: z.object({
    mentor: z.string({ required_error: 'Mentor name is required' }).trim().min(1, 'Mentor name is required')
  })
});

module.exports = { enrollParamsSchema, lessonParamsSchema, mentorSchema };