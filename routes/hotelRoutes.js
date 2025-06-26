const express = require("express");
const router = express.Router();
const hotelController = require("../controllers/hotelController");
//const { protect, restrictTo } = require("../middlewares/auth");
const {
  validateCreateHotel,
  validateUpdateHotel,
} = require("../utils/validators/hotelValidator");

// Public routes
router.get("/", hotelController.getAllHotels);
router.get("/:id", hotelController.getHotel);

// Admin-only routes
//router.use(protect, restrictTo("admin"));
router.post("/", validateCreateHotel, hotelController.createHotel);
router.patch("/:id", validateUpdateHotel, hotelController.updateHotel);
router.delete("/:id", hotelController.deleteHotel);

/*
 Hotel Endpoints
- GET /api/v1/hotels
  - Description: Retrieve all hotels with filtering, sorting, and pagination.
  - Query Params: ?location=Miami&starRating[gte]=4&sort=name&fields=name,location&page=1&limit=10
  - Restricted To: Public
  - Response: { status: "success", results, pagination, data: hotels }

- POST /api/v1/hotels
  - Description: Create a new hotel.
  - Request Body: { name, description, location, imageCover, images, starRating }
  - Restricted To: Admin
  - Response: { status: "success", data: hotel }

- GET /api/v1/hotels/:id
  - Description: Retrieve a specific hotel by ID.
  - Path Params: id (hotel UUID)
  - Restricted To: Public
  - Response: { status: "success", data: hotel }

- PATCH /api/v1/hotels/:id
  - Description: Update a hotel's details.
  - Path Params: id (hotel UUID)
  - Request Body: { name, description, location, starRating }
  - Restricted To: Admin
  - Response: { status: "success", data: hotel }

- DELETE /api/v1/hotels/:id
  - Description: Delete a hotel.
  - Path Params: id (hotel UUID)
  - Restricted To: Admin
  - Response: { status: "success", message: "Hotel deleted" }
*/

module.exports = router;
