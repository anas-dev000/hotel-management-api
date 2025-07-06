const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staffController");
const { protect, restrictTo } = require("../middlewares/auth");
const {
  createStaffValidator,
  updateStaffValidator,
} = require("../utils/validators/staffValidator");

router.use(protect);
router.post(
  "/",
  restrictTo("admin"),
  createStaffValidator,
  staffController.createStaff
);
router.get(
  "/",
  restrictTo("admin", "receptionist"),
  staffController.getAllStaff
);

router.get(
  "/:id",
  protect,
  restrictTo("admin", "receptionist"),
  staffController.getStaff
);

router.patch(
  "/:id",
  restrictTo("admin"),
  updateStaffValidator,
  staffController.updateStaff
);
router.delete("/:id", restrictTo("admin"), staffController.deactivateStaff);

module.exports = router;
