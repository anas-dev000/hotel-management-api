const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect, restrictTo } = require("../middlewares/auth");

const {
  validateCreateUser,
  validateUpdateUser,
} = require("../utils/validators/userValidator");

// Restricted To: Admin
router.get("/", protect, restrictTo("admin"), userController.getAllUsers);

// Restricted To: Admin, Self (user accessing their own data)
router.get(
  "/:id",
  protect,
  restrictTo("admin", "user"),
  userController.getUser
);

// Admin or receptionist routes
router.post(
  "/",
  protect,
  restrictTo("admin", "receptionist"),
  validateCreateUser,
  userController.createUser
);
router.patch(
  "/:id",
  protect,
  restrictTo("admin", "user"),
  validateUpdateUser,
  userController.updateUser
);
router.delete("/:id", protect, restrictTo("admin"), userController.deleteUser);

module.exports = router;
