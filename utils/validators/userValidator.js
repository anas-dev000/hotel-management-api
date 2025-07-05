const { body } = require("express-validator");
const validationMiddleware = require("../../middlewares/validatorMiddleware");
const { User, Hotel } = require("../../models");
const ApiError = require("../apiError");

const validateCreateUser = [
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
      if (user) return Promise.reject("This email is already in use");
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
  body("hotelId").custom(async (value, { req }) => {
    if (req.body.role === "receptionist" && !value) {
      throw new Error("Receptionist must have a hotelId");
    }

    if (value) {
      const hotel = await Hotel.findByPk(value);
      if (!hotel) {
        return Promise.reject("Invalid hotel ID");
      }
    }

    return true;
  }),
  validationMiddleware,
];

const validateUpdateUser = [
  body("name")
    .optional()
    .isString()
    .isLength({ min: 3, max: 100 })
    .withMessage("User name must be a string between 3 and 100 characters"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (value, { req }) => {
      const user = await User.findOne({ where: { email: value } });
      if (user && user.id !== req.params.id) {
        return Promise.reject("Email already in use");
      }
    }),
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
    .custom(async (value) => {
      if (value) {
        const hotel = await Hotel.findByPk(value);
        if (!hotel) {
          return Promise.reject("Invalid hotel ID");
        }
      }
    }),
  validationMiddleware,
];

module.exports = {
  validateCreateUser,
  validateUpdateUser,
};
