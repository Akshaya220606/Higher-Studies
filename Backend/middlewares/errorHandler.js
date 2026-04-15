const AppError = require("../utils/appError");
const { sendError } = require("../utils/responseHandler");

const notFoundHandler = (req, res, next) => {
  next(new AppError("Route not found", 404));
};

const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";

  if (process.env.NODE_ENV !== "production") {
    console.error(error);
  }

  return sendError(
    res,
    statusCode,
    message,
    process.env.NODE_ENV === "production" ? null : error.stack
  );
};

module.exports = {
  notFoundHandler,
  errorHandler
};
