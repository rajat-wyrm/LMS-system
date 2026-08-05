const { z } = require('zod');

const createCategorySchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Category name is required.' }).min(1, 'Category name is required.'),
    description: z.string().optional().nullable(),
  })
});

const updateCategorySchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'Category ID is required' }),
  }),
  body: z.object({
    name: z.string({ required_error: 'Category name is required.' }).min(1, 'Category name is required.'),
    description: z.string().optional().nullable(),
  })
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
};
