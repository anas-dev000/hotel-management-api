const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect, restrictTo } = require("../middlewares/auth");
const { User } = require("../models");

const {
  validateCreateUser,
  validateUpdateUser,
} = require("../utils/validators/userValidator");
const expressAsyncHandler = require("express-async-handler");

// Restricted To: Admin
router.get("/", protect, restrictTo("admin"), userController.getAllUsers);

// Admin or receptionist routes
router.post(
  "/",
  protect,
  restrictTo("admin", "receptionist"),
  validateCreateUser,
  userController.createUser
);

// Restricted To: Admin, Self (user accessing their own data)
router.get(
  "/:id",
  protect,
  restrictTo("admin", "user"),
  userController.getUser
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
