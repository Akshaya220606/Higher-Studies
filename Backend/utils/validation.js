const AppError = require("./appError");

const isNonEmptyString = (value) => {
  return typeof value === "string" && value.trim() !== "";
};

const validateRequiredFields = (fields) => {
  const missingFields = fields
    .filter(({ value }) => value === undefined || value === null || value === "")
    .map(({ name }) => name);

  if (missingFields.length > 0) {
    throw new AppError(`Missing required fields: ${missingFields.join(", ")}`, 400);
  }
};

const validateEmail = (email) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!isNonEmptyString(email) || !emailPattern.test(email)) {
    throw new AppError("Please provide a valid email address", 400);
  }
};

const validateRole = (role, allowedRoles) => {
  if (!allowedRoles.includes(role)) {
    throw new AppError(`Role must be one of: ${allowedRoles.join(", ")}`, 400);
  }
};

const validateStatus = (status, allowedStatuses) => {
  if (!allowedStatuses.includes(status)) {
    throw new AppError(
      `Status must be one of: ${allowedStatuses.join(", ")}`,
      400
    );
  }
};

const validatePositiveNumber = (value, fieldName) => {
  if (Number.isNaN(Number(value)) || Number(value) < 0) {
    throw new AppError(`${fieldName} must be a valid non-negative number`, 400);
  }
};

module.exports = {
  isNonEmptyString,
  validateRequiredFields,
  validateEmail,
  validateRole,
  validateStatus,
  validatePositiveNumber
};
