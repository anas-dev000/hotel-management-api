const expressAsyncHandler = require("express-async-handler");
const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/apiError");
const { Room } = require("../models/Room");

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

    
});
