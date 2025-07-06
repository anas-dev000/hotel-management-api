const { body, param } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const { User, Hotel } = require("../../models");

exports.createStaffValidator = [
  body("name")
    .notEmpty()
    .withMessage("Staff name is required")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters"),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (value) => {
      const user = await User.findOne({
        where: { email: value.toLowerCase() },
      });
      if (user) {
        return Promise.reject("Email already in use");
      }
    }),

  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(["receptionist", "admin"])
    .withMessage("Role must be either 'admin' or 'receptionist'"),

  body("hotelId")
    .notEmpty()
    .withMessage("Hotel ID is required")
    .isUUID()
    .withMessage("Hotel ID must be a valid UUID")
    .custom(async (hotelId) => {
      const hotel = await Hotel.findByPk(hotelId);
      if (!hotel) {
        return Promise.reject(`Hotel not found by ID: ${hotelId}`);
      }
    }),

  validatorMiddleware,
];

exports.updateStaffValidator = [
  param("id").isUUID().withMessage("Invalid staff ID"),

  body("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters"),

  body("hotelId").optional().isUUID().withMessage("Invalid hotel ID format"),

  body("phone")
    .optional()
    .isMobilePhone("any")
    .withMessage("Invalid phone number"),

  body("nationality")
    .optional()
    .isString()
    .withMessage("Nationality must be a string"),

  body("passportNumber")
    .optional()
    .isString()
    .withMessage("Passport number must be a string"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be true or false"),

  validatorMiddleware,
];
