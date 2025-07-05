const expressAsyncHandler = require("express-async-handler");
const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/apiError");
const { User } = require("../models");

/*
- GET /api/users
  - Description: Retrieve all users (admin only).
  - Query Params: `?role=admin&hotelId=uuid`
  - Restricted To: Admin
  - Response: `{ status: "success", results, pagination, data: users }`
*/

const getAllUsers = expressAsyncHandler(async (req, res, next) => {
  const features = new APIFeatures(req.query, "users")
    .filter()
    .search()
    .sort()
    .limitedFields()
    .paginate();
  const users = await features.execute(User);

  res.status(200).json({
    status: "success",
    results: users.length,
    pagination: features.paginationResult,
    data: { users },
  });
});

/*
- GET /api/v1/users/:id
  - Description: Retrieve a specific user by ID.
  - Path Params: id (user UUID)
  - Restricted To: Admin, Self (user accessing their own data)
  - Response: { status: "success", data: user }
*/

const getUser = expressAsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findByPk(id, {
    attributes: { exclude: ["password"] }, // Exclude password from response
  });
  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }
  // Check if the requester is the user themselves or an admin
  if (!req.user && req.user.id !== id && req.user.role !== "admin") {
    return next(AppError("You are not authorized to access this user", 403));
  }
  res.status(200).json({ status: "success", data: { user } });
});

/*
- POST /api/users
  - Description: Create a new user (admin only).
  - Request Body: `{ name, email, password, phone, role, hotelId }`
  - Restricted To: Admin
  - Response: `{ status: "success", data: user }`

*/

const createUser = expressAsyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);
  res.status(201).json({
    status: "success",
    data: { user: { ...user.toJSON(), password: undefined } }, // Exclude password
  });
});

/*
- PATCH /api/v1/users/:id
  - Description: Update a user's details.
  - Path Params: id (user UUID)
  - Request Body: { name, email, phone, nationality, passportNumber }
  - Restricted To: Admin, Self (user updating their own data)
  - Response: { status: "success", data: user }
*/

const updateUser = expressAsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findByPk(id);
  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  // Prevent non-admins from updating role or hotelId
  if (req.user.role !== "admin") {
    delete req.body.role;
    delete req.body.hotelId;
  }
  // Prevent updating password through this endpoint
  delete req.body.password;

  await user.update(req.body);
  res.status(200).json({
    status: "success",
    data: { user: { ...user.toJSON(), password: undefined } },
  });
});

/*
- DELETE /api/v1/users/:id
  - Description: Delete a user.
  - Path Params: id (user UUID)
  - Restricted To: Admin
  - Response: { status: "success", message: "User deleted" }
*/
const deleteUser = expressAsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findByPk(id);
  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  await user.destroy();
  res.status(200).json({
    status: "success",
    message: "User deleted",
  });
});

module.exports = {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
