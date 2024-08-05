const { AppError } = require("../Utils/appErrors");

const handleProdErr = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "Something went wrong!"
    });
  }
};

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path} parameter: ${err.value}`;

  return new AppError(message, 400);
};

const handleDuplicateErrorDB = err => {
  const value = Object.values(err.keyValue).toString();
  const message = `Duplicate '${value}' field value. Please input another value`;

  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const msgArr = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${msgArr.join(". ")}`;

  return new AppError(message, 400);
};

const handleUnBufferedRequest = () =>
  new AppError(
    "The server took too long to respond to your request. Check your internet connection and try again",
    504
  );

const unBufferedRequest = message => {
  const messageArr = message.split(" ");
  const unbuffered =
    messageArr.includes("buffering") &&
    messageArr.includes("timed") &&
    messageArr.includes("out");

  return unbuffered;
};

const handleJWTError = () =>
  new AppError("Invalid or malformed token. Please login again", 401);

const handleTokenExpiredError = () =>
  new AppError("Token expired. Please login again", 401);

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = `${err.statusCode}`.startsWith("4") ? "fail" : "error";

  if (process.env.NODE_ENV === "developement") {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      stack: err.stack,
      message: err.message
    });
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;

    if (err.name === "CastError") error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateErrorDB(err);
    if (err.name === "ValidationError") error = handleValidationErrorDB(err);
    if (err.name === "JsonWebTokenError") error = handleJWTError();
    if (err.name === "TokenExpiredError") error = handleTokenExpiredError();
    if (
      unBufferedRequest(err.message) ||
      err.reason.type === "ReplicaSetNoPrimary"
    )
      error = handleUnBufferedRequest();

    handleProdErr(error, res);
  }
};

module.exports = globalErrorHandler;
