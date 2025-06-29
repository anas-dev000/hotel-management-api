const rateLimit = require("express-rate-limit");

const resetPasswordLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: "Too many password reset attempts, please try again later.",
  keyGenerator: (req) => req.user?.id || req.ip,
});

module.exports = resetPasswordLimiter;

/**
 * This file sets up a rate limiter middleware for the "Reset Password" API route.
 *
 * Purpose:
 * - To protect the reset password endpoint from brute-force attacks.
 * - It limits each user (by user ID if authenticated, or IP address otherwise)
 *   to a maximum of 5 reset attempts within a 10-minute window.
 *
 * If the limit is exceeded, the user receives a 429 error with a clear message.
 *
 * Usage:
 * - Apply this middleware on the reset password route in your router file.
 *
 * Example:
 * router.patch("/resetPassword", protect, resetPasswordLimiter, resetPassword);
 */
