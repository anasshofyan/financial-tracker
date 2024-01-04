const sendResponse = (res, success, message, statusCode, data = {}) => {
  return res.status(statusCode).json({
    success,
    message,
    status_code: statusCode,
    data,
  });
};

module.exports = { sendResponse };
