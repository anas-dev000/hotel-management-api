const expressAsyncHandler = require("express-async-handler");
const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/apiError");
const { Hotel } = require("../models");

/*
- GET /api/hotels
  - Description: Retrieve all hotels with filtering and pagination.
  - Query Params: `?location=Miami&page=1&limit=10`
  - Restricted To: Public
  - Response: `{ status: "success", results, pagination, data: hotels }`
*/
const getAllHotels = expressAsyncHandler(async (req, res, next) => {
  const features = new APIFeatures(req.query)
    .filter()
    .search()
    .sort()
    .limitedFields()
    .paginate();

  const hotels = await features.execute(Hotel);

  res.status(200).json({
    status: "success",
    results: hotels.length,
    pagination: features.paginationResult,
    data: { hotels },
  });
});

/*
- GET /api/hotels/:id
  - Description: Retrieve a specific hotel by ID.
  - Path Params: `id` (hotel UUID)
  - Restricted To: Public
  - Response: `{ status: "success", data: hotel }`
*/
const getHotel = expressAsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const hotel = await Hotel.findByPk(id);
  if (!hotel) {
    return next(new AppError("No hotel found with that ID", 404));
  }
  res.status(200).json({ status: "success", data: { hotel } });
});

/*
- POST /api/hotels
  - Description: Create a new hotel.
  - Request Body: `{ name, description, location, imageCover, images, starRating }`
  - Restricted To: Admin
  - Response: `{ status: "success", data: hotel }`
*/
const createHotel = expressAsyncHandler(async (req, res, next) => {
  const hotel = await Hotel.create(req.body);
  res.status(201).json({
    status: "success",
    data: { hotel },
  });
});

/*
- PATCH /api/hotels/:id
  - Description: Update a hotel's details.
  - Path Params: `id` (hotel UUID)
  - Request Body: `{ name, description, location, starRating }`
  - Restricted To: Admin
  - Response: `{ status: "success", data: hotel }`
*/
const updateHotel = expressAsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const hotel = await Hotel.findByPk(id);
  if (!hotel) {
    return next(new AppError("No hotel found with that ID", 404));
  }

  await hotel.update(req.body);
  res.status(200).json({
    status: "success",
    data: { hotel },
  });
});

/*
- DELETE /api/hotels/:id
  - Description: Delete a hotel.
  - Path Params: `id` (hotel UUID)
  - Restricted To: Admin
  - Response: `{ status: "success", message: "Hotel deleted" }`
*/
const deleteHotel = expressAsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const hotel = await Hotel.findByPk(id);
  if (!hotel) {
    return next(new AppError("No hotel found with that ID", 404));
  }

  await hotel.destroy();
  res.status(200).json({
    status: "success",
    message: "Hotel deleted",
  });
});

module.exports = {
  createHotel,
  getHotel,
  updateHotel,
  deleteHotel,
  getAllHotels,
};
