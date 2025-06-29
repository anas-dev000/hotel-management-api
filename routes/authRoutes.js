const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

const {
  validateSignup,
  validateLogin,
  validateForgotPassword,
  validateVerifyResetCode,
  validateResetPassword,
} = require("../utils/validators/authValidator");

const { protect } = require("../middlewares/auth");
const resetPasswordLimiter = require("../utils/resetPasswordLimiter");

// Public routes
router.post("/signup", validateSignup, authController.signup);
router.post("/login", validateLogin, authController.login);
router.post(
  "/forgot-password",
  validateForgotPassword,
  authController.forgotPassword
);
router.post(
  "/verify-reset-code",
  validateVerifyResetCode,
  authController.verifyResetCode
);
router.patch(
  "/reset-password",
  protect,
  resetPasswordLimiter,
  validateResetPassword,
  authController.resetPassword
);
module.exports = router;
