const sendSuccess = (res, statusCode, message, data) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const sendError = (res, statusCode, message, details = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    details
  });
};

module.exports = {
  sendSuccess,
  sendError
};
