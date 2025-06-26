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

module.exports = router;
