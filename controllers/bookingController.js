const expressAsyncHandler = require("express-async-handler");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const sendEmail = require("../utils/sendEmail");
const AppError = require("../utils/apiError");
const APIFeatures = require("../utils/apiFeatures");
const { Booking, Room, User, sequelize } = require("../models");
const { sendBookingConfirmationEmail } = require("../services/emailService");
const { createStripeSession } = require("../services/paymentService");
const {
  isRoomAvailable,
  getAvailableRoomsBetweenDates,
} = require("../services/availableRoomsService");
const {
  checkGuestPermissions,
  checkReceptionistPermissions,
} = require("../utils/bookingAccessControl");

// Helper: Valid date check
const isValidDateRange = (checkIn, checkOut) => {
  return checkIn < checkOut && checkIn > new Date();
};

const createBooking = expressAsyncHandler(async (req, res, next) => {
  const { roomId, checkInDate, checkOutDate, paymentMethod } = req.body;
  const userId = req.user.id;

  // Start transaction
  const transaction = await sequelize.transaction();

  try {
    // 1) Lock the room row to avoid race conditions between users
    const room = await Room.findByPk(roomId, { lock: true, transaction });

    // 2) Make sure the room exists and is available
    if (!room) throw new AppError("Room not found", 404);

    // 3) Parse and validate check-in and check-out dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (!isValidDateRange(checkIn, checkOut)) {
      throw new AppError("Invalid check-in or check-out date", 400);
    }

    // 4) Double-check availability in the selected date range
    const isAvailable = await isRoomAvailable(roomId, checkIn, checkOut);
    if (!isAvailable) {
      throw new AppError("Room is not available for the selected dates", 400);
    }

    // 5) Create the booking with pending status
    const booking = await Booking.create(
      {
        userId,
        roomId,
        checkInDate,
        checkOutDate,
        paymentMethod,
        paymentStatus: "pending",
        status: "pending",
      },
      { transaction }
    );

    let paymentUrl = null;
    // 6) If card payment, generate Stripe checkout session
    if (paymentMethod === "card") {
      const session = await createStripeSession(booking, room, req);
      paymentUrl = session.url;

      // Store Stripe session ID
      await booking.update({ stripeSessionId: session.id }, { transaction });
    }

    // 7) Commit transaction — everything is okay
    await transaction.commit();

    // 8) Send confirmation email (not in transaction scope)
    await sendBookingConfirmationEmail({
      userEmail: req.user.email,
      roomName: room.name,
      checkInDate,
      checkOutDate,
      paymentMethod,
      paymentUrl,
    });

    res.status(201).json({
      status: "success",
      data: { booking },
      paymentUrl,
    });
  } catch (error) {
    // Rollback transaction in case of error
    await transaction.rollback();
    next(error);
  }
});

const getAllBookings = expressAsyncHandler(async (req, res, next) => {
  const features = new APIFeatures(req.query, "bookings")
    .filter()
    .search()
    .sort()
    .limitedFields()
    .paginate();

  // Restrict non-admins to their own bookings
  if (req.user.role === "guest") {
    features.queryOptions.where = {
      ...features.queryOptions.where,
      userId: req.user.id,
    };
  } else if (req.user.role === "receptionist") {
    features.queryOptions.include = [{ model: Room, attributes: ["hotelId"] }];
    features.queryOptions.where = {
      ...features.queryOptions.where,
      "$room.hotelId$": req.user.hotelId,
    };
  }
  const bookings = await features.execute(Booking);

  res.status(200).json({
    status: "success",
    results: bookings.length,
    pagination: features.paginationResult,
    data: { bookings },
  });
});

const updateBooking = expressAsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status, paymentStatus } = req.body;

  // 1) Get the booking and include Room to get hotelId
  const booking = await Booking.findByPk(id, {
    include: [{ model: Room, as: "room", attributes: ["hotelId"] }],
  });

  if (!booking) {
    return next(new AppError("No booking found with that ID", 404));
  }

  // 2) Role-based access control
  try {
    if (req.user.role === "guest") {
      checkGuestPermissions(req, booking);
    } else if (req.user.role === "receptionist") {
      checkReceptionistPermissions(req, booking);
    }
  } catch (error) {
    return next(error);
  }

  // 3) Update the booking
  await booking.update({ status, paymentStatus });

  // 4) Make the room available again if booking is cancelled
  if (status === "cancelled") {
    const room = await Room.findByPk(booking.roomId);
    if (room) {
      await room.update({ availability: true });
    }
  }

  res.status(200).json({
    status: "success",
    data: { booking },
  });
});

const getAvailableRooms = expressAsyncHandler(async (req, res, next) => {
  const { checkInDate, checkOutDate, hotelId } = req.body;

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  const { rooms, pagination } = await getAvailableRoomsBetweenDates(
    req,
    checkIn,
    checkOut,
    hotelId
  );

  res.status(200).json({
    status: "success",
    results: rooms.length,
    pagination,
    data: { rooms },
  });
});

// GET /api/v1/bookings/success?session_id=cs_test_abc123
const handlePaymentSuccess = expressAsyncHandler(async (req, res, next) => {
  const { session_id } = req.query;
  if (!session_id) {
    return next(new AppError("Session ID is required", 400));
  }

  const session = await stripe.checkout.sessions.retrieve(session_id);
  const booking = await Booking.findOne({
    where: { stripeSessionId: session_id },
  });

  if (!booking) {
    return next(new AppError("Booking not found", 404));
  }
  if (session.payment_status === "paid") {
    await booking.update({ paymentStatus: "paid", status: "confirmed" });

    const user = await User.findByPk(booking.userId);
    const email = user.email;

    await sendEmail({
      email,
      subject: "Payment Successful",
      message: `Your payment for booking ${booking.id} has been successful. Your booking is now confirmed.`,
    });

    return res.status(200).json({
      status: "success",
      data: { booking },
    });
  } else {
    return next(new AppError("Payment not completed yet", 400));
  }
});

const handlePaymentCancel = expressAsyncHandler(async (req, res, next) => {
  const { session_id } = req.query;

  if (!session_id) {
    return next(new AppError("Session ID is required", 400));
  }

  const booking = await Booking.findOne({
    where: { stripeSessionId: session_id },
  });
  if (!booking) {
    return next(new AppError("Booking not found", 404));
  }

  await booking.update({ paymentStatus: "failed", status: "cancelled" });
  await Room.update({ availability: true }, { where: { id: booking.roomId } });

  const user = await User.findByPk(booking.userId);
  const email = user.email;

  await sendEmail({
    email,
    subject: "Payment Cancelled",
    message: `Your payment for booking ${booking.id} was cancelled. The booking has been cancelled.`,
  });

  res.status(200).json({
    status: "success",
    message: "Booking cancelled",
  });
});

module.exports = {
  createBooking,
  getAllBookings,
  updateBooking,
  getAvailableRooms,
  handlePaymentSuccess,
  handlePaymentCancel,
};
