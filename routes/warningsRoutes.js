const express = require("express");
const router = express.Router();
const warningsController = require("../controllers/warningsController");
const { protect, restrictTo } = require("../middlewares/auth");

router.use(protect);
router.post(
  "/:id/warnings",
  restrictTo("admin", "receptionist"),
  warningsController.addWarning
);
router.get(
  "/:id/warnings",
  restrictTo("admin", "receptionist"),
  warningsController.getWarnings
);

module.exports = router;
