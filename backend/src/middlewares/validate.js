const { z } = require('zod');
const { sendErrorResponse } = require('../utils/apiResponse');

/**
 * Reusable request validation middleware using Zod.
 * Validates req.body, req.params, and req.query.
 *
 * Supports:
 * - Single Zod schema wrapping { body, params, query }
 * - Target object containing schemas: { body: schema, params: schema, query: schema }
 * - Direct Zod schema for req.body or multiple Zod schemas passed as arguments
 *
 * On validation failure, returns HTTP 400 using existing sendErrorResponse.
 * On success, updates req with parsed/sanitized data and calls next().
 *
 * @param {...(import('zod').ZodType | { body?: import('zod').ZodType, params?: import('zod').ZodType, query?: import('zod').ZodType })} args
 */
const validate = (...args) => async (req, res, next) => {
  try {
    if (args.length === 0) {
      return next();
    }

    const schemaArg = args[0];

    // Target object mapping: { body: schema1, params: schema2, query: schema3 }
    if (
      typeof schemaArg === 'object' &&
      schemaArg !== null &&
      !(schemaArg instanceof z.ZodType) &&
      (schemaArg.body || schemaArg.params || schemaArg.query)
    ) {
      const targets = ['body', 'params', 'query'];
      for (const target of targets) {
        if (schemaArg[target] && typeof schemaArg[target].parseAsync === 'function') {
          const parsed = await schemaArg[target].parseAsync(req[target]);
          req[target] = parsed;
        }
      }
      return next();
    }

    // Direct Zod schemas
    for (const schema of args) {
      if (schema && typeof schema.parseAsync === 'function') {
        const shape = schema._def && schema._def.shape ? (typeof schema._def.shape === 'function' ? schema._def.shape() : schema._def.shape) : null;
        if (shape && (shape.body || shape.params || shape.query)) {
          const dataToValidate = {};
          if (shape.body) dataToValidate.body = req.body;
          if (shape.params) dataToValidate.params = req.params;
          if (shape.query) dataToValidate.query = req.query;

          const parsed = await schema.parseAsync(dataToValidate);
          if (parsed.body !== undefined) req.body = parsed.body;
          if (parsed.params !== undefined) req.params = parsed.params;
          if (parsed.query !== undefined) req.query = parsed.query;
        } else {
          const parsed = await schema.parseAsync(req.body);
          req.body = parsed;
        }
      }
    }

    return next();
  } catch (error) {
    if (error instanceof z.ZodError || error?.name === 'ZodError') {
      const issues = error.issues || error.errors || [];
      const errorMessage = issues
        .map((err) => {
          const path = Array.isArray(err.path) ? err.path.join('.') : '';
          return path ? `${path}: ${err.message}` : err.message;
        })
        .join(', ');
      return sendErrorResponse(res, 400, errorMessage, 'VALIDATION_ERROR');
    }

    return sendErrorResponse(res, 400, error.message || 'Validation Error', 'VALIDATION_ERROR');
  }
};

validate.validate = validate;

module.exports = validate;
