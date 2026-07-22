const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).min(2, 'Name must be at least 2 characters').optional(),
    email: z.string({ required_error: 'Email is required' }).min(1, 'Email is required'),
    password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
    role: z.enum(['user', 'instructor', 'admin']).optional(),
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).min(1, 'Email is required'),
    password: z.string({ required_error: 'Password is required' }),
  })
});

module.exports = { registerSchema, loginSchema };
