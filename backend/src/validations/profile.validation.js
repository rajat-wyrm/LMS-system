const { z } = require('zod');

const updatePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string({ required_error: 'Please provide both current and new password' }).min(1, 'Please provide both current and new password'),
    newPassword: z.string({ required_error: 'Please provide both current and new password' }).min(1, 'Please provide both current and new password'),
  })
});

module.exports = {
  updatePasswordSchema,
};
