const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();
const { connectDB } = require("./config/dbConnection");

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

const globalError = require("./middlewares/globalErrorHandler");
const webhookController = require("./controllers/webhookController");

const app = express();

// Receive response from Stripe after successful payment.
// Stripe must deliver the body raw, not disassembled.
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  webhookController.stripeWebhookHandler
);

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//routes
const allRoutes = require("./routes");

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
allRoutes(app);

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

    // Start cron job after DB is connected
    require("./utils/clearUnpaidBookings");

    app.listen(port, () => console.log(`Server running on port ${port}!`));
  } catch (error) {
    console.error("Error starting server:", error.message);
    process.exit(1);
  }
};

startServer();
