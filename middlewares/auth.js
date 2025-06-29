const jwt = require("jsonwebtoken");
const AppError = require("../utils/apiError");
const { User } = require("../models");
const expressAsyncHandler = require("express-async-handler");

const protect = expressAsyncHandler(async (req, res, next) => {
  // 1) check if the authorization header is not existing
  const authHeader =
    req.headers["Authorization"] || req.headers["authorization"];
  if (!authHeader) {
    return next(new AppError("Authorization header is missing", 401));
  }

  // 2) check if the token is not existing
  const token = authHeader.split(" ")[1];
  if (!token) {
    return next(new AppError("Token is not provided", 401));
  }

  // 3) check if the token is valid
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  if (!decoded) {
    return next(new AppError("Invalid token", 401));
  }

  // 4) check if the user is not existing in token
  const user = await User.findByPk(decoded.id);
  if (!user) {
    return next(
      new AppError(
        "The user that belong to this token does no longer exist",
        401
      )
    );
  }

  // 5) Check if user change his password after token created
  if (user.passwordChangedAt) {
    const passChangedTimestamp = parseInt(
      user.passwordChangedAt.getTime() / 1000,
      10
    );
    // Password changed after token created (Error)
    if (passChangedTimestamp > decoded.iat) {
      return next(
        new AppError(
          "User recently changed his password. please login again..",
          401
        )
      );
    }
  }

  // 6) Check if user is active
  if (!user.isActive) {
    return next(
      new AppError(
        "Your account has been deactivated. Please log in again to reactivate your account.",
        401
      )
    );
  }

  req.user = user;
  next();
});

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

module.exports = { protect, restrictTo };
