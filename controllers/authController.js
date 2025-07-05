const expressAsyncHandler = require("express-async-handler");
const AppError = require("../utils/apiError");
const createToken = require("../utils/createToken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const { sendPasswordResetEmail } = require("../services/emailService");
const { User } = require("../models");
const { Op } = require("sequelize");

/*
- POST /api/auth/signup
  - Description: Register a new user (guest, admin, or receptionist).
  - Request Body: `{ name, email, password, phone, nationality, passportNumber, role, hotelId }`
  - Restricted To: Public (admin role restricted to existing admins)
  - Response: `{ status: "success", data: user, token }`
*/
const signup = expressAsyncHandler(async (req, res, next) => {
  if (!req.user) {
    if ("role" in req.body) delete req.body.role;
    req.body.role = "guest";
  }
  // Restrict admin role to existing admins
  if (req.body.role === "admin" && (!req.user || req.user.role !== "admin")) {
    return next(new AppError("Only admins can create admin users", 403));
  }

  const user = await User.create(req.body);

  // Generate JWT
  const token = createToken(user.id);

  res.status(201).json({
    status: "success",
    token,
    data: { user: { ...user.toJSON(), password: undefined } },
  });
});

/*
- POST /api/auth/login
  - Description: Log in a user.
  - Request Body: `{ email, password }`
  - Restricted To: Public
  - Response: `{ status: "success", token }`
*/
const login = expressAsyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ where: { email } });

  if (!user || !(await user.matchPassword(password))) {
    return next(new AppError("Invalid email or password", 401));
  }

  // Generate JWT
  const token = createToken(user.id);

  res.status(200).json({
    status: "success",
    token,
    data: { user: { ...user.toJSON(), password: undefined } },
  });
});

/*
- POST /api/auth/forgot-password
  - Description: Request a password reset code.
  - Request Body: `{ email }`
  - Restricted To: Public
  - Response: `{ status: "success", message: "Reset code sent to email" }`
*/
const forgotPassword = expressAsyncHandler(async (req, res, next) => {
  const { email } = req.body;

  // Check if user exists
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return next(new AppError("No user found with that email", 404));
  }

  // Generate reset code (6 digits for simplicity)
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  // Save reset code and expiry (10 minutes)
  await user.update({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: Date.now() + 10 * 60 * 1000,
    passwordResetVerified: false,
  });
  await user.save();

  try {
    await sendPasswordResetEmail({
      userEmail: user.email,
      resetCode,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();
    return next(new AppError("There is an error in sending email", 500));
  }

  // Finally, the response was sent successfully.
  res
    .status(200)
    .json({ status: "Success", message: "Reset code sent to email" });
});

/*
- POST /api/auth/verify-reset-code
  - Description: Verify the password reset code.
  - Request Body: `{ code }`
  - Restricted To: Public
  - Response: `{ status: "success", resetToken }`
*/
const verifyResetCode = expressAsyncHandler(async (req, res, next) => {
  const { code } = req.body;

  // Hash the provided code
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(code)
    .digest("hex");

  const user = await User.findOne({
    where: {
      passwordResetCode: hashedResetCode,
      passwordResetExpires: { [Op.gt]: Date.now() },
    },
  });

  if (!user) {
    return next(new AppError("Invalid or expired reset code", 400));
  }

  // Mark reset code as verified
  await user.update({ passwordResetVerified: true });

  // Generate reset token for password reset
  const resetToken = createToken(user.id);

  res.status(200).json({ status: "success", resetToken });
});

/*
- POST /api/auth/reset-password
  - Description: Reset password using a valid reset token.
  - Request Body: `{ newPassword }`
  - Restricted To: Authenticated user with verified reset code
  - Response: `{ status: "success", token }`
*/
const resetPassword = expressAsyncHandler(async (req, res, next) => {
  const { newPassword } = req.body;
  // 1) Get user based on token from auth middleware
  const user = req.user;

  // 2) Check if reset code verified
  if (!user.passwordResetVerified) {
    return next(
      new AppError(
        "The reset code has not been verified or the password has already been changed.",
        400
      )
    );
  }

  // 3) check if the new password is different from the old one.
  const isSamePassword = await user.matchPassword(newPassword);
  if (isSamePassword) {
    return next(
      new AppError("The new password must be different from the old one.", 400)
    );
  }

  user.password = newPassword;
  user.passwordResetCode = null;
  user.passwordResetExpires = null;
  user.passwordResetVerified = null;
  user.passwordChangedAt = new Date();

  await user.save();
  // 3) if everything is ok, generate token
  const newToken = createToken(user.id);

  res.status(200).json({
    status: "success",
    token: newToken,
    data: { user: { ...user.toJSON(), password: undefined } },
  });
});

module.exports = {
  signup,
  login,
  forgotPassword,
  verifyResetCode,
  resetPassword,
};
