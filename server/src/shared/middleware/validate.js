import { ValidationError } from '../errors/app-error.js';

export function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const message = error.details.map((d) => d.message).join(', ');
      return next(new ValidationError(message));
    }

    req.body = value;
    next();
  };
}

export function validateQuery(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const message = error.details.map((d) => d.message).join(', ');
      return next(new ValidationError(message));
    }

    req.validatedQuery = value;
    next();
  };
}

export function validateParams(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const message = error.details.map((d) => d.message).join(', ');
      return next(new ValidationError(message));
    }

    req.validatedParams = value;
    next();
  };
}
