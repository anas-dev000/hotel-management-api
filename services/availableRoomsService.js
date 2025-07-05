const { Booking, Room } = require("../models");
const { Op } = require("sequelize");
const APIFeatures = require("../utils/apiFeatures");

const dateOverlapCondition = (checkIn, checkOut) => ({
  [Op.or]: [
    // Booking starts during the period
    { checkInDate: { [Op.between]: [checkIn, checkOut] } },
    // Reservation expires within the period
    { checkOutDate: { [Op.between]: [checkIn, checkOut] } },
    {
      [Op.and]: [
        // Booking started before check-in and still in progress after check-out
        { checkInDate: { [Op.lte]: checkIn } },
        { checkOutDate: { [Op.gte]: checkOut } },
      ],
    },
  ],
});

// Returns true if room is available, false if conflict found
exports.isRoomAvailable = async (roomId, checkIn, checkOut) => {
  const conflict = await Booking.findOne({
    where: {
      roomId,
      status: { [Op.notIn]: ["cancelled", "checked-out"] },
      ...dateOverlapCondition(checkIn, checkOut),
    },
  });

  return !conflict; // true = available, false = not available
};

exports.getAvailableRoomsBetweenDates = async (
  req,
  checkIn,
  checkOut,
  hotelId = null
) => {
  const bookings = await Booking.findAll({
    attributes: ["roomId"],
    where: {
      status: { [Op.notIn]: ["cancelled", "checked-out"] },
      ...dateOverlapCondition(checkIn, checkOut),
    },
  });

  const bookedRoomIds = bookings.map((booking) => booking.roomId);

  // Step 1: Set up the initial filter to be added to APIFeatures
  const initialWhere = {
    id: { [Op.notIn]: bookedRoomIds },
    availability: true,
    ...(hotelId && { hotelId }),
  };

  const features = new APIFeatures(req.query, "rooms")
    .filter()
    .search()
    .sort()
    .limitedFields()
    .paginate();

  // Step 3: Merge initialWhere with filters coming from APIFeatures
  features.queryOptions.where = {
    ...initialWhere,
    ...(features.queryOptions.where || {}),
  };

  const rooms = await features.execute(Room);
  return { rooms, pagination: features.paginationResult };
};
