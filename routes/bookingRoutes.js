const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { protect, restrictTo } = require("../middlewares/auth");
const {
  validateCreateBooking,
  validateUpdateBooking,
  validateGetAvailableRooms,
} = require("../utils/validators/bookingValidator");

// Public routes
router.get("/available-rooms", validateGetAvailableRooms, bookingController.getAvailableRooms);
router.get("/success", bookingController.handlePaymentSuccess);
router.get("/cancel", bookingController.handlePaymentCancel);

// Authenticated routes
router.use(protect);
router.post(
  "/",
  validateCreateBooking,
  restrictTo("guest"),
  bookingController.createBooking
);
router.get(
  "/",
  restrictTo("admin", "receptionist", "guest"),
  bookingController.getAllBookings
);
router.patch("/:id", validateUpdateBooking, bookingController.updateBooking);

module.exports = router;
