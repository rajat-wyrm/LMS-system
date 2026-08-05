const { z } = require('zod');

const courseSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }).max(100, 'Title cannot be more than 100 characters'),
    description: z.string({ required_error: 'Description is required' }).max(1000, 'Description cannot exceed 1000 characters'),
    category: z.string({ required_error: 'Category is required' }),
    celebrityTeacher: z.string().optional()
  })
});

const lessonSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Lesson title is required' }),
    content: z.string({ required_error: 'Lesson content is required' }),
    videoUrl: z.string().optional(),
    order: z.number({ required_error: 'Order is required' })
  })
});

module.exports = { courseSchema, lessonSchema };
