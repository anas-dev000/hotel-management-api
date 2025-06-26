const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();
const { connectDB } = require("./config/dbConnection");
const testRoutes = require("./routes/testRoutes");
const hotelRoutes = require("./routes/hotelRoutes");
const globalError = require("./middlewares/globalErrorHandler");

const app = express();

// Middleware for logging
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
  console.log("Development mode: morgan logging enabled");
}

// Middleware for security and performance
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "20kb" }));

// Rate limiting to prevent abuse
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests, please try again later.",
  })
);

// Test route
app.get("/", (req, res) => res.send("Welcome to Hotel Management API!"));
app.use("/api/v1/hotels", hotelRoutes);
app.use("/api/v1", testRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

// Global error handling middleware
app.use(globalError);

// Database configuration
const startServer = async () => {
  const port = process.env.PORT || 3000;
  try {
    await connectDB();
    app.listen(port, () => console.log(`Server running on port ${port}!`));
  } catch (error) {
    console.error("Error starting server:", error.message);
    process.exit(1);
  }
};

startServer();
