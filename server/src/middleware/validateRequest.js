const ApiError = require("../utils/ApiError");

/**
 * Higher-order middleware helper for schema/custom validations
 */
const validateRequest = (validatorFn) => {
  return (req, res, next) => {
    try {
      validatorFn(req, res, next);
    } catch (err) {
      next(err);
    }
  };
};

module.exports = validateRequest;
