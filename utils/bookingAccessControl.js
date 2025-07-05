const AppError = require("./apiError");

exports.checkGuestPermissions = (req, booking) => {
  // Ensure the logged-in user is the owner of the booking
  if (booking.userId !== req.user.id) {
    throw new AppError("You are not authorized to update this booking", 403);
  }

  // Guests are only allowed to cancel their bookings, not change to any other status
  if (req.body.status && req.body.status !== "cancelled") {
    throw new AppError("Guests can only cancel their bookings", 403);
  }

  // Guests are not allowed to manually change payment status
  if (req.body.paymentStatus) {
    throw new AppError("Guests are not allowed to change payment status", 403);
  }
};

exports.checkReceptionistPermissions = (req, booking) => {
  const { status, paymentStatus } = req.body;

  // The receptionist is not allowed to modify the data of a customer who is not from the hotel he works for.
  if (booking.room.hotelId !== req.user.hotelId) {
    throw new AppError("You are not authorized to update this booking", 403);
  }

  // Payment modification is not allowed if the payment method is card
  if (paymentStatus && booking.paymentMethod === "card") {
    throw new AppError(
      "You cannot manually change payment status for card bookings",
      403
    );
  }

  // Changing the status from "cancelled" to "confirmed" is not allowed
  if (booking.status === "cancelled" && status === "confirmed") {
    throw new AppError("Only admins can reactivate a cancelled booking", 403);
  }

  // Modification of reservation is not allowed after the customer has checked-out
  if (booking.status === "checked-out") {
    throw new AppError(
      "You cannot update a booking that has already been checked out",
      403
    );
  }
};
