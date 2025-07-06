module.exports = {
  rooms: [
    "location",
    "starRating",
    "name",
    "description",
    "roomType",
    "availability",
    "pricePerNight",
    "capacity",
    "hotelId",
  ],
  bookings: ["userId", "roomId", "status", "checkInDate", "checkOutDate"],
  users: ["name", "email", "role", "hotelId", "isActive"],
  hotels: ["location", "starRating", "name"],
};
