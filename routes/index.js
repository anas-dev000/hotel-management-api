const testRoutes = require("./testRoutes");
const hotelRoutes = require("./hotelRoutes");
const roomRoutes = require("./roomRoutes");

const allRoutes = (app) => {
  app.use("/api/v1", testRoutes);
  app.use("/api/v1/hotels", hotelRoutes);
  app.use("/api/v1/rooms", roomRoutes);
};

module.exports = allRoutes;
