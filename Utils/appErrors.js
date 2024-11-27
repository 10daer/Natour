class AppError extends Error {
  constructor(message, statusCode, Options = {}) {
    super(message);

    this.statusCode = statusCode || 500;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    Object.assign(this, Options);

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { AppError };
