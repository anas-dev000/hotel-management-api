const testRoutes = require("./testRoutes");
const hotelRoutes = require("./hotelRoutes");
const roomRoutes = require("./roomRoutes");
const userRoutes = require("./userRoutes");
const authRoutes = require("./authRoutes");

const allRoutes = (app) => {
  app.use("/api/v1", testRoutes);
  app.use("/api/v1/hotels", hotelRoutes);
  app.use("/api/v1/rooms", roomRoutes);
  app.use("/api/v1/users", userRoutes);
  app.use("/api/v1/auth", authRoutes);
};

module.exports = allRoutes;
