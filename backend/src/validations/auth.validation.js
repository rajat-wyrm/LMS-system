const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).min(2, 'Name must be at least 2 characters').optional(),
    email: z.string({ required_error: 'Email is required' }).min(1, 'Email is required').email('Invalid email address'),
    password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
    role: z.enum(['user', 'instructor', 'admin']).optional(),
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).min(1, 'Email is required').email('Invalid email address'),
    password: z.string({ required_error: 'Password is required' }).min(1, 'Please provide an email and password'),
  })
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Please provide an email' }).min(1, 'Please provide an email').email('Invalid email address'),
  })
});

const resetPasswordSchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'ID is required' }),
    token: z.string({ required_error: 'Token is required' }),
  }),
  body: z.object({
    password: z.string({ required_error: 'Please provide a new password' }).min(1, 'Please provide a new password'),
  })
});

module.exports = { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema };

