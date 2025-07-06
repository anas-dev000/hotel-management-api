const expressAsyncHandler = require("express-async-handler");
const { User } = require("../models");
const AppError = require("../utils/apiError");
const { sendWarningEmail } = require("../services/emailService");

const addWarning = expressAsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;

  const user = await User.findByPk(id);
  if (!user || !user.isActive || user.role !== "guest") {
    return next(new AppError("Guest not found or inactive", 404));
  }

  // Increment warnings
  const newWarningsCount = user.warnings + 1;
  const updateData = { warnings: newWarningsCount };

  // Auto-deactivate if warnings reach 3
  if (newWarningsCount >= 3) {
    updateData.isActive = false;
  }

  await user.update(updateData);

  // Send email notification
  try {
    await sendWarningEmail({
      userEmail: user.email,
      reason,
      warningsCount: newWarningsCount,
    });
  } catch (error) {
    return next(
      new AppError(
        "Failed to send warning email, the operation failed. Try again.",
        500
      )
    );
  }
  await user.update(updateData);

  res.status(200).json({
    status: "success",
    data: { warnings: newWarningsCount },
  });
});

const getWarnings = expressAsyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findByPk(id, {
    attributes: ["id", "name", "email", "warnings", "isActive", "role"],
  });
  if (!user || !user.isActive || user.role !== "guest") {
    return next(new AppError("Guest not found or inactive", 404));
  }

  res.status(200).json({
    status: "success",
    data: { name: user.name, email: user.email, warnings: user.warnings },
  });
});

module.exports = { addWarning, getWarnings };
