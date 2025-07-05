const { body } = require("express-validator");
const validationMiddleware = require("../../middlewares/validatorMiddleware");
const { Hotel, Room } = require("../../models");
const AppError = require("../../utils/apiError");

const validateCreateBooking = [
  body("roomId")
    .notEmpty()
    .withMessage("Room ID is required")
    .isUUID()
    .withMessage("Room ID must be a valid UUID")
    .custom(async (roomId) => {
      const room = await Room.findByPk(roomId);
      if (!room) {
        return Promise.reject(`Room not found with ID: ${roomId}`);
      }
    }),

  body("checkInDate")
    .notEmpty()
    .withMessage("Check-in date is required")
    .isISO8601()
    .withMessage("Check-in date must be a valid ISO 8601 date"),

  body("checkOutDate")
    .notEmpty()
    .withMessage("Check-out date is required")
    .isISO8601()
    .withMessage("Check-out date must be a valid ISO 8601 date")
    .custom((checkOutDate, { req }) => {
      const checkInDate = new Date(req.body.checkInDate);
      const checkOut = new Date(checkOutDate);

      if (checkOut <= checkInDate) {
        throw new AppError("Check-out date must be after check-in date", 400);
      }

      if (checkInDate < new Date()) {
        throw new AppError("Check-in date must be in the future", 400);
      }

      return true;
    }),

  body("paymentMethod")
    .notEmpty()
    .withMessage("Payment method is required")
    .isIn(["card", "cash"])
    .withMessage("Payment method must be either 'card' or 'cash'"),

  validationMiddleware,
];

const validateUpdateBooking = [
  body("status")
    .optional()
    .isIn(["confirmed", "pending", "cancelled", "checked-in", "checked-out"])
    .withMessage("Invalid status"),

  body("paymentStatus")
    .optional()
    .isIn(["pending", "paid", "failed"])
    .withMessage("Invalid payment status"),

  validationMiddleware,
];

const validateGetAvailableRooms = [
  body("checkInDate")
    .notEmpty()
    .withMessage("Check-in date is required")
    .isISO8601()
    .withMessage("Check-in date must be a valid ISO 8601 date"),

  body("checkOutDate")
    .notEmpty()
    .withMessage("Check-out date is required")
    .isISO8601()
    .withMessage("Check-out date must be a valid ISO 8601 date")
    .custom((checkOutDate, { req }) => {
      const checkIn = new Date(req.body.checkInDate);
      const checkOut = new Date(checkOutDate);

      if (checkIn >= checkOut) {
        throw new AppError("Check-out must be after check-in", 400);
      }
      if (checkIn < new Date()) {
        throw new AppError("Check-in date must be in the future", 400);
      }

      return true;
    }),

  body("hotelId")
    .optional()
    .isUUID()
    .withMessage("Hotel ID must be a valid UUID")
    .custom(async (hotelId) => {
      const hotel = await Hotel.findByPk(hotelId);
      if (!hotel) {
        return Promise.reject("Hotel not found");
      }
    }),

  validationMiddleware,
];

module.exports = {
  validateCreateBooking,
  validateUpdateBooking,
  validateGetAvailableRooms,
};
