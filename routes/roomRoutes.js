const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const { protect, restrictTo } = require("../middlewares/auth");

const {
  validateCreateRoom,
  validateUpdateRoom,
} = require("../utils/validators/roomValidator");

// Public routes
router.get("/", roomController.getAllRooms);
router.get("/:id", roomController.getRoom);

// Admin-only routes
router.use(protect, restrictTo("admin"));
router.post("/", validateCreateRoom, roomController.createRoom);
router.patch("/:id", validateUpdateRoom, roomController.updateRoom);
router.delete("/:id", roomController.deleteRoom);

module.exports = router;
