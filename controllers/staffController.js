const expressAsyncHandler = require("express-async-handler");
const { User, Hotel } = require("../models");
const AppError = require("../utils/apiError");
const APIFeatures = require("../utils/apiFeatures");
const { sendPasswordResetEmail } = require("../services/emailService");
const crypto = require("crypto");
const { Op } = require("sequelize");


const createStaff = expressAsyncHandler(async (req, res, next) => {
  const { name, email, role, hotelId } = req.body;

  // Generate and hash reset code
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  try {
    const staff = await User.create({
      name,
      email,
      role,
      hotelId,
      password: resetCode + 22,
      passwordResetCode: hashedResetCode,
      passwordResetExpires: Date.now() + 10 * 60 * 1000,
      isActive: true,
    });

    // Try to send email twice
    for (let i = 0; i < 2; i++) {
      try {
        await sendPasswordResetEmail({ userEmail: email, resetCode });
        break; // success
      } catch (err) {
        if (i === 1) {
          await staff.destroy();
          return next(new AppError("Failed to send reset code email", 500));
        }
      }
    }

    res.status(201).json({
      status: "success",
      data: { staff },
    });
  } catch (err) {
    console.error("Error creating staff:", err.message);
    return next(new AppError("Something went wrong while creating staff", 500));
  }
});

const getAllStaff = expressAsyncHandler(async (req, res, next) => {
  const features = new APIFeatures(req.query, "users")
    .filter()
    .sort()
    .limitedFields()
    .paginate();

  // Restrict receptionist to their hotel's staff
  if (req.user.role === "receptionist") {
    features.queryOptions.where = {
      ...features.queryOptions.where,
      hotelId: req.user.hotelId,
      role: { [Op.in]: ["receptionist"] },
      isActive: true,
    };
  } else {
    features.queryOptions.where = {
      ...features.queryOptions.where,
      role: { [Op.in]: ["receptionist"] },
      isActive: true,
    };
  }
  features.queryOptions = {
    ...features.queryOptions,
    attributes: {
      exclude: ["password"], // Exclude password from response
    },
  };
  const staff = await features.execute(User);

  res.status(200).json({
    status: "success",
    results: staff.length,
    pagination: features.paginationResult,
    data: { staff },
  });
});

const getStaff = expressAsyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const staff = await User.findByPk(id, {
    attributes: { exclude: ["password"] },
  });

  if (!staff) {
    return next(new AppError("No user found with that ID", 404));
  }

  // Check authorization
  if (
    !req.user ||
    (req.user.role === "receptionist" && req.user.hotelId !== staff.hotelId) ||
    !["admin", "receptionist"].includes(req.user.role)
  ) {
    return next(
      new AppError("You are not authorized to access this user", 403)
    );
  }

  res.status(200).json({ status: "success", data: { staff } });
});

const updateStaff = expressAsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const allowedFields = [
    "name",
    "hotelId",
    "phone",
    "nationality",
    "passportNumber",
    "isActive",
  ];
  const updateData = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  const staff = await User.findByPk(id);
  if (!staff || !["receptionist"].includes(staff.role)) {
    return next(new AppError("Staff not found or inactive", 404));
  }

  // Validate hotel if provided
  if (req.body.hotelId) {
    const hotel = await Hotel.findByPk(req.body.hotelId);
    if (!hotel) {
      return next(new AppError("Hotel not found", 404));
    }
  }

  await staff.update(updateData);
  res.status(200).json({
    status: "success",
    data: { staff },
  });
});

const deactivateStaff = expressAsyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const staff = await User.findByPk(id);

  if (!staff || !staff.isActive || !["receptionist"].includes(staff.role)) {
    return next(new AppError("Staff not found or inactive", 404));
  }

  await staff.update({ isActive: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

module.exports = {
  createStaff,
  getAllStaff,
  getStaff,
  updateStaff,
  deactivateStaff,
};
