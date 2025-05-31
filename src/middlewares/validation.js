import { isValidObjectId } from 'mongoose';
import createError from 'http-errors';

export const validateId = (req, res, next) => {
  const { contactId } = req.params;

  if (!isValidObjectId(contactId)) {
    return next(createError(400, 'Invalid contact ID'));
  }

  next();
};

export const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return next(createError(400, error.message));
    }
    next();
  };
};
