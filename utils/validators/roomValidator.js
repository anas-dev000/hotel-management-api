const { body } = require("express-validator");
const validationMiddleware = require("../../middlewares/validatorMiddleware");
const Hotel = require("../../models");

const validateCreateRoom = [
  body("name")
    .notEmpty()
    .withMessage("Room name is required")
    .isString()
    .isLength({ min: 3, max: 100 })
    .withMessage("Room name must be a string between 3 and 100 characters"),
  body("description")
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),
  body("pricePerNight")
    .notEmpty()
    .withMessage("Price per night name is required")
    .isDecimal()
    .withMessage("Price must be a decimal number")
    .custom((value) => value >= 0)
    .withMessage("Price must be 0 or more"),
  body("roomType")
    .notEmpty()
    .withMessage("Room type is required")
    .isIn(["single", "double", "suite"])
    .withMessage("Room type must be one of: single, double, suite"),
  body("availability")
    .optional()
    .isBoolean()
    .withMessage("Availability must be true or false"),
  body("capacity")
    .notEmpty()
    .withMessage("Room capacity is required")
    .isInt({ min: 1 })
    .withMessage("Capacity must be a positive integer"),
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

  // Optional image fields
  body("imageCover")
    .optional()
    .isString()
    .withMessage("Image cover must be a string URL"),

  body("images")
    .optional()
    .isArray()
    .withMessage("Images must be an array of strings"),

  validationMiddleware,
];

const validateUpdateRoom = [
  body("name")
    .optional()
    .isString()
    .isLength({ min: 3, max: 100 })
    .withMessage("Room name must be a string between 3 and 100 characters"),
  body("description")
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),
  body("pricePerNight")
    .optional()
    .isDecimal()
    .withMessage("Price must be a decimal number")
    .custom((value) => value >= 0)
    .withMessage("Price must be 0 or more"),
  body("roomType")
    .optional()
    .isIn(["single", "double", "suite"])
    .withMessage("Room type must be one of: single, double, suite"),
  body("availability")
    .optional()
    .isBoolean()
    .withMessage("Availability must be true or false"),
  body("capacity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Capacity must be a positive integer"),
  body("hotelId")
    .optional()
    .isUUID()
    .withMessage("Hotel ID must be a valid UUID")
    .custom(async (hotelId) => {
      const hotel = await Hotel.findByPk(hotelId);
      if (!hotel) {
        return Promise.reject(`Hotel not found by ID: ${hotelId}`);
      }
    }),

  // Optional image fields
  body("imageCover")
    .optional()
    .isString()
    .withMessage("Image cover must be a string URL"),

  body("images")
    .optional()
    .isArray()
    .withMessage("Images must be an array of strings"),

  validationMiddleware,
];

module.exports = {
  validateCreateRoom,
  validateUpdateRoom,
};
