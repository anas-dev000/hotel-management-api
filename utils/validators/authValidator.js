const { body } = require("express-validator");
const validationMiddleware = require("../../middlewares/validatorMiddleware");
const { User, Hotel } = require("../../models");

const validateSignup = [
  body("name")
    .notEmpty()
    .withMessage("User name is required")
    .isString()
    .isLength({ min: 3, max: 100 })
    .withMessage("User name must be a string between 3 and 100 characters"),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (value) => {
      const user = await User.findOne({ where: { email: value } });
      if (user) {
        return Promise.reject("Email already in use");
      }
    }),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("phone").optional().isString().withMessage("Phone must be a string"),
  body("nationality")
    .optional()
    .isString()
    .withMessage("Nationality must be a string"),
  body("passportNumber")
    .optional()
    .isString()
    .withMessage("Passport number must be a string"),
  body("role")
    .optional()
    .isIn(["guest", "admin", "receptionist"])
    .withMessage("Role must be one of: guest, admin, receptionist"),
  body("hotelId")
    .optional()
    .isUUID()
    .withMessage("Hotel ID must be a valid UUID")
    .custom(async (value, { req }) => {
      if (value && req.body.role === "receptionist") {
        const hotel = await Hotel.findByPk(value);
        if (!hotel) {
          return Promise.reject("Invalid hotel ID");
        }
      }
      if (req.body.role === "receptionist" && !value) {
        return Promise.reject("Hotel ID is required for receptionist role");
      }
    }),
  validationMiddleware,
];

const validateLogin = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  validationMiddleware,
];

const validateForgotPassword = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),
  validationMiddleware,
];

const validateVerifyResetCode = [
  body("code")
    .notEmpty()
    .withMessage("Reset code is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("Reset code must be 6 digits")
    .isNumeric()
    .withMessage("Reset code must be numeric"),
  validationMiddleware,
];

const validateResetPassword = [
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters"),

  body("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation required")
    .custom((val, { req }) => {
      if (val !== req.body.newPassword) {
        throw new Error("Password Confirmation incorrect");
      }
      return true;
    }),
  validationMiddleware,
];

module.exports = {
  validateSignup,
  validateLogin,
  validateForgotPassword,
  validateVerifyResetCode,
  validateResetPassword,
};
