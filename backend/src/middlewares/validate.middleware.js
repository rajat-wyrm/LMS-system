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
<<<<<<< HEAD
      const errorMessage = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
=======
      const errorMessage = (error.issues || error.errors).map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
>>>>>>> 32b6107 (initial commit)
      return res.status(400).json({ success: false, error: errorMessage });
    }
    return res.status(400).json({ success: false, error: 'Validation Error' });
  }
};

module.exports = { validate };
