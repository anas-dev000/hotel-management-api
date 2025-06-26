const validationMiddleware = require("../../middlewares/validatorMiddleware");
const { body } = require("express-validator");

const validateCreateHotel = [
  body("name")
    .notEmpty()
    .withMessage("Hotel name is required")
    .isString()
    .isLength({ min: 3, max: 100 })
    .withMessage("Hotel name must be a string between 3 and 100 characters"),
  body("location").isString().notEmpty().withMessage("Location is required"),
  body("description")
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),
  body("starRating")
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage("Star rating must be between 1 and 5"),
  body("imageCover")
    .optional()
    .isString()
    .withMessage("Image cover must be a valid URL"),
  body("images")
    .optional()
    .isArray()
    .withMessage("Images must be an array of URLs"),
  validationMiddleware,
];

const validateUpdateHotel = [
  body("name")
    .optional()
    .isString()
    .isLength({ min: 3, max: 100 })
    .withMessage("Hotel name must be a string between 3 and 100 characters"),
  body("location").optional().isString(),
  body("description")
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),
  body("starRating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Star rating must be between 1 and 5"),
  body("imageCover")
    .optional()
    .isString()
    .withMessage("Image cover must be a valid URL"),
  body("images")
    .optional()
    .isArray()
    .withMessage("Images must be an array of URLs"),
  validationMiddleware,
];

module.exports = {
  validateCreateHotel,
  validateUpdateHotel,
};
