const expressAsyncHandler = require("express-async-handler");
const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/apiError");
const Room = require("../models/Room");

/*
- GET /api/rooms
  - Description: Retrieve all rooms with filtering, sorting, and pagination.
  - Query Params: `?hotelId=uuid&roomType=single&pricePerNight[gte]=100&page=1&limit=10`
  - Restricted To: Public
  - Response: `{ status: "success", results, pagination, data: rooms }`

*/
const getAllRooms = expressAsyncHandler(async (req, res, next) => {
  const features = new APIFeatures(req.query)
    .filter()
    .search()
    .sort()
    .limitedFields()
    .paginate();

  const rooms = await features.execute(Room);
  res.status(200).json({
    status: "success",
    results: rooms.length,
    pagination: features.paginationResult,
    data: { rooms },
  });
});

/*
- GET /api/rooms/:id
  - Description: Retrieve a specific room by ID.
  - Path Params: `id` (room UUID)
  - Restricted To: Public
  - Response: `{ status: "success", data: room }`
*/

const getRoom = expressAsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const room = await Room.findByPk(id);
  if (!room) {
    return next(new AppError("No room found with that ID", 404));
  }
  res.status(200).json({ status: "success", data: { room } });
});

/*
- POST /api/rooms
  - Description: Create a new room (includes image upload).
  - Request Body: `{ name, description, pricePerNight, roomType, hotelId, imageCover, images }`
  - Restricted To: Admin, Receptionist
  - Response: `{ status: "success", data: room }`
*/

const createRoom = expressAsyncHandler(async (req, res, next) => {
  const room = await Room.create(req.body);

  res.status(201).json({
    status: "success",
    data: { room },
  });
});

/*
- PATCH /api/rooms/:id
  - Description: Update a room's details.
  - Path Params: `id` (room UUID)
  - Request Body: `{ name, description, pricePerNight, roomType, availability }`
  - Restricted To: Admin, Receptionist
  - Response: `{ status: "success", data: room }`
*/

const updateRoom = expressAsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const room = await Room.findByPk(id);
  if (!room) {
    return next(new AppError("No room found with that ID", 404));
  }

  await room.update(req.body);
  res.status(200).json({ status: "success", data: { room } });
});

/*
- DELETE /api/rooms/:id
  - Description: Delete a room.
  - Path Params: `id` (room UUID)
  - Restricted To: Admin
  - Response: `{ status: "success", message: "Room deleted" }`
*/

const deleteRoom = expressAsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const room = await Room.findByPk(id);
  if (!room) {
    return next(new AppError("No room found with that ID", 404));
  }

  await room.destroy();
  res.status(200).json({
    status: "success",
    message: "Room deleted",
  });
});

module.exports = { getAllRooms, getRoom, createRoom, updateRoom, deleteRoom };
