const ApiError = require("../utils/apiError");

const sendForDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendForProd = (err, res) => {
  if (!err.isOperational) {
    console.error("UNEXPECTED ERROR:", err);
    return res.status(500).json({
      status: "error",
      message: "Something went wrong, please try again later.",
    });
  }

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (err.name === "SequelizeValidationError") {
    err = new ApiError(err.errors[0].message, 400);
  }
  if (err.name === "SequelizeUniqueConstraintError") {
    err = new ApiError("Duplicate field value entered", 400);
  }

  if (process.env.NODE_ENV === "development") {
    sendForDev(err, res);
  } else {
    sendForProd(err, res);
  }
};

module.exports = globalError;