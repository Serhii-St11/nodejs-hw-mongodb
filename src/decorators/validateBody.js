import createHttpError from 'http-errors';

const validateBody = (schema) => {
  return (req, _res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return next(createHttpError(400, error.message));
    }
    next();
  };
};

export default validateBody;
