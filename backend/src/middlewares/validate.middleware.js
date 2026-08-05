const { z } = require('zod');

const validate = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    return next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      return res.status(400).json({ success: false, error: errorMessage });
    }
    return res.status(400).json({ success: false, error: 'Validation Error' });
  }
};

module.exports = { validate };
