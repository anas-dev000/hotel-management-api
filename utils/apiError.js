class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    // Remove constructor stack trace from the error stack
    // so logs point to the original error location in your code
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
