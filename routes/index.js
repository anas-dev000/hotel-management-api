const testRoutes = require("./testRoutes");
const hotelRoutes = require("./hotelRoutes");
const roomRoutes = require("./roomRoutes");
const userRoutes = require("./userRoutes");
const authRoutes = require("./authRoutes");
const bookingRoutes = require("./bookingRoutes");
const staffRoutes = require("./staffRoutes");
const warningsRoutes = require("./warningsRoutes");

const allRoutes = (app) => {
  app.use("/api/v1", testRoutes);
  app.use("/api/v1/hotels", hotelRoutes);
  app.use("/api/v1/rooms", roomRoutes);
  app.use("/api/v1/users", userRoutes);
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/bookings", bookingRoutes);
  app.use("/api/v1/staff", staffRoutes);
  app.use("/api/v1/users", warningsRoutes);
};

module.exports = allRoutes;
